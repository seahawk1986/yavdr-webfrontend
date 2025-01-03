/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="vite-plugin-vue-layouts/client" />

interface ImportMetaEnv {
    // readonly VITE_APP_TITLE: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_DEFAULT_LOCALE: string
    readonly VITE_FALLBACK_LOCALE: string
    readonly VITE_SUPPORTED_LOCALES: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  