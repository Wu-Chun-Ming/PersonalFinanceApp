import { generatePrompt } from "@/ai/prompts/promptTemplate";
import { EXPENSE_CATEGORIES } from "@/constants/transaction";
import { fetchWithTimeout } from "@/services/api";
import { TransactionMetadata } from "@/types";
import { getModelConfig } from "../appConfig";

// Extract date and category from remote model
export const extractTransactionMetadata = async (imageBase64Str: string): Promise<TransactionMetadata[]> => {
    const { modelName, apiKey, timeout } = await getModelConfig();
    if (!modelName || !apiKey) {
        throw new Error("Model configuration is incomplete.");
    }
    const prompt = generatePrompt(EXPENSE_CATEGORIES);
    const payload = {
        "model": modelName,
        "messages": [{
            "role": "user",
            "content": [
                { "type": "text", "text": prompt },
                { "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${imageBase64Str}` } }
            ]
        }]
    }

    let result: TransactionMetadata[] = [];
    try {
        const response = await fetchWithTimeout(
            "https://openrouter.ai/api/v1/chat/completions",
            JSON.stringify(payload),
            apiKey,
            { timeoutSeconds: timeout }
        );
        const choice = response.choices?.[0];
        const content: string = choice?.message?.content;
        result = JSON.parse(content);
    } catch (err: any) {
        console.error("Error during fetch request to remote model:", err);
        throw err;
    }

    return result;
}
