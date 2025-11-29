/**
 * Home Screen
 * Displays recent memories using MemoryList
 * Requirements: 7.2, 10.4
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../store';
import { MemoryList } from '../../components/MemoryList';
import { useToast } from '../../components/ToastProvider';
import { Memory } from '../../types';

export default function HomeScreen() {
    const { memories, isLoading, loadMemories } = useAppStore();
    const { showError } = useToast();

    // Load memories on mount with error handling
    useEffect(() => {
        const loadData = async () => {
            try {
                await loadMemories();
            } catch (error) {
                console.error('Failed to load memories:', error);
                showError('Failed to load memories. Pull down to retry.');
            }
        };
        loadData();
    }, [loadMemories, showError]);

    // Handle pull-to-refresh with error handling
    const handleRefresh = useCallback(async () => {
        try {
            await loadMemories();
        } catch (error) {
            console.error('Failed to refresh memories:', error);
            showError('Failed to refresh. Please try again.');
        }
    }, [loadMemories, showError]);

    // Handle memory press - navigate to detail view
    const handleMemoryPress = useCallback((memory: Memory) => {
        router.push(`/memory/${memory.id}`);
    }, []);

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-4 pt-4 pb-2">
                <Text className="text-white text-2xl font-bold">NEURONIC</Text>
                <Text className="text-gray-400 text-sm">Your Cognitive Twin</Text>
            </View>

            {/* Memory List */}
            <MemoryList
                memories={memories}
                isLoading={isLoading}
                onRefresh={handleRefresh}
                onMemoryPress={handleMemoryPress}
                emptyMessage="No memories yet. Start capturing your thoughts!"
            />
        </View>
    );
}
