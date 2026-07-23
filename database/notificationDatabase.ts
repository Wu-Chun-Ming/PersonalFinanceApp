import * as SQLite from 'expo-sqlite';

// Custom import
import {
  getAllData,
  getRowByPrimaryKey,
  insertRow,
  updateRow,
} from '@/database';
import { DatabaseOptions, NotificationProps } from '@/types';
import { notificationTableColumns } from './schema';

const tableName = 'notification_queue';

const getNotificationValues = (notification: NotificationProps) => {
  return [
    notification.notification_key,
    notification.package_name,
    notification.title,
    notification.message,
    notification.post_time.toString(),
    notification.status,
  ];
};

const transformNotification = (notification: any): NotificationProps => {
  return {
    ...notification,
    date: notification.post_time ? new Date(notification.post_time) : null,
  };
};

// Fetch all notifications
export const getNotifications = async (options?: DatabaseOptions) => {
  return getAllData<NotificationProps>(
    tableName,
    options,
    transformNotification,
  );
};

// Fetch specific notification
export const showNotification = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return getRowByPrimaryKey<NotificationProps>(
    tableName,
    'id',
    id,
    { dbInstance },
    transformNotification,
  );
};

// Store new notification
export const storeNotification = async (
  notification: NotificationProps,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return insertRow(
    tableName,
    preserveId ? notificationTableColumns : notificationTableColumns.slice(1), // Exclude 'id' column for insertion if not preserving
    [
      ...(preserveId ? [notification.id] : []),
      ...getNotificationValues(notification),
    ],
    { dbInstance },
  );
};

// Update notification details
export const updateNotification = async (
  notification: NotificationProps,
  id: number,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return updateRow(
    tableName,
    preserveId ? notificationTableColumns : notificationTableColumns.slice(1), // Exclude 'id' column for update if not preserving
    [
      ...(preserveId ? [notification.id] : []),
      ...getNotificationValues(notification),
    ],
    'id',
    id,
    { dbInstance },
  );
};
