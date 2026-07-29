import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { browserChromeMenuHtml, browserChromeMenuPreloadPath } from "./browserViewChromeMenu";

vi.mock("electron", () => ({ BrowserWindow: class BrowserWindow {} }));

describe("browser chrome menu window", () => {
  it("resolves the shared preload from the compiled browser/chrome directory", () => {
    expect(browserChromeMenuPreloadPath("/app/dist-electron/browser/chrome")).toBe(
      path.join("/app/dist-electron", "preload.js"),
    );
  });

  it("ships no inline script and escapes menu content", () => {
    const html = browserChromeMenuHtml([
      { type: "normal", id: 'open"unsafe', label: "<打开>", description: "说明", enabled: true },
    ]);

    expect(html).toContain("default-src 'none'; style-src 'unsafe-inline'");
    expect(html).not.toContain("<script");
    expect(html).toContain("&lt;打开&gt;");
    expect(html).not.toContain('data-id="open"unsafe"');
  });
});
