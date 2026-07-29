// 已知密钥清单 provider(harness S4-1,评测安全铁律②的精确匹配半边):
// 事件落盘前,url/query/body 里任何**等于**已配置 vendor apiKey 的字符串都会被盖掉
// (redact.ts 的形态兜底盖不住任意格式的 key,精确匹配才是地基)。
// 30s TTL 缓存:append 每批调一次 provider,不能每次都解密全部 Keychain 记录。
import { readCatalog } from "../catalog/catalogStore";
import { decryptApiKeyRecord } from "../catalog/secrets";

const TTL_MS = 30_000;
let cache: { at: number; secrets: string[] } | null = null;

export function catalogSecretsProvider(): readonly string[] {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.secrets;
  try {
    const catalog = readCatalog() as { apiKeysByVendor?: Record<string, Parameters<typeof decryptApiKeyRecord>[0]> };
    const secrets = Object.values(catalog.apiKeysByVendor || {})
      .map((record) => decryptApiKeyRecord(record))
      .filter((secret) => secret.length >= 8);
    cache = { at: Date.now(), secrets };
    return secrets;
  } catch {
    return cache?.secrets ?? [];
  }
}

/** 测试/密钥变更后强制刷新。 */
export function resetSecretsProviderCache(): void {
  cache = null;
}
