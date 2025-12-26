// Reexport the native module. On web, it will be resolved to ExpoPythonOcrModule.web.ts
// and on native platforms to ExpoPythonOcrModule.ts
export { default } from './src/ExpoPythonOcrModule';
export { default as ExpoPythonOcrView } from './src/ExpoPythonOcrView';
export * from  './src/ExpoPythonOcr.types';
