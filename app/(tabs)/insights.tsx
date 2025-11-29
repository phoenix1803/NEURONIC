/**
 * Insights Screen
 * Display daily memory consolidations and trigger manual consolidation
 * Requirements: 7.5, 6.1, 6.5, 10.4
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    RefreshControl,
    Alert,
    ActivityIndicator,
    ListRenderItem,
} from 'react-native';
import { useAppStore } from '../../store';
import { ConsolidationCard } from '../../components/ConsolidationCard';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useToast } from '../../components/ToastProvider';
import { consolidateDay } from '../../services/consolidation';
import { MemoryPacket } from '../../types';

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

export default function InsightsScreen() {
    const { memoryPackets, isLoading, loadPackets } = useAppStore();
    const [isConsolidating, setIsConsolidating] = useState(false);
    const { showSuccess, showError } = useToast();

    // Load memory packets on mount with error handling
    useEffect(() => {
        const loadData = async () => {
            try {
                await loadPackets();
            } catch (error) {
                console.error('Failed to load packets:', error);
                showError('Failed to load insights. Pull down to retry.');
            }
        };
        loadData();
    }, [loadPackets, showError]);

    // Handle pull-to-refresh with error handling
    const handleRefresh = useCallback(async () => {
        try {
            await loadPackets();
        } catch (error) {
            console.error('Failed to refresh packets:', error);
            showError('Failed to refresh. Please try again.');
        }
    }, [loadPackets, showError]);

    // Run consolidation for a specific date
    const runConsolidation = useCallback(async (date: string) => {
        setIsConsolidating(true);
        try {
            await consolidateDay(date);
            await loadPackets();
            showSuccess(`Memories for ${date} have been consolidated!`);
        } catch (error) {
            console.error('Consolidation failed:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            showError(`Consolidation failed: ${message}`);
        } finally {
            setIsConsolidating(false);
        }
    }, [loadPackets, showSuccess, showError]);

    // Handle manual consolidation trigger
    const handleConsolidate = useCallback(() => {
        const yesterday = getYesterdayDate();
        const today = getTodayDate();

        Alert.alert(
            'Consolidate Memories',
            'Which day would you like to consolidate?',
            [
                {
                    text: 'Yesterday',
                    onPress: () => runConsolidation(yesterday),
                },
                {
                    text: 'Today',
                    onPress: () => runConsolidation(today),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    }, [runConsolidation]);

    // Handle packet press (future: show detailed view)
    const handlePacketPress = useCallback((packet: MemoryPacket) => {
        // TODO: Navigate to packet detail view showing all memories
        console.log('Packet pressed:', packet.id);
    }, []);

    // Render consolidation card
    const renderPacketItem: ListRenderItem<MemoryPacket> = useCallback(
        ({ item }) => (
            <ConsolidationCard packet={item} onPress={handlePacketPress} />
        ),
        [handlePacketPress]
    );

    const keyExtractor = useCallback((item: MemoryPacket) => item.id, []);

    // Render empty state
    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <Text className="text-5xl mb-4">📊</Text>
            <Text className="text-gray-400 text-center text-base px-8">
                No daily summaries yet
            </Text>
            <Text className="text-gray-500 text-center text-sm px-8 mt-2">
                Tap the button below to consolidate your memories
            </Text>
        </View>
    );

    return (
        <>
            <View className="flex-1 bg-background">
                {/* Header */}
                <View className="px-4 pt-4 pb-2">
                    <Text className="text-white text-2xl font-bold">Insights</Text>
                    <Text className="text-gray-400 text-sm">
                        Daily memory consolidations
                    </Text>
                </View>

                {/* Consolidation Button */}
                <View className="px-4 py-2">
                    <Pressable
                        onPress={handleConsolidate}
                        disabled={isConsolidating}
                        className={`py-3 rounded-xl items-center flex-row justify-center ${isConsolidating ? 'bg-gray-600' : 'bg-primary'
                            } active:opacity-80`}
                    >
                        {isConsolidating ? (
                            <>
                                <ActivityIndicator size="small" color="#fff" />
                                <Text className="text-white font-semibold ml-2">
                                    Consolidating...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-lg mr-2">✨</Text>
                                <Text className="text-white font-semibold">
                                    Consolidate Memories
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                {/* Memory Packets List */}
                <FlatList
                    data={memoryPackets}
                    renderItem={renderPacketItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 8,
                        paddingBottom: 100,
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={handleRefresh}
                            tintColor="#6366f1"
                            colors={['#6366f1']}
                        />
                    }
                    // Performance optimizations
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                />
            </View>

            {/* Loading Overlay for consolidation */}
            <LoadingOverlay
                visible={isConsolidating}
                message="Consolidating memories with AI..."
            />
        </>
    );
}
