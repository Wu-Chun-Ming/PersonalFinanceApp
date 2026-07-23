import {
  getNotifications,
  showNotification,
  updateNotification,
} from '@/database/notificationDatabase';
import {
  DatabaseOptions,
  NotificationProps,
  NotificationStatus,
} from '@/types';

// Fetch notifications
export const fetchNotifications = async (options?: DatabaseOptions) => {
  const response = await getNotifications(options);
  return response.data;
};

// Fetch single notification
export const fetchNotification = async (id: number) => {
  const response = await showNotification(id);
  return response.data;
};

// Edit notification
export const editNotification = async (
  id: number,
  updatedNotificationData: NotificationProps,
) => {
  const response = await updateNotification(updatedNotificationData, id);
  return response.data;
};

// Mark notification as processed
export const markNotificationAsProcessed = async (id: number) => {
  const notification = await fetchNotification(id);

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await editNotification(id, {
    ...notification,
    status: NotificationStatus.PROCESSED,
  });
};
