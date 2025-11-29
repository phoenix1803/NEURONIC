/**
 * Toast Component
 * User-friendly toast notifications for errors and success messages
 * Requirements: 10.4
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss: () => void;
}

const TOAST_ICONS: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
};

const TOAST_COLORS: Record<ToastType, { bg: string; border: string }> = {
    success: { bg: 'bg-green-900/90', border: 'border-green-500' },
    error: { bg: 'bg-red-900/90', border: 'border-red-500' },
    info: { bg: 'bg-blue-900/90', border: 'border-blue-500' },
    warning: { bg: 'bg-yellow-900/90', border: 'border-yellow-500' },
};

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = 'info',
    duration = 3000,
    onDismiss,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss
            const timer = setTimeout(() => {
                dismissToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration]);

    const dismissToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -20,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    if (!visible) return null;

    const colors = TOAST_COLORS[type];

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY }],
            }}
            className="absolute top-12 left-4 right-4 z-50"
        >
            <Pressable onPress={dismissToast}>
                <View
                    className={`${colors.bg} ${colors.border} border rounded-xl px-4 py-3 flex-row items-center shadow-lg`}
                >
                    <Text className="text-white text-lg mr-3">{TOAST_ICONS[type]}</Text>
                    <Text className="text-white flex-1 text-sm">{message}</Text>
                    <Text className="text-gray-400 text-xs ml-2">Tap to dismiss</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default Toast;
