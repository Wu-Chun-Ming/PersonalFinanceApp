import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './AndroidNotificationListener.types';

type AndroidNotificationListenerModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class AndroidNotificationListenerModule extends NativeModule<AndroidNotificationListenerModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(AndroidNotificationListenerModule, 'AndroidNotificationListenerModule');
