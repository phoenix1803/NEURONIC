/**
 * ConsolidationCard Component
 * Displays daily memory summary and key topics
 * Requirements: 6.5
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MemoryPacket } from '../types';

interface ConsolidationCardProps {
    packet: MemoryPacket;
    onPress?: (packet: MemoryPacket) => void;
}

// Format date for display (e.g., "Nov 29, 2025")
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

// Get day of week (e.g., "Saturday")
const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const ConsolidationCard: React.FC<ConsolidationCardProps> = ({
    packet,
    onPress,
}) => {
    const handlePress = () => {
        onPress?.(packet);
    };

    return (
        <Pressable
            onPress={handlePress}
            className="bg-surface rounded-xl p-4 mb-3 active:opacity-80"
        >
            {/* Header: Date and memory count */}
            <View className="flex-row items-center justify-between mb-3">
                <View>
                    <Text className="text-white text-lg font-semibold">
                        {formatDate(packet.date)}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                        {getDayOfWeek(packet.date)}
                    </Text>
                </View>
                <View className="bg-primary/20 px-3 py-1 rounded-full">
                    <Text className="text-primary text-xs">
                        {packet.memoryIds.length} memories
                    </Text>
                </View>
            </View>

            {/* Summary */}
            <Text className="text-gray-300 text-base leading-6 mb-3">
                {packet.summary}
            </Text>

            {/* Key Topics */}
            {packet.keyTopics && packet.keyTopics.length > 0 && (
                <View>
                    <Text className="text-gray-500 text-xs uppercase tracking-wide mb-2">
                        Key Topics
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {packet.keyTopics.map((topic, index) => (
                            <View
                                key={`${topic}-${index}`}
                                className="bg-secondary/20 px-3 py-1 rounded-full"
                            >
                                <Text className="text-secondary text-xs">{topic}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </Pressable>
    );
};

export default ConsolidationCard;
