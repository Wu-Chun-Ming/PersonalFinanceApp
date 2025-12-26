import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoPythonOcrViewProps } from './ExpoPythonOcr.types';

const NativeView: React.ComponentType<ExpoPythonOcrViewProps> =
  requireNativeView('ExpoPythonOcr');

export default function ExpoPythonOcrView(props: ExpoPythonOcrViewProps) {
  return <NativeView {...props} />;
}
