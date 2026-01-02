import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

// Gluestack UI
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";

// Custom import
import styles from "@/app/styles";
import FormGroup from "@/components/FormGroup";
import { useSettings } from "@/hooks/useSettings";
import { useSettingsFormik } from "@/hooks/useSettingsFormik";

const SettingsScreen = () => {
    const { serverConfig, modelConfig } = useSettings();

    // Formik setup
    const { settingsFormik: formik } = useSettingsFormik({
        serverUrl: serverConfig.serverUrl || "",
        model: modelConfig.modelName || "",
        apiKey: modelConfig.apiKey || "",
    });

    useFocusEffect(
        useCallback(() => {
            // Reset errors and touched fields when the screen becomes focused
            formik.setErrors({});
            formik.setTouched({});
        }, [])
    );

    return (
        <SafeAreaView style={{
            flex: 1,
            paddingHorizontal: 16,
        }}>
            <Heading size="lg" className="mt-4" underline>Server Configuration</Heading>

            <FormGroup
                label='Server URL'
                isInvalid={Boolean(formik.errors.serverUrl && formik.touched.serverUrl)}
                errorText={formik.errors.serverUrl}
            >
                <Input className="text-center">
                    <InputField
                        type="text"
                        value={formik.values.serverUrl}
                        onChangeText={formik.handleChange('serverUrl')}
                        placeholder="https://api.yourfinanceapp.com"
                        inputMode='text'
                    />
                </Input>
            </FormGroup>

            <Heading size="lg" className="mt-4" underline>Model Configuration</Heading>

            <FormGroup
                label='Model Name'
                isInvalid={Boolean(formik.errors.model && formik.touched.model)}
                errorText={formik.errors.model}
            >
                <Input className="text-center">
                    <InputField
                        type="text"
                        value={formik.values.model}
                        onChangeText={formik.handleChange('model')}
                        placeholder="Enter model name"
                        inputMode='text'
                    />
                </Input>
            </FormGroup>

            <FormGroup
                label='API Key (OpenRouter)'
                isInvalid={Boolean(formik.errors.apiKey && formik.touched.apiKey)}
                errorText={formik.errors.apiKey}
            >
                <Input className="text-center">
                    <InputField
                        type="text"
                        value={formik.values.apiKey}
                        onChangeText={formik.handleChange('apiKey')}
                        placeholder="Enter API key"
                        inputMode='text'
                        secureTextEntry
                    />
                </Input>
            </FormGroup>

            <View style={{
                flex: 1,
                justifyContent: 'flex-end',
                paddingBottom: 20,
            }}>
                <TouchableOpacity
                    style={[styles.centered, {
                        backgroundColor: "#1e90ff",
                        padding: 15,
                        borderRadius: 8,
                    }]}
                    onPress={() => formik.handleSubmit()}
                >
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'white',
                    }}>Save Settings</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default SettingsScreen;