import { TransactionCategoryType } from "@/types";

export const generatePrompt = (categories: TransactionCategoryType[]) => {
    const categoriesString = categories.map(category => `'${category}'`).join(', ');

    return `
        Extract the date and category for each item in the image and return them strictly in the following JSON format:
        [{
            "date": "<item_1_date>",
            "category": "<item_1_category>"
        },
        {
            "date": "<item_2_date>",
            "category": "<item_2_category>"
        }, 
        ...]
        The response should only include the JSON array, no additional text, explanations, or formatting.
        Categories are: ${categoriesString}.
        Date format should be YYYY-MM-DD. If no date is specified, return null.
    `;
};