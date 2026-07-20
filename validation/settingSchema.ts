import * as Yup from 'yup';

export const settingsSchema = Yup.object().shape({
  serverUrl: Yup.string().test(
    'is-valid-url',
    'Server URL must start with https:// or http://',
    (value) =>
      !value || value.startsWith('https://') || value.startsWith('http://'),
  ),
  model: Yup.string().optional(),
  apiKey: Yup.string().optional(),
  notificationCapture: Yup.boolean(),
  autoDeduction: Yup.boolean(),
});
