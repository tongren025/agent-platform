/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AFFINE_URL?: string;
  readonly VITE_TLDRAW_LICENSE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
