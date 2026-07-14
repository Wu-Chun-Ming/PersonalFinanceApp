// Reexport the native module. On web, it will be resolved to AndroidNotificationListenerModule.web.ts
// and on native platforms to AndroidNotificationListenerModule.ts
export { default } from './src/AndroidNotificationListenerModule';
export { default as AndroidNotificationListenerView } from './src/AndroidNotificationListenerView';
export * from  './src/AndroidNotificationListener.types';
