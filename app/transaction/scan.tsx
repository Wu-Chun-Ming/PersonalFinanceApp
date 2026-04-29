import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

// Gluestack UI
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import ImageViewer from '@/components/ImageViewer';
import { DEFAULT_TIMEOUT_SEC } from '@/constants/api';
import { useLLMContext } from '@/hooks/useLLMContext';
import { useOCRContext } from '@/hooks/useOCRContext';
import { useScanContext } from '@/hooks/useScanContext';
import { useSettings } from '@/hooks/useSettings';
import {
  processOnlineShoppingOcr,
  sendOcrRequestToServer,
} from '@/services/ocr';
import {
  AbortReason,
  AbortReasonType,
  OcrMode,
  OcrModeType,
  TransactionType,
} from '@/types';

const ScanScreen = () => {
  const router = useRouter();
  const { setScannedData } = useScanContext();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [imageBase64Str, setImageBase64Str] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<OcrModeType>(
    OcrMode.RECEIPT,
  );
  const { serverConfig, isServerConfigured, modelConfig, isModelConfigured } =
    useSettings();
  const ocrModel = useOCRContext();
  const llmModel = useLLMContext();
  const isModelLoading =
    (ocrModel && !ocrModel.isReady) || (llmModel && !llmModel.isReady);
  const [loading, setLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const abortReasonRef = useRef<AbortReasonType | null>(null);
  // Camera ref
  const camera = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  // Permissions
  const [camPerm, reqCamPerm] = ImagePicker.useCameraPermissions();
  const [libPerm, reqLibPerm] = ImagePicker.useMediaLibraryPermissions();
  const [permissionsChecked, setPermissionsChecked] = useState(false);

  const checkPermissions = async () => {
    try {
      // Only proceed if permissions are not null
      if (camPerm === null || libPerm === null) {
        return;
      }

      // Check camera permissions
      if (!camPerm.granted) {
        await reqCamPerm(); // Request camera permission
      }

      // Check media library permissions
      if (!libPerm.granted) {
        await reqLibPerm(); // Request media library permission
      }
    } catch (error) {
      console.error(
        'Error while checking permissions:',
        (error as Error).message,
      );
      Alert.alert(
        'An error occurred while checking permissions. Please try again.',
      );
    } finally {
      setPermissionsChecked(true); // Mark permissions as checked after the check process
    }
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImageBase64Str(result.assets[0].base64 || '');
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (!camera.current) {
      Alert.alert('Camera is not ready yet.');
      return;
    }

    try {
      const photo = await camera.current.takePictureAsync();
      if (!photo || !photo.uri) {
        Alert.alert('Error', 'Failed to take picture.');
        return; // Exit if photo is invalid or URI is missing
      }
      setImageBase64Str(photo.base64 || '');
      setSelectedImageUri(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', (error as Error).message);
      Alert.alert('Error', 'Something went wrong while taking the picture.');
    }
  };

  const scanImage = async (imageUri: string) => {
    abortControllerRef.current?.abort(); // cancel previous run if any
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    setLoading(true);

    const timeoutMs = (() => {
      if (isServerConfigured)
        return (serverConfig.timeout ?? DEFAULT_TIMEOUT_SEC) * 1000;
      if (isModelConfigured)
        return (modelConfig.timeout ?? DEFAULT_TIMEOUT_SEC) * 1000;
      return DEFAULT_TIMEOUT_SEC * 1000;
    })();
    // Create timeout
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setIsSlow(true);
    }, timeoutMs);

    let ocrResult: {
      date: string;
      category: string;
      description: string;
      total: number;
    }[] = [];

    if (isServerConfigured) {
      try {
        ocrResult = await sendOcrRequestToServer(imageUri, selectedMode);
      } catch (error) {
        console.error(
          'Error during server OCR request:',
          (error as Error).message,
        );
        Alert.alert(
          'Error',
          'Failed to scan image using server OCR. Please try again.',
        );
        return;
      }
    } else if (isModelConfigured && ocrModel && llmModel) {
      try {
        switch (selectedMode) {
          case OcrMode.RECEIPT:
            Alert.alert(
              'Comming Soon',
              'Receipt OCR using local model is coming soon!',
            );
            break;
          case OcrMode.ONLINE_SHOPPING:
            ocrResult = await processOnlineShoppingOcr(
              ocrModel,
              llmModel,
              {
                uri: imageUri,
                base64: imageBase64Str,
              },
              {
                signal,
                reasonRef: abortReasonRef,
              },
            );
            break;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        setLoading(false);
        setIsSlow(false);
        console.error(
          'Error during model OCR request:',
          (error as Error).message,
        );
        Alert.alert(
          'Error',
          'Failed to scan image using model OCR. Please try again. (' +
            (error as Error).message +
            ')',
        );
        return;
      }
    }

    // Convert OCR result to scanned data format
    const result = ocrResult.map((item) => ({
      date: item.date || dayjs().format('YYYY-MM-DD'),
      type: TransactionType.EXPENSE,
      category: item.category,
      amount: item.total.toString(),
      description: item.description,
      recurring: false,
      recurring_frequency: {
        frequency: '',
        time: {
          month: '',
          date: '',
          day: '',
        },
      },
      currency: 'MYR',
    }));
    setScannedData(result);

    // If items detected
    if (result.length > 0) {
      clearTimeout(timeoutId); // clear timeout if response arrives
      setLoading(false);
      router.dismiss(1);
      router.replace(`/transaction/listing`);
    }
  };

  useEffect(() => {
    if (!ocrModel?.isReady || !llmModel?.isReady) return;

    if (!isServerConfigured && !isModelConfigured) {
      Alert.alert(
        'Configuration Required',
        'Please configure the server or model settings first.',
        [
          {
            text: 'Go to Settings',
            onPress: () => {
              router.push('/settings');
            },
          },
        ],
      );
    }
    // Check camera and media library permissions if not checked
    if (camPerm !== null && libPerm !== null && !permissionsChecked) {
      checkPermissions();
    }
  }, [
    ocrModel?.isReady,
    llmModel?.isReady,
    isServerConfigured,
    isModelConfigured,
    camPerm,
    libPerm,
    permissionsChecked,
  ]);

  // Show model loading progress
  if (isModelLoading) {
    const ocrProgress = ocrModel?.downloadProgress ?? 0;
    const llmProgress = llmModel?.downloadProgress ?? 0;

    return (
      <View
        style={[
          styles.centered,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
          },
        ]}
      >
        <ActivityIndicator
          size={80}
          color='#fff'
        />
        {/* OCR */}
        {ocrModel && !ocrModel.isReady && (
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              color: '#fff',
            }}
          >
            {`Loading OCR model ${(ocrProgress * 100).toFixed(0)} %`}
          </Text>
        )}

        {/* LLM */}
        {llmModel && !llmModel.isReady && (
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              color: '#fff',
            }}
          >
            {`Loading LLM model ${(llmProgress * 100).toFixed(0)} %`}
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#25292e',
      }}
      edges={['bottom']}
    >
      {(loading || isSlow) && (
        <View
          style={[
            styles.centered,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 1000,
            },
          ]}
        >
          <ActivityIndicator
            size={80}
            color='#fff'
          />
          <Text
            style={{
              marginTop: 20,
              fontSize: 18,
              color: '#fff',
            }}
          >
            {loading && 'Processing Image...'}
            {isSlow && 'Still processing... this may take a little longer'}
          </Text>
          {isSlow && (
            <Button
              className='mt-4'
              size='md'
              action='negative'
              onPress={() => {
                setIsSlow(false);
                abortControllerRef.current?.abort(AbortReason.USER_ABORT);
              }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          )}
        </View>
      )}

      <VStack
        space='xs'
        style={{
          flex: 1,
          backgroundColor: '#fff',
        }}
      >
        <View
          className='self-center'
          style={{
            marginTop: 20,
            marginVertical: 10,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
            }}
          >
            Scan or Upload Image
          </Text>
          <HStack style={styles.centered}>
            <Text style={styles.boldText}>Mode:</Text>
            <Dropdown
              data={[
                { label: 'Receipt', value: OcrMode.RECEIPT },
                { label: 'Online Shopping', value: OcrMode.ONLINE_SHOPPING },
              ]}
              labelField='label'
              valueField='value'
              value={selectedMode}
              onChange={(item) => setSelectedMode(item.value)}
              style={{
                marginTop: 5,
                marginLeft: 5,
                padding: 5,
                borderWidth: 1,
                borderRadius: 10,
                minWidth: 150,
              }}
              selectedTextStyle={{
                textAlign: 'center',
              }}
              itemTextStyle={[
                styles.text,
                {
                  textAlign: 'center',
                },
              ]}
            />
          </HStack>
        </View>
        <View
          className='justify-center self-center border'
          style={{
            width: '80%',
            height: '65%',
          }}
        >
          {selectedImageUri ? (
            <ImageViewer selectedImage={selectedImageUri} />
          ) : (
            <CameraView
              ref={camera}
              style={{
                flex: 1,
              }}
              facing={facing}
            ></CameraView>
          )}
        </View>

        <View
          className='flex-row w-full'
          style={{
            height: 80,
          }}
        >
          <Button
            className='h-auto flex-1'
            size='md'
            variant='link'
            action='secondary'
            onPress={async () => {
              await pickImageAsync();
            }}
          >
            <Fontisto
              name='picture'
              size={55}
              color='black'
            />
          </Button>

          {!selectedImageUri ? (
            <Button
              className='h-auto flex-1 self-center'
              size='md'
              variant='link'
              action='secondary'
              onPress={() => {
                takePicture();
              }}
            >
              <MaterialCommunityIcons
                name='circle-outline'
                size={70}
                color='black'
              />
            </Button>
          ) : (
            <Button
              className='h-auto flex-1 self-center'
              size='md'
              variant='link'
              action='secondary'
              onPress={() => scanImage(selectedImageUri)}
            >
              <MaterialCommunityIcons
                name='check-circle-outline'
                size={80}
                color='green'
              />
            </Button>
          )}

          {!selectedImageUri ? (
            <View className='flex-1' />
          ) : (
            <Button
              className='h-auto flex-1 self-center'
              size='md'
              variant='link'
              action='secondary'
              onPress={() => setSelectedImageUri(null)}
            >
              <MaterialCommunityIcons
                name='reload'
                size={75}
                color='black'
              />
            </Button>
          )}
        </View>
      </VStack>
    </SafeAreaView>
  );
};

export default ScanScreen;
