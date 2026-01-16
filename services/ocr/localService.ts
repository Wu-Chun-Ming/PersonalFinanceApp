import { LineItemInfo } from "@/types";
import { OCRDetection } from "react-native-executorch";

// Extract description and total amount locally
export const extractDescriptionTotal = async (
    model,
    imageUri: string,
) => {
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
        if (text === "Completed") {
            const next = ocrDetections
                .slice(i + 1)
                .find(d =>
                    // below the "Completed" box
                    d.bbox[0].y > bbox[0].y
                    && !d.text.includes("RM")
                    && !d.text.includes("Buy")
                );
            if (next) {
                currentItem.description = next.text.trim();
            }
        }
        // Extract the amount after "Total" or currency symbol
        if (text.includes("Total") || text.includes("RM")) {
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
}