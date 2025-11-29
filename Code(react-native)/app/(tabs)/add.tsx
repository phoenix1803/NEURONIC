/**
 * Add Memory Screen
 * Capture text, voice, or image memories
 * Requirements: 7.3, 1.1, 2.1, 3.1, 10.4
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../store';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { ImagePicker } from '../../components/ImagePicker';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useToast } from '../../components/ToastProvider';
import {
    createTextMemory,
    createVoiceMemory,
    createImageMemory,
} from '../../services/memory';

type InputMode = 'text' | 'voice' | 'image';

const PROCESSING_MESSAGES: Record<InputMode, string> = {
    text: 'Processing your memory...',
    voice: 'Transcribing audio...',
    image: 'Analyzing image...',
};

export default function AddScreen() {
    const [inputMode, setInputMode] = useState<InputMode>('text');
    const [textContent, setTextContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { loadMemories } = useAppStore();
    const { showSuccess, showError, showWarning } = useToast();

    // Handle text memory submission
    const handleTextSubmit = useCallback(async () => {
        if (!textContent.trim()) {
            showWarning('Please enter some text for your memory.');
            return;
        }

        setIsProcessing(true);
        try {
            await createTextMemory(textContent.trim());
            setTextContent('');
            await loadMemories();
            showSuccess('Memory saved successfully!');
            setTimeout(() => router.replace('/(tabs)'), 500);
        } catch (error) {
            console.error('Failed to create text memory:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            showError(`Failed to save memory: ${message}`);
        } finally {
            setIsProcessing(false);
        }
    }, [textContent, loadMemories, showSuccess, showError, showWarning]);

    // Handle voice recording completion
    const handleVoiceRecording = useCallback(async (audioUri: string) => {
        setIsProcessing(true);
        try {
            await createVoiceMemory(audioUri);
            await loadMemories();
            showSuccess('Voice memory saved successfully!');
            setTimeout(() => router.replace('/(tabs)'), 500);
        } catch (error) {
            console.error('Failed to create voice memory:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            showError(`Failed to process voice: ${message}`);
        } finally {
            setIsProcessing(false);
        }
    }, [loadMemories, showSuccess, showError]);

    // Handle image selection
    const handleImageSelected = useCallback(async (imageUri: string) => {
        setIsProcessing(true);
        try {
            await createImageMemory(imageUri);
            await loadMemories();
            showSuccess('Image memory saved successfully!');
            setTimeout(() => router.replace('/(tabs)'), 500);
        } catch (error) {
            console.error('Failed to create image memory:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            showError(`Failed to process image: ${message}`);
        } finally {
            setIsProcessing(false);
        }
    }, [loadMemories, showSuccess, showError]);

    // Render mode selector tabs
    const renderModeSelector = () => (
        <View className="flex-row bg-surface rounded-xl p-1 mx-4 mb-4">
            {(['text', 'voice', 'image'] as InputMode[]).map((mode) => (
                <Pressable
                    key={mode}
                    onPress={() => !isProcessing && setInputMode(mode)}
                    className={`flex-1 py-3 rounded-lg items-center ${inputMode === mode ? 'bg-primary' : ''
                        }`}
                    disabled={isProcessing}
                >
                    <Text className={`text-lg ${inputMode === mode ? '' : 'opacity-60'}`}>
                        {mode === 'text' ? '📝' : mode === 'voice' ? '🎤' : '📷'}
                    </Text>
                    <Text
                        className={`text-xs mt-1 capitalize ${inputMode === mode ? 'text-white' : 'text-gray-400'
                            }`}
                    >
                        {mode}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    // Render text input form
    const renderTextInput = () => (
        <View className="flex-1 px-4">
            <TextInput
                className="flex-1 bg-surface rounded-xl p-4 text-white text-base"
                placeholder="What's on your mind?"
                placeholderTextColor="#9ca3af"
                value={textContent}
                onChangeText={setTextContent}
                multiline
                textAlignVertical="top"
                editable={!isProcessing}
            />
            <Pressable
                onPress={handleTextSubmit}
                disabled={isProcessing || !textContent.trim()}
                className={`mt-4 py-4 rounded-xl items-center ${isProcessing || !textContent.trim() ? 'bg-gray-600' : 'bg-primary'
                    } active:opacity-80`}
            >
                {isProcessing ? (
                    <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#fff" />
                        <Text className="text-white font-semibold ml-2">Processing...</Text>
                    </View>
                ) : (
                    <Text className="text-white font-semibold">Save Memory</Text>
                )}
            </Pressable>
        </View>
    );

    // Render voice recorder
    const renderVoiceInput = () => (
        <View className="flex-1 px-4 justify-center">
            <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                isProcessing={isProcessing}
            />
        </View>
    );

    // Render image picker
    const renderImageInput = () => (
        <View className="flex-1 px-4 justify-center">
            <ImagePicker
                onImageSelected={handleImageSelected}
                isProcessing={isProcessing}
            />
        </View>
    );

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-background"
            >
                {/* Header */}
                <View className="px-4 pt-4 pb-2">
                    <Text className="text-white text-2xl font-bold">Add Memory</Text>
                    <Text className="text-gray-400 text-sm">
                        Capture your thoughts, voice, or images
                    </Text>
                </View>

                {/* Mode Selector */}
                {renderModeSelector()}

                {/* Content Area */}
                <View className="flex-1 pb-4">
                    {inputMode === 'text' && renderTextInput()}
                    {inputMode === 'voice' && renderVoiceInput()}
                    {inputMode === 'image' && renderImageInput()}
                </View>
            </KeyboardAvoidingView>

            {/* Loading Overlay for AI processing */}
            <LoadingOverlay
                visible={isProcessing}
                message={PROCESSING_MESSAGES[inputMode]}
            />
        </>
    );
}
