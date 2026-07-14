import { requireNativeView } from 'expo';
import * as React from 'react';

import { AndroidNotificationListenerViewProps } from './AndroidNotificationListener.types';

const NativeView: React.ComponentType<AndroidNotificationListenerViewProps> =
  requireNativeView('AndroidNotificationListener');

export default function AndroidNotificationListenerView(props: AndroidNotificationListenerViewProps) {
  return <NativeView {...props} />;
}
