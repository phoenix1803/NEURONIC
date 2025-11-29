/**
 * ModelDownloadScreen Component
 * Shows model download progress on first launch
 * Downloads text, vision, and STT models sequentially
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, MODEL_CONFIG } from '../constants';
import {
    initTextModel,
    initVisionModel,
    initSTTModel,
} from '../services/cactus';

type ModelType = 'text' | 'vision' | 'stt';

interface ModelDownloadScreenProps {
    onComplete: () => void;
}

interface DownloadState {
    currentModel: ModelType | null;
    progress: number;
    error: string | null;
    isComplete: boolean;
}

const MODEL_LABELS: Record<ModelType, string> = {
    text: 'Text & Embedding Model',
    vision: 'Vision Model',
    stt: 'Speech-to-Text Model',
};

const MODEL_DESCRIPTIONS: Record<ModelType, string> = {
    text: MODEL_CONFIG.text.model,
    vision: MODEL_CONFIG.vision.model,
    stt: MODEL_CONFIG.stt.model,
};

export function ModelDownloadScreen({ onComplete }: ModelDownloadScreenProps) {
    const [downloadState, setDownloadState] = useState<DownloadState>({
        currentModel: null,
        progress: 0,
        error: null,
        isComplete: false,
    });
    const [overallProgress, setOverallProgress] = useState(0);
    const [completedModels, setCompletedModels] = useState<ModelType[]>([]);

    const downloadModels = useCallback(async () => {
        const models: ModelType[] = ['text', 'vision', 'stt'];
        const modelInitFunctions = {
            text: initTextModel,
            vision: initVisionModel,
            stt: initSTTModel,
        };

        setDownloadState({
            currentModel: null,
            progress: 0,
            error: null,
            isComplete: false,
        });
        setCompletedModels([]);
        setOverallProgress(0);

        try {
            for (let i = 0; i < models.length; i++) {
                const model = models[i];
                setDownloadState((prev) => ({
                    ...prev,
                    currentModel: model,
                    progress: 0,
                    error: null,
                }));

                await modelInitFunctions[model]((progress) => {
                    setDownloadState((prev) => ({
                        ...prev,
                        progress: Math.round(progress * 100),
                    }));
                    // Calculate overall progress
                    const baseProgress = (i / models.length) * 100;
                    const modelContribution = (progress * 100) / models.length;
                    setOverallProgress(Math.round(baseProgress + modelContribution));
                });

                // Mark model as downloaded in AsyncStorage
                const storageKey = `${STORAGE_KEYS.modelsDownloaded}_${model}`;
                await AsyncStorage.setItem(storageKey, 'true');

                setCompletedModels((prev) => [...prev, model]);
            }

            // Mark all models as downloaded
            await AsyncStorage.setItem(STORAGE_KEYS.modelsDownloaded, 'true');

            setDownloadState((prev) => ({
                ...prev,
                currentModel: null,
                isComplete: true,
            }));
            setOverallProgress(100);

            // Small delay before completing to show success state
            setTimeout(() => {
                onComplete();
            }, 500);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setDownloadState((prev) => ({
                ...prev,
                error: errorMessage,
            }));
        }
    }, [onComplete]);

    useEffect(() => {
        downloadModels();
    }, [downloadModels]);

    const handleRetry = () => {
        downloadModels();
    };


    const renderModelStatus = (model: ModelType) => {
        const isCompleted = completedModels.includes(model);
        const isCurrent = downloadState.currentModel === model;
        const isPending = !isCompleted && !isCurrent;

        return (
            <View
                key={model}
                className={`flex-row items-center justify-between py-3 px-4 rounded-lg mb-2 ${isCurrent ? 'bg-purple-900/50' : isCompleted ? 'bg-green-900/30' : 'bg-gray-800/50'
                    }`}
            >
                <View className="flex-1">
                    <Text className={`font-medium ${isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-400'}`}>
                        {MODEL_LABELS[model]}
                    </Text>
                    <Text className="text-xs text-gray-500">{MODEL_DESCRIPTIONS[model]}</Text>
                </View>
                <View className="items-end">
                    {isCompleted && (
                        <Text className="text-green-400 text-sm">✓</Text>
                    )}
                    {isCurrent && (
                        <Text className="text-purple-400 text-sm">{downloadState.progress}%</Text>
                    )}
                    {isPending && (
                        <Text className="text-gray-500 text-sm">Pending</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#0f0f1a] justify-center px-6">
            <View className="items-center mb-8">
                <Text className="text-4xl mb-2">🧠</Text>
                <Text className="text-2xl font-bold text-white mb-2">NEURONIC</Text>
                <Text className="text-gray-400 text-center">
                    Setting up your cognitive twin...
                </Text>
            </View>

            <View className="bg-[#1a1a2e] rounded-xl p-4 mb-6">
                <Text className="text-white font-semibold mb-4">Downloading AI Models</Text>

                {(['text', 'vision', 'stt'] as ModelType[]).map(renderModelStatus)}

                {/* Overall progress bar */}
                <View className="mt-4">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-400 text-sm">Overall Progress</Text>
                        <Text className="text-purple-400 text-sm">{overallProgress}%</Text>
                    </View>
                    <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </View>
                </View>
            </View>

            {downloadState.currentModel && !downloadState.error && (
                <View className="items-center">
                    <ActivityIndicator size="small" color="#a855f7" />
                    <Text className="text-gray-400 text-sm mt-2">
                        This may take a few minutes on first launch...
                    </Text>
                </View>
            )}

            {downloadState.isComplete && (
                <View className="items-center">
                    <Text className="text-green-400 text-lg font-semibold">✓ All models ready!</Text>
                </View>
            )}

            {downloadState.error && (
                <View className="items-center">
                    <Text className="text-red-400 text-center mb-4">{downloadState.error}</Text>
                    <Pressable
                        onPress={handleRetry}
                        className="bg-purple-600 px-6 py-3 rounded-lg active:bg-purple-700"
                    >
                        <Text className="text-white font-semibold">Retry Download</Text>
                    </Pressable>
                </View>
            )}

            <Text className="text-gray-500 text-xs text-center mt-8">
                All AI processing happens on-device.{'\n'}Your memories never leave your phone.
            </Text>
        </View>
    );
}

export default ModelDownloadScreen;
