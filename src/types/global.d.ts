declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  VITE_API_URL: string
  VITE_LOCAL_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 