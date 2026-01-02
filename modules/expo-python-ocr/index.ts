import ExpoPythonOcrModule from './src/ExpoPythonOcrModule';
// Reexport the native module. On web, it will be resolved to ExpoPythonOcrModule.web.ts
// and on native platforms to ExpoPythonOcrModule.ts
export * from './src/ExpoPythonOcr.types';
export { default } from './src/ExpoPythonOcrModule';
export { default as ExpoPythonOcrView } from './src/ExpoPythonOcrView';

export function extractDateCategory(
    imageUri: string,
    model: string,
    apiKey: string,
    prompt: string,
): Promise<{
    date: string;
    category: string;
}[]> {
    return ExpoPythonOcrModule.extractDateCategory(imageUri, model, apiKey, prompt);
}