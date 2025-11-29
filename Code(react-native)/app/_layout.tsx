import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModelDownloadScreen } from '../components/ModelDownloadScreen';
import { ToastProvider } from '../components/ToastProvider';
import { STORAGE_KEYS } from '../constants';
import { useAppStore } from '../store';
import { initializeDatabase } from '../db';
import { logError } from '../utils/errorHandler';
import '../global.css';

type AppInitState = 'checking' | 'downloading' | 'ready' | 'error';

export default function RootLayout() {
    const [initState, setInitState] = useState<AppInitState>('checking');
    const [initError, setInitError] = useState<string | null>(null);
    const setIsModelReady = useAppStore((state) => state.setIsModelReady);

    const checkModelsDownloaded = useCallback(async (): Promise<boolean> => {
        try {
            const modelsDownloaded = await AsyncStorage.getItem(STORAGE_KEYS.modelsDownloaded);
            return modelsDownloaded === 'true';
        } catch (error) {
            logError('checkModelsDownloaded', error);
            return false;
        }
    }, []);

    const initializeApp = useCallback(async () => {
        setInitError(null);
        try {
            // Initialize database first
            await initializeDatabase();

            // Check if models are already downloaded
            const modelsReady = await checkModelsDownloaded();

            if (modelsReady) {
                // Models already downloaded, app is ready
                setIsModelReady(true);
                setInitState('ready');
            } else {
                // Need to download models
                setInitState('downloading');
            }
        } catch (error) {
            logError('initializeApp', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            setInitError(`Failed to initialize app: ${message}`);
            setInitState('error');
        }
    }, [checkModelsDownloaded, setIsModelReady]);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const handleDownloadComplete = useCallback(() => {
        setIsModelReady(true);
        setInitState('ready');
    }, [setIsModelReady]);

    const handleRetryInit = useCallback(() => {
        setInitState('checking');
        initializeApp();
    }, [initializeApp]);

    // Show loading spinner while checking initial state
    if (initState === 'checking') {
        return (
            <View className="flex-1 bg-[#0f0f1a] justify-center items-center">
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#a855f7" />
                <Text className="text-gray-400 mt-4">Initializing...</Text>
            </View>
        );
    }

    // Show error state with retry option
    if (initState === 'error') {
        return (
            <View className="flex-1 bg-[#0f0f1a] justify-center items-center px-6">
                <StatusBar style="light" />
                <Text className="text-4xl mb-4">😕</Text>
                <Text className="text-white text-lg font-semibold mb-2 text-center">
                    Initialization Failed
                </Text>
                <Text className="text-gray-400 text-center mb-6">
                    {initError || 'An unexpected error occurred'}
                </Text>
                <Pressable
                    onPress={handleRetryInit}
                    className="bg-purple-600 px-8 py-3 rounded-xl active:bg-purple-700"
                >
                    <Text className="text-white font-semibold">Retry</Text>
                </Pressable>
            </View>
        );
    }

    // Show model download screen if models need to be downloaded
    if (initState === 'downloading') {
        return (
            <>
                <StatusBar style="light" />
                <ModelDownloadScreen onComplete={handleDownloadComplete} />
            </>
        );
    }

    // App is ready, show main navigation
    return (
        <ToastProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="memory/[id]"
                    options={{
                        headerShown: true,
                        title: 'Memory Details',
                        headerStyle: { backgroundColor: '#1a1a2e' },
                        headerTintColor: '#fff',
                    }}
                />
            </Stack>
        </ToastProvider>
    );
}
