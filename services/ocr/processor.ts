
import { OcrMode, OcrModeType } from "@/types";
import { getServerConfig } from "../appConfig";
import { extractDescriptionTotal } from "./localService";
import { extractDateCategoryRemote } from "./remoteService";

// ======================== Local ========================
// Process online shopping screenshot
export const processOnlineShoppingOcr = async (
    model,
    imageUri: string,
) => {
    const descriptionTotalResults = await extractDescriptionTotal(model, imageUri);
    const dateCategoryResults = await extractDateCategoryRemote(imageUri);
    const finalResults = [];
    // Find the maximum length
    const maxLen = Math.max(descriptionTotalResults.length, dateCategoryResults.length);

    // Merge results based on the maximum length
    for (let i = 0; i < maxLen; i++) {
        const descriptionTotal = descriptionTotalResults[i] ?? { description: "", total: null };
        const dateCategory = dateCategoryResults[i] ?? { date: null, category: null };
        finalResults.push({
            ...descriptionTotal,
            ...dateCategory,
        });
    }

    return finalResults;
}

// ======================== Server ========================
// Send OCR request to server
export const sendOcrRequestToServer = async (
    imageUri: string,
    selectedMode: OcrModeType,
) => {
    const { serverUrl } = await getServerConfig();
    if (!serverUrl) {
        throw new Error("Server URL is not configured.");
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
    const endpoint = serverUrl +
        (selectedMode === OcrMode.ONLINE_SHOPPING ? `/online-shopping` : `/receipt`);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server OCR request failed: ${text}`);
    }

    const jsonData = await response.json();
    const result = jsonData.result as
        | {
            date: string;
            category: string;
            description: string;
            total: number;
        }
        | {
            date: string;
            category: string;
            description: string;
            total: number;
        }[];

    return Array.isArray(result) ? result : [result];
}