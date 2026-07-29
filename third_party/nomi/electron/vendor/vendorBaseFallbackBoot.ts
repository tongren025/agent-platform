// 启动接线（electron 侧）：给 vendorBaseFallback 注入落盘路径。独立小文件——
// vendorBaseFallback 本体不 import electron（纯 Node 可单测），main.ts 也不用为
// 这几行 import 链撑体积（R9/R12）。
import path from "node:path";
import { getSettingsRoot } from "../runtimePaths";
import { configureVendorBaseFallback } from "./vendorBaseFallback";

export function configureVendorBaseFallbackAtBoot(): void {
  configureVendorBaseFallback(path.join(getSettingsRoot(), "vendor-base-overrides.json"));
}
