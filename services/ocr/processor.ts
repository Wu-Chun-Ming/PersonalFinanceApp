
import { fetchWithTimeout } from "@/services/api";
import { OcrMode, OcrModeType, OcrResult } from "@/types";
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
    const { serverUrl, timeout } = await getServerConfig();
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

    let result: OcrResult[] = [];
    try {
        result = await fetchWithTimeout<OcrResult[]>(
            endpoint,
            formData,
            undefined,
            { timeoutSeconds: timeout }
        );
    } catch (err: any) {
        console.error("Error during fetch request to server:", err);
        throw err;
    }

    return result;
}