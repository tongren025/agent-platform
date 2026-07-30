import { cN as n, aE as a, bj as i, de as c, bs as l } from "./agentStudioMount-D2l2f4Xv.js";
function d() {
  return `nomi:shot-verify:${n("projectId") || "local"}`;
}
function f() {
  const s = n("projectId") || "";
  return {
    extractFrame: async (t) => {
      const r = l()?.video?.extractFrame;
      if (!r) throw new Error("当前环境不支持抽帧(需桌面端)");
      const e = (await r({ videoUrl: t, which: "first", projectId: s }))?.url;
      if (!e) throw new Error("抽帧未返回 URL");
      return e;
    },
    judge: async (t, r) => {
      const o = d();
      await a(o).catch(() => {
      });
      const e = i();
      return (await c(
        {
          prompt: t,
          displayPrompt: t.slice(0, 40),
          sessionKey: o,
          ...s ? { projectId: s } : {},
          skillKey: "workbench.shot-verify",
          skillName: "镜级画面校验",
          mode: "chat",
          // 无工具的纯多模态判断
          ...e ? { agentModelKey: e.modelKey, agentVendorKey: e.vendorKey } : {},
          attachments: [{ url: r, contentType: "image/png", fileName: "shot-frame.png", kind: "image" }]
        },
        {}
      )).text ?? "";
    },
    // 默认视觉开;非多模态模型 → judge 返回非 JSON,runner 逐镜 catch 跳过(降级仅结构校验)。
    visionAvailable: () => !0
  };
}
export {
  f as makeShotVerifyDeps
};
