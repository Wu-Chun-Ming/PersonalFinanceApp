import { File } from 'expo-file-system';
import { Parser } from '@json2csv/plainjs';
import csv from 'csvtojson';

import { FILE_MIME_TYPES, FileType } from '@/types';

// Read file content
const readFileContent = async (uri: string) => {
  const file = new File(uri);
  return await file.text();
};

// Parse file content based on file type
const parseFileContent = async (fileType: FileType, content: string) => {
  try {
    if (fileType === 'json') {
      return JSON.parse(content);
    }

    if (fileType === 'csv') {
      return await csv().fromString(content);
    }

    return [];
  } catch (error) {
    throw new Error(
      `Error parsing ${fileType.toUpperCase()} file: ${(error as Error).message}`,
    );
  }
};

// Serialize data from JSON or CSV format to string
export const serializeData = (fileType: FileType, data: unknown[]): string => {
  if (fileType === 'json') {
    return JSON.stringify(data, null, 2);
  }

  if (fileType === 'csv') {
    const parser = new Parser();
    return parser.parse(data);
  }

  throw new Error('Unsupported file type for export.');
};

// Return MIME type based on file type
export const getMimeType = (fileType: FileType): string => {
  return FILE_MIME_TYPES[fileType];
};

// Import data from file
export const importDataFromFile = async (uri: string, fileType: FileType) => {
  const fileContent = await readFileContent(uri);
  return await parseFileContent(fileType, fileContent);
};
