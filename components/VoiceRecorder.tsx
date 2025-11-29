/**
 * VoiceRecorder Component
 * Record/stop button with recording state indicator using expo-av
 * Requirements: 2.1
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Audio } from 'expo-av';

interface VoiceRecorderProps {
    onRecordingComplete: (audioUri: string) => void;
    isProcessing?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    onRecordingComplete,
    isProcessing = false,
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync();
            }
        };
    }, []);

    const requestPermissions = async (): Promise<boolean> => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Microphone access is needed to record voice memos.',
                    [{ text: 'OK' }]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting audio permissions:', error);
            return false;
        }
    };

    const startRecording = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            // Configure audio mode for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Create and start recording
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            recordingRef.current = recording;
            setIsRecording(true);
            setRecordingDuration(0);

            // Start duration timer
            timerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    };


    const stopRecording = async () => {
        if (!recordingRef.current) return;

        try {
            // Stop timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Stop and unload recording
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();

            // Reset audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            setIsRecording(false);
            recordingRef.current = null;

            if (uri) {
                onRecordingComplete(uri);
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to save recording. Please try again.');
            setIsRecording(false);
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePress = () => {
        if (isProcessing) return;

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <View className="items-center py-6">
            {/* Recording indicator */}
            {isRecording && (
                <View className="flex-row items-center mb-4">
                    <View className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse" />
                    <Text className="text-white text-lg font-medium">
                        {formatDuration(recordingDuration)}
                    </Text>
                </View>
            )}

            {/* Record/Stop button */}
            <Pressable
                onPress={handlePress}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full items-center justify-center ${isRecording
                        ? 'bg-red-500'
                        : isProcessing
                            ? 'bg-gray-600'
                            : 'bg-primary'
                    } active:opacity-80`}
            >
                {isProcessing ? (
                    <Text className="text-white text-3xl">⏳</Text>
                ) : isRecording ? (
                    <View className="w-8 h-8 rounded bg-white" />
                ) : (
                    <Text className="text-white text-3xl">🎤</Text>
                )}
            </Pressable>

            {/* Instructions */}
            <Text className="text-gray-400 text-sm mt-4">
                {isProcessing
                    ? 'Processing audio...'
                    : isRecording
                        ? 'Tap to stop recording'
                        : 'Tap to start recording'}
            </Text>
        </View>
    );
};

export default VoiceRecorder;
