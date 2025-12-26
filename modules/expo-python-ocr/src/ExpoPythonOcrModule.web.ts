import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoPythonOcr.types';

type ExpoPythonOcrModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoPythonOcrModule extends NativeModule<ExpoPythonOcrModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoPythonOcrModule, 'ExpoPythonOcrModule');
