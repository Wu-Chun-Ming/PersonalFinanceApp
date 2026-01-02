import * as Yup from 'yup';

export const settingsSchema = Yup.object().shape({
    serverUrl: Yup.string()
        .test(
            'is-valid-url',
            'Server URL must start with https:// or http://',
            (value) =>
                !value
                || value.startsWith('https://')
                || value.startsWith('http://')
        ),
    model: Yup.string()
        .when('serverUrl', ([serverUrl], schema) => {
            return (!serverUrl || serverUrl.trim() === '')
                ? schema.required('Model name is required when server URL is not provided')
                : schema.notRequired();
        }),
    apiKey: Yup.string()
        .when('serverUrl', ([serverUrl], schema) => {
            return (!serverUrl || serverUrl.trim() === '')
                ? schema.required('API key is required when server URL is not provided')
                : schema.notRequired();
        }),
})