import { cY as n, aG as a, bq as i, dr as c, bz as l } from "./agentStudioMount-CX1GI_dE.js";
function d() {
  return `nomi:shot-verify:${n("projectId") || "local"}`;
}
function f() {
  const s = n("projectId") || "";
  return {
    extractFrame: async (r) => {
      const t = l()?.video?.extractFrame;
      if (!t) throw new Error("当前环境不支持抽帧(需桌面端)");
      const e = (await t({ videoUrl: r, which: "first", projectId: s }))?.url;
      if (!e) throw new Error("抽帧未返回 URL");
      return e;
    },
    judge: async (r, t) => {
      const o = d();
      await a(o).catch(() => {
      });
      const e = i();
      return (await c(
        {
          prompt: r,
          displayPrompt: r.slice(0, 40),
          sessionKey: o,
          ...s ? { projectId: s } : {},
          skillKey: "workbench.shot-verify",
          skillName: "镜级画面校验",
          mode: "chat",
          // 无工具的纯多模态判断
          ...e ? { agentModelKey: e.modelKey, agentVendorKey: e.vendorKey } : {},
          attachments: [{ url: t, contentType: "image/png", fileName: "shot-frame.png", kind: "image" }]
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
