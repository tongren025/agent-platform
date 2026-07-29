# Workspace Folder Projects QA

## Scope

Verify that desktop Nomi projects now live inside user-selected folders instead of an app-owned fixed projects root, and that generated/imported/exported files remain inside the selected workspace.

## Preconditions

- Run the desktop app in development mode.
- Prepare three folders:
  - an empty folder, e.g. `/tmp/nomi-empty-workspace`
  - a folder with existing media/text files
  - a legacy project folder copied from the old app-owned projects root, if available

## Checklist

### Open and initialize folders

- [ ] Open an empty folder from the library/new-project flow.
- [ ] Confirm Nomi prompts/initializes it as a workspace project.
- [ ] Confirm the folder contains `.nomi/project.json`, `assets/`, and `exports/`.
- [ ] Quit and reopen the app; confirm the workspace appears in recent projects.
- [ ] Move or delete the workspace folder; confirm the library shows it as missing instead of crashing.

### Storage boundaries

- [ ] Create/import a local image or video asset.
- [ ] Confirm imported assets are written under `assets/imported/YYYY-MM-DD/` inside the workspace.
- [ ] Generate or download a remote/generated asset.
- [ ] Confirm generated assets are written under `assets/generated/YYYY-MM-DD/` inside the workspace.
- [ ] Export a video.
- [ ] Confirm the final output is written under `exports/` inside the workspace.
- [ ] Confirm temporary export job files are under `.nomi/jobs/<jobId>/` and not under a visible `cache/` directory.
- [ ] Confirm no new project folder is created under `~/Documents/Nomi Projects/` during new desktop project creation.

### File explorer

- [ ] In generation mode, confirm the left project explorer defaults to the `文件` tab.
- [ ] Confirm existing text/image/video files in the workspace appear in the tree.
- [ ] Confirm `.nomi`, `.git`, `node_modules`, and hidden folders do not appear.
- [ ] Confirm generated/imported/exported files appear after refresh/reopen.
- [ ] Single-click a file; confirm it selects without opening a privileged path directly.
- [ ] Double-click a file; confirm Finder reveals that file.
- [ ] Confirm directory rows expand/collapse.
- [ ] Confirm collapsed sidebar still lets the user reopen `分类` or `文件`.

### Legacy compatibility

- [ ] Existing legacy projects in the old fixed root still list/import through migration compatibility.
- [ ] Deleting a migrated legacy project removes/suppresses it so it does not reappear on the next list refresh.
- [ ] Saving an unknown desktop project id fails instead of creating a new fixed-root project.

### Security regression checks

- [ ] Renderer file tree API returns only relative paths.
- [ ] Reveal/open requests reject `../` traversal.
- [ ] Reveal/open requests reject absolute paths, Windows drive paths, UNC paths, null bytes, malformed `//`, and `./` segments.
- [ ] Reveal/open requests reject symlinks that escape the workspace root.

## Automated verification

Run:

```bash
pnpm test -- electron/runtime.workspace-projects.test.ts \
  electron/export/exportJobIpc.test.ts \
  electron/workspace/workspaceRepository.test.ts \
  electron/workspace/workspaceFileIndex.test.ts \
  electron/workspace/workspaceIpc.test.ts \
  electron/runtime.assets.test.ts

pnpm run build
```

Expected result: all tests and build pass.
