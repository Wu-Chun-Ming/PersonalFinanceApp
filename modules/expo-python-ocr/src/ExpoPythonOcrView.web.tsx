import * as React from 'react';

import { ExpoPythonOcrViewProps } from './ExpoPythonOcr.types';

export default function ExpoPythonOcrView(props: ExpoPythonOcrViewProps) {
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
