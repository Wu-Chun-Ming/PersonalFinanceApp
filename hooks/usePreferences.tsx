import { useEffect } from 'react';
import { useMMKVBoolean } from 'react-native-mmkv';

import * as AndroidNotificationListener from '@/modules/android-notification-listener';

export const usePreferences = () => {
  const [notificationCapture, setNotificationCapture] = useMMKVBoolean(
    'notificationCapture',
  );
  const [autoDeduction, setAutoDeduction] = useMMKVBoolean('autoDeduction');

  const refresh = async () => {
    const enabled =
      await AndroidNotificationListener.isNotificationListenerEnabled();
    setNotificationCapture(enabled);
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    notificationCapture: notificationCapture ?? false,
    setNotificationCapture,
    autoDeduction: autoDeduction ?? false,
    setAutoDeduction,
    refresh,
  };
};
