export const NotificationStatus = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  FAILED: 'failed',
};

export type NotificationStatusType =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export interface NotificationProps {
  id?: number;
  notification_key: string;
  package_name: string;
  title: string;
  message: string;
  post_time: Date;
  status: NotificationStatusType;
}
