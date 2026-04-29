import { LLMTypeMultimodal, OCRDetection } from 'react-native-executorch';

import { generatePrompt } from '@/ai/prompts/promptTemplate';
import { EXPENSE_CATEGORIES } from '@/constants/transaction';
import { LineItemInfo, TransactionMetadata } from '@/types';

// Extract description and total amount locally
export const extractLineItemInfo = async (model, imageUri: string) => {
  const results: LineItemInfo[] = [];
  let currentItem: {
    description: string | null;
    total: number | null;
  } = {
    description: null,
    total: null,
  };

  const ocrDetections: OCRDetection[] = await model.forward(imageUri);
  // Find item descriptions and totals
  for (let i = 0; i < ocrDetections.length; i++) {
    const { text, bbox } = ocrDetections[i];

    // Find title after "Completed"
    if (text === 'Completed') {
      const next = ocrDetections.slice(i + 1).find(
        (d) =>
          // below the "Completed" box
          d.bbox[0].y > bbox[0].y &&
          !d.text.includes('RM') &&
          !d.text.includes('Buy'),
      );
      if (next) {
        currentItem.description = next.text.trim();
      }
    }
    // Extract the amount after "Total" or currency symbol
    if (text.includes('Total') || text.includes('RM')) {
      const match = text.match(/RM\s*([\d,]+(?:\.\d{2})?)/);
      if (match) {
        currentItem.total = parseFloat(match[1].replace(/,/g, ''));
      }
    }

    // Push current item if both description and total are found
    if (currentItem.description != null && currentItem.total !== null) {
      results.push({
        description: currentItem.description,
        total: currentItem.total,
      });
      currentItem = { description: null, total: null };
    }
  }

  return results;
};

function extractJSON(text: string) {
  const match = text.match(/\[.*\]/s); // for array JSON
  return match ? match[0] : text;
}

function cleanJSON(text: string) {
  return text
    .replace(/```json/g, '') // remove markdown start
    .replace(/```/g, '') // remove markdown end
    .replace(/,\s*]/g, ']') // remove trailing commas in arrays
    .replace(/,\s*}/g, '}') // remove trailing commas in objects
    .trim();
}

export const extractTransactionMetadata = async (
  llmModel: LLMTypeMultimodal,
  imageUri: string,
) => {
  const prompt = generatePrompt(EXPENSE_CATEGORIES);

  await llmModel.sendMessage(prompt, {
    imagePath: imageUri,
  });

  let result: TransactionMetadata[] = [];
  try {
    const raw = llmModel.response;
    const extracted = extractJSON(raw);
    const cleaned = cleanJSON(extracted);
    result = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('Error parsing JSON from model response:', parseErr);
    throw new Error('Failed to parse model response.');
  }

  return result;
};
