#!/usr/bin/env node
/**
 * 前端会话回归：运行真实请求封装，在内存中模拟 fetch、localStorage 和页面跳转。
 * 运行：node --test scripts/test-session-guard.cjs（先安装 web 依赖）。
 * 使用 Vite 已有的 esbuild 编译 TypeScript；不访问网络，也不写入构建产物。
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { buildSync } = require('../web/node_modules/esbuild');

const bundled = buildSync({
  stdin: {
    contents: `
      export * from './sessionGuard';
      export * from './userAuth';
      export * from './adminApi';
      export { api } from './api';
    `,
    resolveDir: path.resolve(__dirname, '../web/src'),
    loader: 'ts',
  },
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  define: { 'import.meta.env.VITE_ADMIN_API_BASE': 'undefined' },
  write: false,
}).outputFiles[0].text;

function createBrowser(pathname = '/dashboard') {
  const storage = new Map();
  const requests = [];
  const responses = [];
  const redirects = [];
  const module = { exports: {} };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  const window = {
    location: { pathname, replace: (target) => redirects.push(target) },
    setTimeout,
    clearTimeout,
  };
  vm.runInNewContext(bundled, {
    module,
    exports: module.exports,
    localStorage,
    window,
    Headers,
    FormData,
    AbortController,
    DOMException,
    fetch: async (url, init) => {
      requests.push({ url, init });
      if (!responses.length) throw new Error(`未设置请求响应：${url}`);
      return responses.shift();
    },
  });
  const respond = (status, data = {}) => responses.push(new Response(
    JSON.stringify(status === 200 ? { code: 200, data } : { detail: '凭证失效' }),
    { status, headers: { 'Content-Type': 'application/json' } },
  ));
  return { ...module.exports, localStorage, window, requests, redirects, respond };
}

for (const scope of ['user', 'admin']) {
  test(`${scope} 凭证失效只阻止本端请求，另一端仍可正常使用`, async () => {
    const browser = createBrowser();
    browser.userToken.set('user-token');
    browser.adminToken.set('admin-token');
    const ownRequest = scope === 'user' ? browser.api.getOverview : browser.adminApi.overview;
    const otherRequest = scope === 'user' ? browser.adminApi.overview : browser.api.getOverview;
    browser.respond(401);
    await assert.rejects(ownRequest(), /登录已失效/);
    assert.equal(browser.isSessionExpired(scope), true);
    assert.equal(browser.isSessionExpired(scope === 'user' ? 'admin' : 'user'), false);
    await assert.rejects(ownRequest(), /登录已失效/);
    assert.equal(browser.requests.length, 1);
    browser.respond(200, { employees: 3 });
    assert.equal((await otherRequest()).employees, 3);
    assert.equal(browser.requests.length, 2);
    assert.deepEqual(browser.redirects, [scope === 'user' ? '/login' : '/admin/login']);
    assert.equal(scope === 'user' ? browser.adminToken.get() : browser.userToken.get(), `${scope === 'user' ? 'admin' : 'user'}-token`);
  });

  test(`${scope} 登录页上的 401 仍封锁后续请求，但不重复跳转`, async () => {
    const browser = createBrowser(scope === 'user' ? '/login' : '/admin/login');
    const request = scope === 'user' ? browser.api.getOverview : browser.adminApi.overview;
    browser.respond(401);
    await assert.rejects(request(), /登录已失效/);
    await assert.rejects(request(), /登录已失效/);
    assert.equal(browser.requests.length, 1);
    assert.deepEqual(browser.redirects, []);
  });
}

test('用户登录通过权限校验后只恢复用户端会话', async () => {
  const browser = createBrowser();
  browser.respond(401);
  await assert.rejects(browser.api.getOverview(), /登录已失效/);
  browser.respond(401);
  await assert.rejects(browser.adminApi.overview(), /登录已失效/);
  browser.respond(200, { token: 'fresh-user-token', username: 'member' });
  browser.respond(200, { permissions: ['production:view'] });
  await browser.userAuth.login('member', 'password');
  assert.equal(browser.isSessionExpired('user'), false);
  assert.equal(browser.isSessionExpired('admin'), true);
  assert.equal(browser.hasPerm('production:view'), true);
  const permissionRequest = browser.requests.at(-1);
  assert.equal(permissionRequest.url, '/api/v1/agentapp/auth/me');
  assert.equal(permissionRequest.init.headers.Authorization, 'Bearer fresh-user-token');
  browser.respond(200, { employees: 4 });
  assert.equal((await browser.api.getOverview()).employees, 4);
});

test('管理端登录可越过本端闸门，复位不会恢复用户端失效会话', async () => {
  const browser = createBrowser();
  browser.respond(401);
  await assert.rejects(browser.api.getOverview(), /登录已失效/);
  browser.respond(401);
  await assert.rejects(browser.adminApi.overview(), /登录已失效/);
  browser.respond(200, { token: 'fresh-admin-token' });
  const result = await browser.adminApi.login('admin', 'password');
  browser.adminToken.set(result.token);
  browser.resetSessionGuard('admin');
  assert.equal(browser.isSessionExpired('admin'), false);
  assert.equal(browser.isSessionExpired('user'), true);
  browser.respond(200, { employees: 5 });
  assert.equal((await browser.adminApi.overview()).employees, 5);
});

test('异常权限缓存不引发 includes 异常，也不把字符串当权限列表', () => {
  const browser = createBrowser();
  for (const cached of ['null', '{}', '42', 'true', '"production:view"', '{broken']) {
    browser.localStorage.setItem('user_perms', cached);
    assert.equal(browser.hasPerm('production:view'), false, cached);
    assert.deepEqual(Array.from(browser.getPerms()), [], cached);
  }
  browser.localStorage.setItem('user_perms', JSON.stringify(['production:view', null, 17, {}]));
  assert.deepEqual(Array.from(browser.getPerms()), ['production:view']);
  assert.equal(browser.hasPerm('production:view'), true);
  assert.equal(browser.hasPerm('production:manage'), false);
});

test('登录后的权限校验失败，不保留半登录状态，也不复位闸门', async () => {
  const browser = createBrowser();
  browser.respond(401);
  await assert.rejects(browser.api.getOverview(), /登录已失效/);
  browser.respond(200, { token: 'fresh-user-token' });
  browser.respond(503);
  await assert.rejects(browser.userAuth.login('member', 'password'), /登录验证未完成/);
  assert.equal(browser.userToken.get(), null);
  assert.equal(browser.isSessionExpired('user'), true);
});
