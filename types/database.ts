import * as SQLite from 'expo-sqlite';

export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type SortOrder = (typeof SORT_ORDERS)[keyof typeof SORT_ORDERS];

export interface DatabaseOptions {
  sortOrder?: SortOrder;
  dbInstance?: SQLite.SQLiteDatabase;
}
