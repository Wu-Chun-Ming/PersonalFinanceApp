import { NativeModule, requireNativeModule } from 'expo';

import { AndroidNotificationListenerModuleEvents } from './AndroidNotificationListener.types';

declare class AndroidNotificationListenerModule extends NativeModule<AndroidNotificationListenerModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  openNotificationSettings: () => Promise<void>;
  getPendingNotifications: () => Promise<any[]>;
  markProcessed: (id: number) => Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AndroidNotificationListenerModule>(
  'AndroidNotificationListener',
);

const module = requireNativeModule('AndroidNotificationListener');

export const openNotificationSettings = () => {
  return module.openNotificationSettings();
};

export const isNotificationListenerEnabled = () => {
  return module.isNotificationListenerEnabled();
};

export const getPendingNotifications = () => {
  return module.getPendingNotifications();
};

export const markProcessed = (id: number) => {
  return module.markProcessed(id);
};

export const addNotificationListener = (callback: any) => {
  return module.addListener('onTransactionNotificationReceived', callback);
};
