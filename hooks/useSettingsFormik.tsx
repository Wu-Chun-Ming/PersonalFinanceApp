import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

import { settingsSchema } from "@/validation/settingSchema";
import { useCustomFormik } from "./useAppFormik";
import { useModel } from "./useModel";

interface SettingsFormikProps {
    serverUrl: string;
    model: string;
    apiKey: string;
}

export const useSettingsFormik = (initialSettings: SettingsFormikProps) => {
    const { updateAndRefreshModelConfig } = useModel();

    const settingsFormik = useCustomFormik({
        initialValues: initialSettings || {
            serverUrl: '',
            model: '',
            apiKey: '',
        },
        transformValues: (values: SettingsFormikProps) => values,
        validationSchema: settingsSchema,
        onSubmitCallback: async (values) => {
            await SecureStore.setItemAsync("serverUrl", values.serverUrl.trim());
            updateAndRefreshModelConfig(values.model.trim(), values.apiKey.trim());

            Alert.alert("Success", "Settings saved successfully");
        }
    });

    return {
        settingsFormik,
    };
}
