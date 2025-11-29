/**
 * Memory Detail Screen
 * Displays full memory details and related memories
 * Requirements: 9.4, 10.4
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Memory } from '../../types';
import { getMemory, deleteMemory } from '../../services/memory';
import { RelatedMemories } from '../../components/RelatedMemories';
import { TagList } from '../../components/TagChip';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useToast } from '../../components/ToastProvider';
import { getRelativeTime } from '../../utils/date';
import { useAppStore } from '../../store';

// Type icons
const TYPE_ICONS: Record<string, string> = {
    text: '📝',
    voice: '🎤',
    image: '📷',
};

const TYPE_LABELS: Record<string, string> = {
    text: 'Text Memory',
    voice: 'Voice Memory',
    image: 'Image Memory',
};

export default function MemoryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const loadMemories = useAppStore((state) => state.loadMemories);
    const { showSuccess, showError } = useToast();

    const [memory, setMemory] = useState<Memory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMemory = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const fetchedMemory = await getMemory(id);
            if (fetchedMemory) {
                setMemory(fetchedMemory);
            } else {
                setError('Memory not found');
            }
        } catch (err) {
            console.error('Failed to load memory:', err);
            setError('Failed to load memory');
            showError('Failed to load memory details');
        } finally {
            setIsLoading(false);
        }
    }, [id, showError]);

    useEffect(() => {
        loadMemory();
    }, [loadMemory]);

    const confirmDelete = useCallback(async () => {
        if (!memory) return;

        setIsDeleting(true);
        try {
            await deleteMemory(memory.id);
            await loadMemories();
            showSuccess('Memory deleted successfully');
            router.back();
        } catch (err) {
            console.error('Failed to delete memory:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            showError(`Failed to delete memory: ${message}`);
        } finally {
            setIsDeleting(false);
        }
    }, [memory, loadMemories, router, showSuccess, showError]);

    const handleDelete = useCallback(() => {
        Alert.alert(
            'Delete Memory',
            'Are you sure you want to delete this memory? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete,
                },
            ]
        );
    }, [confirmDelete]);

    const handleRelatedMemoryPress = useCallback((relatedMemory: Memory) => {
        router.push(`/memory/${relatedMemory.id}`);
    }, [router]);

    // Loading state
    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    // Error state
    if (error || !memory) {
        return (
            <View className="flex-1 bg-background items-center justify-center px-6">
                <Text className="text-2xl mb-2">😕</Text>
                <Text className="text-white text-lg font-medium mb-2">
                    {error || 'Memory not found'}
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    className="bg-primary px-6 py-3 rounded-lg mt-4"
                >
                    <Text className="text-white font-medium">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const formattedDate = new Date(memory.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                {/* Header */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <Text className="text-2xl mr-3">{TYPE_ICONS[memory.type]}</Text>
                        <View>
                            <Text className="text-white text-lg font-semibold">
                                {TYPE_LABELS[memory.type]}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                {getRelativeTime(memory.createdAt)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Full timestamp */}
                <Text className="text-gray-500 text-xs mb-4">{formattedDate}</Text>

                {/* Image preview for image memories */}
                {memory.type === 'image' && memory.rawContent && (
                    <View className="mb-4 rounded-xl overflow-hidden">
                        <Image
                            source={{ uri: memory.rawContent }}
                            className="w-full h-48"
                            resizeMode="cover"
                        />
                    </View>
                )}

                {/* Content */}
                <View className="bg-surface rounded-xl p-4 mb-4">
                    <Text className="text-white text-base leading-6">{memory.content}</Text>
                </View>

                {/* Tags */}
                {memory.tags && memory.tags.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm font-medium mb-2">Tags</Text>
                        <TagList tags={memory.tags} variant="primary" size="md" />
                    </View>
                )}

                {/* Divider */}
                <View className="h-px bg-gray-700 my-4" />

                {/* Related Memories */}
                <RelatedMemories
                    memoryId={memory.id}
                    onMemoryPress={handleRelatedMemoryPress}
                />

                {/* Delete button */}
                <View className="mt-6 mb-8">
                    <Pressable
                        onPress={handleDelete}
                        disabled={isDeleting}
                        className={`bg-red-500/20 py-3 rounded-lg items-center ${isDeleting ? 'opacity-50' : 'active:opacity-80'}`}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                            <Text className="text-red-500 font-medium">Delete Memory</Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>

            {/* Loading Overlay for deletion */}
            <LoadingOverlay visible={isDeleting} message="Deleting memory..." />
        </View>
    );
}
