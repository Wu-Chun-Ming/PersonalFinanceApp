import Fontisto from '@expo/vector-icons/build/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Gluestack UI
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import { ScanContext } from '@/app/transaction/_layout';
import ImageViewer from '@/components/ImageViewer';
import { TransactionType } from '@/constants/Types';

const ScanScreen = () => {
    const { setScannedData } = useContext(ScanContext);
    const [selectedImage, setSelectedImage] = useState(null);

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        } else {
            alert('You did not select any image.');
        }
    }

    const camera = useRef<CameraView>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const router = useRouter();

    const [camPerm, reqCamPerm] = ImagePicker.useCameraPermissions();
    const [libPerm, reqLibPerm] = ImagePicker.useMediaLibraryPermissions();
    const [permissionsChecked, setPermissionsChecked] = useState(false);
    const [loading, setLoading] = useState(false);

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
            console.error('Error while checking permissions:', error);
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
            setSelectedImage(photo.uri);
        } catch (error) {
            console.error('Error taking picture:', error);
            Alert.alert("Error", "Something went wrong while taking the picture.");
        }

    };

    const scanImage = async () => {
        // Return if no selected image 
        if (selectedImage == null) {
            return;
        }

        const formData = new FormData();
        formData.append('image', {
            uri: selectedImage,
            name: 'receipt.jpg',
            type: 'image/jpeg',
        } as any);

        setLoading(true);
        let didTimeout = false;

        // Create a 30s timeout
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            setLoading(false);
            Alert.alert('Error', 'The request timed out. Please try again.');
        }, 30000);

        await fetch(`${process.env.EXPO_PUBLIC_SCAN_IMAGE_API_URL}`, {
            method: 'POST',
            body: formData,
        })
            .then(async (response) => {
                clearTimeout(timeoutId); // clear timeout if response arrives
                const data = await response.json();
                return data.result;
            })
            .then((data) => {
                const lineItems = Array.isArray(data.line_items) ? data.line_items : [data.line_items];
                setScannedData(lineItems.map((item) => ({
                    date: dayjs().format('YYYY-MM-DD'),
                    type: TransactionType.EXPENSE,
                    category: '',
                    amount: Number(item.total),
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
                })));
                // Multiple items detected
                if (lineItems.length > 1) {
                    router.dismiss(1);
                    router.replace(`/transaction/listing`);
                } else {        // Single item detected
                    router.back();
                }
            })
            .catch((error) => {
                clearTimeout(timeoutId); // clear timeout if error occurs
                if (!didTimeout) {
                    console.log(`Error: ${error.message}`);
                    Alert.alert('Error', 'Failed to scan image. Please try again.');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        // Check camera and media library permissions if not checked
        if (camPerm !== null && libPerm !== null && !permissionsChecked) {
            checkPermissions();
        }
    }, [camPerm, libPerm, selectedImage]);

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

            <VStack space='md' style={{
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
                </View>
                <View
                    className='justify-center self-center border'
                    style={{
                        width: '80%',
                        height: '70%',
                    }}
                >
                    {selectedImage
                        ? <ImageViewer selectedImage={selectedImage} />
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
                        scanImage();
                    }} >
                        <Fontisto name="picture" size={55} color="black" />
                    </Button>

                    {!selectedImage
                        ? <Button className='h-auto flex-1 self-center' size="md" variant="link" action="secondary"
                            onPress={() => {
                                takePicture();
                            }}       // saved pic not working in emulator 
                        >
                            <MaterialCommunityIcons name="circle-outline" size={70} color="black" />
                        </Button>
                        : <Button className='h-auto flex-1 self-center' size="md" variant="link" action="secondary"
                            onPress={scanImage}
                        >
                            <MaterialCommunityIcons name="check-circle-outline" size={80} color="green" />
                        </Button>}

                    {!selectedImage
                        ? <View className='flex-1' />
                        : <Button className='h-auto flex-1 self-center' size="md" variant="link" action="secondary"
                            onPress={() => setSelectedImage(null)}
                        >
                            <MaterialCommunityIcons name="reload" size={75} color="black" />
                        </Button>}
                </View>
            </VStack>
        </SafeAreaView>
    );
};

export default ScanScreen;
