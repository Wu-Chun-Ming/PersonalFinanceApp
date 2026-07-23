import * as Yup from 'yup';

import { NOTIFICATION_STATUS } from '@/constants/notification';

export const notificationSchema = Yup.object().shape({
  notification_key: Yup.string().required('Notification key is required'),
  package_name: Yup.string().required('Package name is required'),
  title: Yup.string().required('Title is required'),
  message: Yup.string().required('Message is required'),
  post_time: Yup.date()
    .typeError('Post time must be a valid date')
    .required('Post time is required'),
  status: Yup.string()
    .oneOf(NOTIFICATION_STATUS, 'Invalid type')
    .required('Status is required'),
});
