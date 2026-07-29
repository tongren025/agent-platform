import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Keep the dev Electron launchable on macOS when Apple has revoked its
 * notarization.
 *
 * Symptom: `pnpm dev` dies and macOS pops "'Electron' 已被阻止…移到废纸篓". The
 * dev Electron shipped in node_modules is ad-hoc signed with a code hash that
 * Apple later put on its notarization revocation list. On macOS (Sequoia+/Tahoe)
 * every launch is checked against that list, so the binary is SIGKILL-ed (exit
 * 137) AND XProtect removes `Electron.app` — which is why reinstalling never
 * sticks: the freshly extracted binary has the same revoked hash and self-
 * destructs on the next launch.
 *
 * Fix: re-sign the bundle ad-hoc so every Mach-O gets a fresh code hash that no
 * longer matches the revocation list. The bundle then launches normally and is
 * not deleted. This is a local-dev-only workaround; it does not affect the
 * production build (which is properly Developer-ID signed + notarized by CI).
 *
 * We probe statically with `spctl` (which does NOT launch the binary — launching
 * a revoked binary would delete it) and only re-sign when the verdict is
 * "revoked", so a healthy or already-fixed Electron costs nothing.
 */

function findDotApp(binaryPath) {
  let dir = binaryPath;
  while (dir && dir !== path.dirname(dir)) {
    if (dir.endsWith(".app")) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

function isRevoked(appPath) {
  const result = spawnSync("spctl", ["-a", "-t", "exec", "-vv", appPath], {
    encoding: "utf8",
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  return /revoked/i.test(output);
}

function adhocSign(target) {
  spawnSync("codesign", ["--force", "-s", "-", target], { stdio: "ignore" });
}

function reSignInsideOut(appPath) {
  const frameworks = path.join(appPath, "Contents", "Frameworks");
  if (fs.existsSync(frameworks)) {
    const entries = fs.readdirSync(frameworks);
    // Helper apps first (inner executables, then the helper bundle)…
    for (const entry of entries) {
      if (!entry.endsWith(".app")) continue;
      const macos = path.join(frameworks, entry, "Contents", "MacOS");
      if (fs.existsSync(macos)) {
        for (const bin of fs.readdirSync(macos)) adhocSign(path.join(macos, bin));
      }
      adhocSign(path.join(frameworks, entry));
    }
    // …then the frameworks…
    for (const entry of entries) {
      if (entry.endsWith(".framework")) adhocSign(path.join(frameworks, entry));
    }
    // …then any loose dylibs…
    for (const dylib of findFiles(frameworks, (name) => name.endsWith(".dylib"))) {
      adhocSign(dylib);
    }
  }
  // …and the outer bundle last.
  adhocSign(appPath);
}

function findFiles(root, predicate) {
  const out = [];
  const walk = (dir) => {
    let items;
    try {
      items = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (predicate(item.name)) out.push(full);
    }
  };
  walk(root);
  return out;
}

/**
 * @param {string} electronBinaryPath path returned by `require("electron")`
 * @param {{ log?: (msg: string) => void }} [options]
 * @returns {"skipped" | "healthy" | "resigned" | "failed"}
 */
export function ensureElectronSignature(electronBinaryPath, options = {}) {
  const log = options.log || (() => {});
  if (process.platform !== "darwin") return "skipped";
  if (process.env.NOMI_SKIP_ELECTRON_RESIGN === "1") return "skipped";

  const appPath = findDotApp(electronBinaryPath);
  if (!appPath || !fs.existsSync(appPath)) return "skipped";
  if (!isRevoked(appPath)) return "healthy";

  log(`▶  dev Electron notarization revoked by Apple; ad-hoc re-signing ${appPath}`);
  reSignInsideOut(appPath);

  if (isRevoked(appPath)) {
    console.warn(
      "⚠  Electron still assessed as revoked after re-sign. `pnpm dev` may be blocked by macOS. " +
        "Set NOMI_SKIP_ELECTRON_RESIGN=1 to bypass, or upgrade Electron to a non-revoked build.",
    );
    return "failed";
  }
  log("▶  dev Electron re-signed; Gatekeeper revocation cleared.");
  return "resigned";
}

// CLI entry: `node scripts/ensure-electron-signature.mjs`
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const require = createRequire(import.meta.url);
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  let electronBinaryPath;
  try {
    electronBinaryPath = require(path.join(repoRoot, "node_modules", "electron"));
  } catch {
    electronBinaryPath = require("electron");
  }
  const status = ensureElectronSignature(electronBinaryPath, { log: (msg) => console.log(msg) });
  if (status === "healthy") console.log("▶  dev Electron signature healthy; nothing to do.");
  if (status === "skipped") console.log("▶  Electron re-sign skipped (non-macOS or disabled).");
  process.exit(status === "failed" ? 1 : 0);
}
