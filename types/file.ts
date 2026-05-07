export const FILE_TYPES = {
  JSON: 'json',
  CSV: 'csv',
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

export const FILE_MIME_TYPES: Record<FileType, string> = {
  json: 'application/json',
  csv: 'text/csv',
};
