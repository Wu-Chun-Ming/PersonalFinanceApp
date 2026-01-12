import Fontisto from '@expo/vector-icons/build/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { OCR_ENGLISH, useOCR } from 'react-native-executorch';
import { SafeAreaView } from 'react-native-safe-area-context';

// Gluestack UI
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import ImageViewer from '@/components/ImageViewer';
import { useScanContext } from '@/hooks/useScanContext';
import { useSettings } from '@/hooks/useSettings';
import {
    processOnlineShoppingOcr,
    sendOcrRequestToServer,
} from '@/services/ocr';
import {
    OcrMode,
    OcrModeType,
    TransactionType,
} from '@/types';

const ScanScreen = () => {
    const { setScannedData } = useScanContext();
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImageUri(result.assets[0].uri);
        } else {
            Alert.alert('You did not select any image.');
        }
    }

    const camera = useRef<CameraView>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const router = useRouter();

    const [camPerm, reqCamPerm] = ImagePicker.useCameraPermissions();
    const [libPerm, reqLibPerm] = ImagePicker.useMediaLibraryPermissions();
    const [permissionsChecked, setPermissionsChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedMode, setSelectedMode] = useState<OcrModeType>(OcrMode.RECEIPT);
    const model = useOCR({ model: OCR_ENGLISH });
    const { isServerConfigured, isModelConfigured } = useSettings();

    const checkPermissions = async () => {
        try {
            // Only proceed if permissions are not null (i.e., after hooks resolve)
            if (camPerm === null || libPerm === null) {
                return; // If permission state is still null, exit the function
            }

            // Check camera permissions
            if (!camPerm.granted) {
                await reqCamPerm();  // Request camera permission
            }

            // Check media library permissions
            if (!libPerm.granted) {
                await reqLibPerm();  // Request media library permission
            }
        } catch (error) {
            console.error('Error while checking permissions:', (error as Error).message);
            Alert.alert('An error occurred while checking permissions. Please try again.');
        } finally {
            setPermissionsChecked(true);  // Mark permissions as checked after the check process
        }
    };

    const takePicture = async () => {
        if (!camera.current) {
            Alert.alert("Camera is not ready yet.");
            return; // If camera ref is null, exit the function early.
        }

        try {
            const photo = await camera.current.takePictureAsync();
            if (!photo || !photo.uri) {
                Alert.alert("Error", "Failed to take picture.");
                return; // Exit if photo is invalid or URI is missing
            }
            setSelectedImageUri(photo.uri);
        } catch (error) {
            console.error('Error taking picture:', (error as Error).message);
            Alert.alert("Error", "Something went wrong while taking the picture.");
        }

    };

    const scanImage = async (imageUri: string) => {
        setLoading(true);
        let didTimeout = false;

        // Create a 40s timeout
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            setLoading(false);
            Alert.alert('Error', 'The request timed out. Please try again.');
        }, 40000);

        let ocrResult: {
            date: string;
            category: string;
            description: string;
            total: number;
        }[] = [];

        if (isServerConfigured) {
            ocrResult = await sendOcrRequestToServer(imageUri, selectedMode);
        } else if (isModelConfigured) {
            switch (selectedMode) {
                case OcrMode.RECEIPT:
                    Alert.alert('Comming Soon', 'Receipt OCR using local model is coming soon!');
                    break;
                case OcrMode.ONLINE_SHOPPING:
                    ocrResult = await processOnlineShoppingOcr(model, imageUri);
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
    }

    useEffect(() => {
        if (!isServerConfigured && !isModelConfigured) {
            Alert.alert('Configuration Required', 'Please configure the server or model settings first.', [
                {
                    text: 'Go to Settings',
                    onPress: () => {
                        router.push('/settings');
                    },
                },
            ]);
        }
        // Check camera and media library permissions if not checked
        if (camPerm !== null && libPerm !== null && !permissionsChecked) {
            checkPermissions();
        }
    }, [camPerm, libPerm, permissionsChecked, selectedImageUri, isServerConfigured, isModelConfigured]);

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#25292e',
        }} edges={['bottom']}>

            {loading && (
                <View style={[styles.centered, {
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    zIndex: 1000,
                }]}>
                    <ActivityIndicator size={80} color="#fff" />
                </View>
            )}

            <VStack space='xs' style={{
                flex: 1,
                backgroundColor: '#fff',
            }}>
                <View
                    className="self-center"
                    style={{
                        marginTop: 20,
                        marginVertical: 10,
                    }}
                >
                    <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                    }}>Scan or Upload Image</Text>
                    <HStack style={styles.centered}>
                        <Text style={styles.boldText}>Mode:</Text>
                        <Dropdown
                            data={[
                                { label: 'Receipt', value: OcrMode.RECEIPT },
                                { label: 'Online Shopping', value: OcrMode.ONLINE_SHOPPING },
                            ]}
                            labelField="label"
                            valueField="value"
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
                            itemTextStyle={[styles.text, {
                                textAlign: 'center',
                            }]}
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
                    {selectedImageUri
                        ? <ImageViewer selectedImage={selectedImageUri} />
                        : <CameraView
                            ref={camera}
                            style={{
                                flex: 1,
                            }}
                            facing={facing}
                        >
                        </CameraView>}
                </View>

                <View
                    className="flex-row w-full"
                    style={{
                        height: 80,
                    }}
                >
                    <Button className='h-auto flex-1' size="md" variant="link" action="secondary" onPress={async () => {
                        await pickImageAsync();
                    }} >
                        <Fontisto name="picture" size={55} color="black" />
                    </Button>

                    {!selectedImageUri
                        ? <Button className='h-auto flex-1 self-center' size="md" variant="link" action="secondary"
                            onPress={() => {
                                takePicture();
                            }}       // saved pic not working in emulator 
                        >
                            <MaterialCommunityIcons name="circle-outline" size={70} color="black" />
                        </Button>
                        : <Button className='h-auto flex-1 self-center' size="md" variant="link" action="secondary"
                            onPress={() => scanImage(selectedImageUri)}
                        >
                            <MaterialCommunityIcons name="check-circle-outline" size={80} color="green" />
                        </Button>}

                    {!selectedImageUri
                        ? <View className='flex-1' />
                        : <Button className='h-auto flex-1 self-center' size="md" variant="link" action="secondary"
                            onPress={() => setSelectedImageUri(null)}
                        >
                            <MaterialCommunityIcons name="reload" size={75} color="black" />
                        </Button>}
                </View>
            </VStack>
        </SafeAreaView>
    );
};

export default ScanScreen;
