/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
