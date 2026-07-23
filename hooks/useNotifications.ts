import { router } from 'expo-router';

import {
  fetchNotification,
  fetchNotifications,
  markNotificationAsProcessed,
} from '@/services/notificationService';
import { DatabaseOptions, NotificationProps } from '@/types';
import { useCustomMutation } from './useAppMutation';
import { useCustomQuery } from './useAppQuery';

// Custom hook to fetch notifications
export const useNotifications = (options?: DatabaseOptions) => {
  return useCustomQuery<NotificationProps[]>({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(options),
    fallbackValue: [],
  });
};

// Custom hook to fetch a single notification
export const useNotification = (notificationId: number) => {
  return useCustomQuery<NotificationProps | null>({
    queryKey: ['notification', notificationId],
    queryFn: () => fetchNotification(Number(notificationId)),
    fallbackValue: null,
    onError: () => router.back(), // Navigate back if error occurs
    options: {
      enabled: !!notificationId,
    },
  });
};

// Custom hook to update a notification
export const useUpdateNotification = () => {
  return useCustomMutation({
    mutationFn: ({ id }: { id: number }) => markNotificationAsProcessed(id),
    invalidateKeys: (variables) => [
      ['notification', variables?.id],
      ['notifications'], // Invalidate notification and notifications queries on success
    ],
  });
};
