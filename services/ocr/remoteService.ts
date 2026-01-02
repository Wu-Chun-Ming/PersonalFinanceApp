import { generatePrompt } from "@/ai/prompts/promptTemplate";
import { EXPENSE_CATEGORIES } from "@/constants/transaction";
import * as ExpoPythonOcrModule from "@/modules/expo-python-ocr";
import { getModelAndApiKey } from "../appConfig";

// Extract date and category from remote model
export const extractDateCategoryRemote = async (imageUri: string) => {
    const { modelName, apiKey } = await getModelAndApiKey();
    if (!modelName || !apiKey) {
        throw new Error("Model name or API key is not configured.");
    }
    const prompt = generatePrompt(EXPENSE_CATEGORIES);

    return ExpoPythonOcrModule.extractDateCategory(imageUri, modelName, apiKey, prompt);
}