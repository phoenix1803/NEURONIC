/**
 * LoadingOverlay Component
 * Full-screen loading overlay with spinner and optional message
 * Requirements: 10.4
 */

import React from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    message = 'Loading...',
}) => {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View className="flex-1 bg-black/70 justify-center items-center">
                <View className="bg-surface rounded-2xl px-8 py-6 items-center mx-8">
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text className="text-white text-base mt-4 text-center">{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

export default LoadingOverlay;
