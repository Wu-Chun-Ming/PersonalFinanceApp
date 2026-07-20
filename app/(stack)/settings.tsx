import { useCallback, useEffect } from 'react';
import { AppState, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

// Gluestack UI
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';

// Custom import
import styles from '@/app/styles';
import AppSwitch from '@/components/AppSwitch';
import FormGroup from '@/components/FormGroup';
import { DEFAULT_TIMEOUT_SEC } from '@/constants/api';
import { useSettings } from '@/hooks/useSettings';
import { useSettingsFormik } from '@/hooks/useSettingsFormik';
import * as AndroidNotificationListener from '@/modules/android-notification-listener';

const SettingsScreen = () => {
  const { serverConfig, modelConfig, preferences } = useSettings();

  // Formik setup
  const { settingsFormik: formik } = useSettingsFormik({
    serverUrl: serverConfig.serverUrl || '',
    model: modelConfig.modelName || '',
    apiKey: modelConfig.apiKey || '',
    timeout: modelConfig.timeout?.toString() || DEFAULT_TIMEOUT_SEC.toString(),
    notificationCapture: preferences.notificationCapture,
    autoDeduction: preferences.autoDeduction,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const enabled =
          await AndroidNotificationListener.isNotificationListenerEnabled();

        formik.setFieldValue('notificationCapture', enabled, false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reset errors and touched fields when the screen becomes focused
      formik.setErrors({});
      formik.setTouched({});
    }, []),
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 16,
      }}
      edges={['bottom']}
    >
      <Heading
        size='lg'
        className='mt-4'
        underline
      >
        Server Configuration
      </Heading>

      <FormGroup
        label='Server URL'
        isInvalid={Boolean(formik.errors.serverUrl && formik.touched.serverUrl)}
        errorText={formik.errors.serverUrl}
      >
        <Input className='text-center'>
          <InputField
            type='text'
            value={formik.values.serverUrl}
            onChangeText={formik.handleChange('serverUrl')}
            placeholder='https://api.yourfinanceapp.com'
            inputMode='text'
          />
        </Input>
      </FormGroup>

      <Heading
        size='lg'
        className='mt-4'
        underline
      >
        Model Configuration
      </Heading>

      <FormGroup
        label='Model Name'
        isInvalid={Boolean(formik.errors.model && formik.touched.model)}
        errorText={formik.errors.model}
      >
        <Input className='text-center'>
          <InputField
            type='text'
            value={formik.values.model}
            onChangeText={formik.handleChange('model')}
            placeholder='Enter model name'
            inputMode='text'
          />
        </Input>
      </FormGroup>

      <FormGroup
        label='API Key (OpenRouter)'
        isInvalid={Boolean(formik.errors.apiKey && formik.touched.apiKey)}
        errorText={formik.errors.apiKey}
      >
        <Input className='text-center'>
          <InputField
            type='text'
            value={formik.values.apiKey}
            onChangeText={formik.handleChange('apiKey')}
            placeholder='Enter API key'
            inputMode='text'
            secureTextEntry
          />
        </Input>
      </FormGroup>

      <Heading
        size='lg'
        className='mt-4'
        underline
      >
        Preferences
      </Heading>

      <FormGroup
        label='Request Timeout (seconds)'
        isInvalid={Boolean(formik.errors.timeout && formik.touched.timeout)}
        errorText={formik.errors.timeout}
      >
        <Input className='text-center'>
          <InputField
            type='text'
            value={formik.values.timeout}
            onChangeText={formik.handleChange('timeout')}
            placeholder='Enter request timeout in seconds'
            inputMode='numeric'
          />
        </Input>
      </FormGroup>

      <AppSwitch
        value={formik.values.notificationCapture}
        onToggle={async () => {
          await AndroidNotificationListener.openNotificationSettings();
          formik.setFieldValue(
            'notificationCapture',
            !formik.values.notificationCapture,
          );
        }}
        label='Enable Notification Capture'
      />

      <AppSwitch
        value={formik.values.autoDeduction}
        onToggle={() =>
          formik.setFieldValue('autoDeduction', !formik.values.autoDeduction)
        }
        label='Auto Deduction for Past Transactions'
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity
          style={[
            styles.centered,
            {
              backgroundColor: '#1e90ff',
              padding: 15,
              borderRadius: 8,
            },
          ]}
          onPress={() => formik.handleSubmit()}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Save Settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
