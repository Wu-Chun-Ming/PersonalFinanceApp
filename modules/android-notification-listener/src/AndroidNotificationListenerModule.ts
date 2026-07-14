import { NativeModule, requireNativeModule } from 'expo';

import { AndroidNotificationListenerModuleEvents } from './AndroidNotificationListener.types';

declare class AndroidNotificationListenerModule extends NativeModule<AndroidNotificationListenerModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AndroidNotificationListenerModule>('AndroidNotificationListener');
