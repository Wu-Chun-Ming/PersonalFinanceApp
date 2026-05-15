import * as DocumentPicker from 'expo-document-picker';
import { Directory } from 'expo-file-system';

import { FileType } from '@/types';
import { getMimeType, importDataFromFile, serializeData } from '@/utils/file';

interface ExportResult {
  success: boolean;
  messages: string;
}

interface ImportResult {
  success: boolean;
  messages: string;
  importedCount?: number;
  failedCount?: number;
}

/**
 * Exports structured data to a user-selected file in the specified format.
 * @template T - The item type returned by `dataFetcher`
 * @param fileType - File format to export as
 * @param dataFetcher - Async function that returns the items to export
 * @param filename - Base filename without extension
 * @param dataType - Human-readable data label used in result messages
 * @returns A result object indicating whether export succeeded
 */
export const exportData = async <T>(
  fileType: FileType,
  dataFetcher: () => Promise<T[]>,
  filename: string,
  dataType: string,
): Promise<ExportResult> => {
  try {
    const data = await dataFetcher();

    // Check if there is data to export
    if (data.length === 0) {
      return {
        success: false,
        messages: `No ${dataType} data to export.`,
      };
    }

    // Serialize data to file content
    const fileContent = serializeData(fileType, data);

    // Ask user to pick a folder
    const directory = await Directory.pickDirectoryAsync();
    if (!directory) {
      return {
        success: false,
        messages: 'No directory selected.',
      };
    }

    const mimeType = getMimeType(fileType);
    const file = directory.createFile(filename, mimeType);

    // Write the content
    file.write(fileContent);

    // Make sure the file exists
    if (!file.exists) {
      throw new Error('File was not created successfully.');
    }

    // Return success message
    return {
      success: true,
      messages: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data exported successfully as ${filename}.${fileType}`,
    };
  } catch (error) {
    throw new Error(`Error exporting ${dataType}: ${(error as Error).message}`);
  }
};

/**
 * Prompts the user to pick a file for import.
 * @param fileType - File format to import from
 * @returns The file URI or null if selection was canceled
 */
export const pickFile = async (fileType: FileType): Promise<string | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: getMimeType(fileType),
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
};

/**
 * Imports and processes structured data from a selected file.
 * @template T - The item type expected from the imported file
 * @param fileType - File format to import from
 * @param dataImporter - Async function that processes each imported item
 * @param dataType - Human-readable data label used in result messages
 * @param fileUri - File URI selected by the user
 * @returns A result object indicating whether import succeeded
 */
export const importData = async <T>(
  fileType: FileType,
  dataImporter: (item: T) => Promise<boolean>,
  dataType: string,
  fileUri: string | null,
): Promise<ImportResult> => {
  if (!fileUri) {
    return {
      success: false,
      messages: 'File selection was canceled.',
      importedCount: 0,
      failedCount: 0,
    };
  }

  const fileData: T[] = await importDataFromFile(fileUri, fileType);

  // Process each data item
  let importedCount = 0;
  let failedCount = 0;

  for (const item of fileData) {
    try {
      const success = await dataImporter(item);
      if (success) {
        importedCount += 1;
      } else {
        failedCount += 1;
      }
    } catch {
      failedCount += 1;
    }
  }

  if (importedCount === 0) {
    return {
      success: false,
      messages: `Failed to import ${dataType}s from ${fileType.toUpperCase()} file.`,
      importedCount,
      failedCount,
    };
  }

  return {
    success: true,
    messages:
      `Imported ${importedCount} ${dataType}s from ${fileType.toUpperCase()} file` +
      (failedCount > 0 ? ` (${failedCount} failed)` : `.`),
    importedCount,
    failedCount,
  };
};
