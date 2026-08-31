/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly VITE_BLOG_API_URL?: string
  readonly VITE_PRESENTATION_API_URL?: string
  readonly VITE_USE_BLOG_FIXTURES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
