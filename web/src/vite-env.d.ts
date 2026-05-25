/**
 * CSS Modules 类型声明
 * 允许导入 .module.css 文件作为模块
 */
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ADMIN_WAREHOUSE_PASSWORD?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
