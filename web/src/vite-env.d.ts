/**
 * CSS Modules 类型声明
 * 允许导入 .module.css 文件作为模块
 */
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
