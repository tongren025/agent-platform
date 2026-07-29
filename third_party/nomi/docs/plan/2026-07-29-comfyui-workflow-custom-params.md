# ComfyUI Workflow Custom Parameters

## Scope

- Let imported ComfyUI workflows expose manually selected scalar widget inputs as generation-time parameters.
- Keep the existing automatic numeric suggestions and old saved `numeric` bindings compatible.
- Support edit mode and new import mode with the same parameter binding UI.
- Provide lightweight common-parameter presets for width, height, seconds, and FPS when matching scalar inputs are detected.

## Non-goals

- Do not infer workflow-specific formulas such as seconds * fps.
- Do not rewrite or normalize the ComfyUI graph beyond replacing selected widget values with request placeholders.
- Do not change curated ComfyUI models.

## Files

- `electron/catalog/comfyuiWorkflowImport.ts`
- `electron/catalog/comfyuiWorkflowImport.test.ts`
- `src/ui/onboarding/ComfyuiWorkflowImportPanel.tsx`
- `src/i18n/locales/onboardingProviders.ts`

## Validation

- Focused importer/store tests.
- Typecheck.
- i18n gate if visible strings are added.
- Design-token and lint gates for the import-panel UI changes.
