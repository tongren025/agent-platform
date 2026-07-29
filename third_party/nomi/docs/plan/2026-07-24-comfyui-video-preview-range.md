# ComfyUI Video Preview, Export, and Timeline Duration Fix

## Scope

- Fix `nomi-local://asset/...` local asset serving so Chromium video playback can read byte ranges.
- Keep existing image/file behavior unchanged for non-Range requests.
- Add protocol-level regression tests.
- Preserve generated video file extensions during task asset localization so WebM/MOV outputs are not saved as misleading `.mp4` files.
- Carry probed media duration from localized video/audio assets into task results when the main process can read the persisted file.
- Reuse the existing generation result URL resolver so newly created timeline clips prefer persisted `nomi-local://` assets over stale/private ComfyUI provider URLs.
- Resolve existing timeline preview/export URLs through the source generation node so old clips that still store a ComfyUI `providerUrl` use the node's persisted local result instead.
- Before inserting a generated video into the timeline, probe the current media file duration in the renderer and use that duration even when `result.durationSeconds` is stale.
- Keep drag payloads compatible while adding `nodeId`, so drop handlers can resolve the latest generation node from the canvas store instead of relying on a serialized drag snapshot.

## Non-Goals

- Do not change ComfyUI workflow import or result parsing.
- Do not transcode generated video files.
- Do not change timeline editing or trimming behavior beyond the initial inserted video duration and playback/export URL resolution.
- Do not add a new duration metadata schema to generation node `meta`.

## Acceptance

- `Range: bytes=0-0` returns `206`, `Content-Range`, `Accept-Ranges`, and one byte.
- Full requests still return the whole file with CORS headers.
- Invalid ranges return `416`.
- Existing timeline clips that still store a ComfyUI `providerUrl` preview/export via the node's persisted `nomi-local://` result URL.
- A generated 3.0625s video with asset duration in the task result normalizes to `result.durationSeconds = 3.0625`.
- A generated video whose result still has stale duration uses the current media file duration when inserted into the timeline; for example, a 7s file at 30fps inserts as 210 frames even if `result.durationSeconds` says 5s.
- Drag/drop insertion resolves the latest canvas node by `nodeId` instead of trusting the serialized drag payload snapshot.
- Electron typecheck and focused tests pass.
