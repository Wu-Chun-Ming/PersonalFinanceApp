import { FormikProps } from 'formik';

import { notificationSchema } from '@/validation/notificationSchema';
import { useCustomFormik } from './useAppFormik';
import { useUpdateNotification } from './useNotifications';

export interface NotificationFormikProps {
  notification_key: string;
  package_name: string;
  title: string;
  message: string;
  post_time: string;
  status: string;
}

export const useNotificationFormik = (
  notificationId: number,
  initialNotification?: NotificationFormikProps,
): { notificationFormik: FormikProps<NotificationFormikProps> } => {
  const updateMutation = useUpdateNotification();

  const notificationFormik = useCustomFormik({
    initialValues: initialNotification || {
      notification_key: '',
      package_name: '',
      title: '',
      message: '',
      post_time: '',
      status: '',
    },
    validationSchema: notificationSchema,
    transformValues: (values) => values,
    onSubmitCallback: () => {
      updateMutation.mutate({
        id: notificationId,
      });
    },
  });

  return {
    notificationFormik,
  };
};
