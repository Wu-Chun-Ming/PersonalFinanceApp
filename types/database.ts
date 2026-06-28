import * as SQLite from 'expo-sqlite';

export const SortOrder = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type SortOrderType = (typeof SortOrder)[keyof typeof SortOrder];

export interface SortOptions {
  sortField: string;
  sortOrder: SortOrderType;
}

export interface DatabaseOptions {
  dbInstance?: SQLite.SQLiteDatabase;
  sortOptions?: SortOptions;
}

export type TableInfoProps = Record<string, { entityName: string }>;
