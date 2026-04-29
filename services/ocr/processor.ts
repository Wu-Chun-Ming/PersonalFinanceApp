import { LLMTypeMultimodal, OCRType } from 'react-native-executorch';

import { fetchWithTimeout } from '@/services/api';
import {
  OcrCancelContext,
  OcrImage,
  OcrMode,
  OcrModeType,
  OcrResult,
} from '@/types';
import {
  extractLineItemInfo,
  extractTransactionMetadata,
} from './localService';

import { getServerConfig } from '../appConfig';

// ======================== Local ========================
// Process online shopping screenshot
export const processOnlineShoppingOcr = async (
  ocrModel: OCRType,
  llmModel: LLMTypeMultimodal,
  image: OcrImage,
  cancelContext: OcrCancelContext,
) => {
  const lineItemInfo = await extractLineItemInfo(ocrModel, image.uri);
  const transactionMetadata = await extractTransactionMetadata(
    llmModel,
    image.uri,
  );
  const ocrResults: OcrResult[] = [];
  // Merge results based on the maximum length
  for (
    let i = 0;
    i < Math.max(lineItemInfo.length, transactionMetadata.length);
    i++
  ) {
    ocrResults.push({
      description: lineItemInfo[i]?.description ?? '',
      total: lineItemInfo[i]?.total ?? 0,
      date: transactionMetadata[i]?.date ?? '',
      category: transactionMetadata[i]?.category ?? '',
    });
  }

  return ocrResults;
};

// ======================== Server ========================
// Send OCR request to server
export const sendOcrRequestToServer = async (
  imageUri: string,
  selectedMode: OcrModeType,
) => {
  const { serverUrl, timeout } = await getServerConfig();
  if (!serverUrl) {
    throw new Error('Server URL is not configured.');
  }

  const formData = new FormData();
  // Append OCR mode
  formData.append('image_type', selectedMode);
  // Append the image file
  formData.append('image', {
    uri: imageUri,
    name: 'image.jpg',
    type: 'image/jpeg',
  } as any);

  // Choose the endpoint based on the selected mode
  const endpoint =
    serverUrl +
    (selectedMode === OcrMode.ONLINE_SHOPPING
      ? `/online-shopping`
      : `/receipt`);

  let result: OcrResult[] = [];
  try {
    result = await fetchWithTimeout<OcrResult[]>(
      endpoint,
      formData,
      undefined,
      { timeoutSeconds: timeout },
    );
  } catch (err: any) {
    console.error('Error during fetch request to server:', err);
    throw err;
  }

  return result;
};
