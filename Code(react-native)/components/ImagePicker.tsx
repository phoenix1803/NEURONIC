/**
 * ImagePicker Component
 * Camera/gallery options using expo-image-picker
 * Requirements: 3.1
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';

interface ImagePickerProps {
    onImageSelected: (imageUri: string) => void;
    isProcessing?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
    onImageSelected,
    isProcessing = false,
}) => {
    const [previewUri, setPreviewUri] = useState<string | null>(null);

    const requestCameraPermission = async (): Promise<boolean> => {
        const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Camera access is needed to take photos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const requestMediaLibraryPermission = async (): Promise<boolean> => {
        const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Photo library access is needed to select images.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        if (isProcessing) return;

        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        try {
            const result = await ExpoImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                setPreviewUri(uri);
                onImageSelected(uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };


    const pickFromGallery = async () => {
        if (isProcessing) return;

        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) return;

        try {
            const result = await ExpoImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                setPreviewUri(uri);
                onImageSelected(uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    };

    const clearPreview = () => {
        setPreviewUri(null);
    };

    return (
        <View className="py-4">
            {/* Image Preview */}
            {previewUri && (
                <View className="items-center mb-4">
                    <View className="relative">
                        <Image
                            source={{ uri: previewUri }}
                            className="w-64 h-48 rounded-xl"
                            resizeMode="cover"
                        />
                        {!isProcessing && (
                            <Pressable
                                onPress={clearPreview}
                                className="absolute top-2 right-2 bg-black/50 rounded-full w-8 h-8 items-center justify-center"
                            >
                                <Text className="text-white text-lg">✕</Text>
                            </Pressable>
                        )}
                    </View>
                    {isProcessing && (
                        <Text className="text-gray-400 text-sm mt-2">
                            Processing image...
                        </Text>
                    )}
                </View>
            )}

            {/* Action Buttons */}
            {!previewUri && (
                <View className="flex-row justify-center gap-4 px-4">
                    {/* Camera Button */}
                    <Pressable
                        onPress={takePhoto}
                        disabled={isProcessing}
                        className={`flex-1 items-center py-6 rounded-xl ${isProcessing ? 'bg-gray-700' : 'bg-surface'
                            } active:opacity-80`}
                    >
                        <Text className="text-4xl mb-2">📷</Text>
                        <Text className="text-white text-sm">Camera</Text>
                    </Pressable>

                    {/* Gallery Button */}
                    <Pressable
                        onPress={pickFromGallery}
                        disabled={isProcessing}
                        className={`flex-1 items-center py-6 rounded-xl ${isProcessing ? 'bg-gray-700' : 'bg-surface'
                            } active:opacity-80`}
                    >
                        <Text className="text-4xl mb-2">🖼️</Text>
                        <Text className="text-white text-sm">Gallery</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

export default ImagePicker;
