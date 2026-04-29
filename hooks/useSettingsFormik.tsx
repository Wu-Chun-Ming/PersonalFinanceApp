import { Alert } from 'react-native';

import { DEFAULT_TIMEOUT_SEC } from '@/constants/api';
import { settingsSchema } from '@/validation/settingSchema';
import { useCustomFormik } from './useAppFormik';
import { useSettings } from './useSettings';

interface SettingsFormikProps {
  serverUrl: string;
  model: string;
  apiKey: string;
  timeout: string;
}

export const useSettingsFormik = (initialSettings: SettingsFormikProps) => {
  const { updateAndRefreshServerConfig, updateAndRefreshModelConfig } =
    useSettings();

  const settingsFormik = useCustomFormik({
    initialValues: initialSettings || {
      serverUrl: '',
      model: '',
      apiKey: '',
      timeout: DEFAULT_TIMEOUT_SEC.toString(),
    },
    transformValues: (values: SettingsFormikProps) => values,
    validationSchema: settingsSchema,
    onSubmitCallback: async (values) => {
      updateAndRefreshServerConfig({
        newServerUrl: values.serverUrl.trim(),
        newTimeoutSeconds: Number(values.timeout),
      });
      updateAndRefreshModelConfig({
        newModelName: values.model.trim(),
        newApiKey: values.apiKey.trim(),
        newTimeoutSeconds: Number(values.timeout),
      });

      Alert.alert('Success', 'Settings saved successfully');
    },
  });

  return {
    settingsFormik,
  };
};
