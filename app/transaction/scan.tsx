import Fontisto from '@expo/vector-icons/build/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';

// Gluestack UI
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

// Custom import
import { ScanContext } from '@/app/transaction/_layout';
import ImageViewer from '@/components/ImageViewer';

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

        const response = await axios.post(`${process.env.EXPO_PUBLIC_SCAN_IMAGE_API_URL}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 20000, // 20 seconds
        })
            .then(async (response) => {
                return response.data.result;
            })
            .then((data) => {
                setScannedData({
                    amount: data.line_items.total,
                    description: data.line_items.description,
                });
                router.back();
            })
            .catch((error) => {
                if (error.code === 'ECONNABORTED') {
                    console.warn('Request timed out');
                } else {
                    console.log(`Error: ${error.message}`);
                }
            });
    }

    useEffect(() => {
        // Check camera and media library permissions if not checked
        if (camPerm !== null && libPerm !== null && !permissionsChecked) {
            checkPermissions();
        }
    }, [camPerm, libPerm, selectedImage]);

    return (
        <VStack space='md'>
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
                    marginVertical: 10,
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
    );
};

export default ScanScreen;
