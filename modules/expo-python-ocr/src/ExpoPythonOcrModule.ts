import { NativeModule, requireNativeModule } from 'expo';

import { ExpoPythonOcrModuleEvents } from './ExpoPythonOcr.types';

declare class ExpoPythonOcrModule extends NativeModule<ExpoPythonOcrModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  extractDateCategory(imageUri: string, model: string, apiKey: string, prompt: string): Promise<{ date: string; category: string }[]>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoPythonOcrModule>('ExpoPythonOcr');
