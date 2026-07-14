import * as React from 'react';

import { AndroidNotificationListenerViewProps } from './AndroidNotificationListener.types';

export default function AndroidNotificationListenerView(props: AndroidNotificationListenerViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
