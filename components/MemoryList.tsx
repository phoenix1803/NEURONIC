/**
 * MemoryList Component
 * Scrollable list of memories using FlatList with pull-to-refresh and empty state
 * Requirements: 7.2, 10.2, 10.3, 10.4
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ListRenderItem, Platform } from 'react-native';
import { Memory } from '../types';
import { MemoryCard } from './MemoryCard';

interface MemoryListProps {
    memories: Memory[];
    isLoading?: boolean;
    onRefresh?: () => void;
    onMemoryPress?: (memory: Memory) => void;
    emptyMessage?: string;
}

// Estimated item height for better scroll performance
const ESTIMATED_ITEM_HEIGHT = 120;

export const MemoryList: React.FC<MemoryListProps> = ({
    memories,
    isLoading = false,
    onRefresh,
    onMemoryPress,
    emptyMessage = 'No memories yet. Start capturing your thoughts!',
}) => {
    const renderItem: ListRenderItem<Memory> = useCallback(
        ({ item }) => <MemoryCard memory={item} onPress={onMemoryPress} />,
        [onMemoryPress]
    );

    const keyExtractor = useCallback((item: Memory) => item.id, []);

    // Memoize empty state component
    const EmptyComponent = useMemo(() => (
        <View className="flex-1 items-center justify-center py-20">
            <Text className="text-5xl mb-4">🧠</Text>
            <Text className="text-gray-400 text-center text-base px-8">
                {emptyMessage}
            </Text>
        </View>
    ), [emptyMessage]);

    // Memoize content container style
    const contentContainerStyle = useMemo(() => ({
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 100,
        flexGrow: 1,
    }), []);

    // Memoize refresh control
    const refreshControl = useMemo(() => (
        onRefresh ? (
            <RefreshControl
                refreshing={isLoading}
                onRefresh={onRefresh}
                tintColor="#6366f1"
                colors={['#6366f1']}
            />
        ) : undefined
    ), [onRefresh, isLoading]);

    // Estimated item layout for better scroll performance
    const getItemLayout = useCallback((_: any, index: number) => ({
        length: ESTIMATED_ITEM_HEIGHT,
        offset: ESTIMATED_ITEM_HEIGHT * index,
        index,
    }), []);

    return (
        <FlatList
            data={memories}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={contentContainerStyle}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyComponent}
            refreshControl={refreshControl}
            // Performance optimizations
            removeClippedSubviews={Platform.OS === 'android'} // Only on Android for stability
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            updateCellsBatchingPeriod={50}
            getItemLayout={getItemLayout}
            // Prevent unnecessary re-renders
            extraData={memories.length}
        />
    );
};

export default MemoryList;
