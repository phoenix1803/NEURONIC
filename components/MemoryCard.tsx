/**
 * MemoryCard Component
 * Displays a single memory with content, type icon, timestamp, and tags
 * Requirements: 7.2, 10.2, 10.3, 10.4
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Memory, MemoryType } from '../types';
import { getRelativeTime } from '../utils/date';

interface MemoryCardProps {
    memory: Memory;
    onPress?: (memory: Memory) => void;
}

// Type icons using emoji for simplicity (no extra dependencies)
const TYPE_ICONS: Record<MemoryType, string> = {
    text: '📝',
    voice: '🎤',
    image: '📷',
};

const TYPE_LABELS: Record<MemoryType, string> = {
    text: 'Text',
    voice: 'Voice',
    image: 'Image',
};

const MemoryCardComponent: React.FC<MemoryCardProps> = ({ memory, onPress }) => {
    const handlePress = useCallback(() => {
        onPress?.(memory);
    }, [memory, onPress]);

    // Memoize relative time to prevent recalculation on every render
    const relativeTime = useMemo(() => getRelativeTime(memory.createdAt), [memory.createdAt]);

    // Memoize tags to prevent array recreation
    const displayTags = useMemo(() => memory.tags?.slice(0, 5) ?? [], [memory.tags]);

    return (
        <Pressable
            onPress={handlePress}
            className="bg-surface rounded-xl p-4 mb-3 active:opacity-80"
        >
            {/* Header: Type icon and timestamp */}
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                    <Text className="text-lg mr-2">{TYPE_ICONS[memory.type]}</Text>
                    <Text className="text-gray-400 text-xs uppercase tracking-wide">
                        {TYPE_LABELS[memory.type]}
                    </Text>
                </View>
                <Text className="text-gray-500 text-xs">{relativeTime}</Text>
            </View>

            {/* Content */}
            <Text
                className="text-white text-base leading-6 mb-3"
                numberOfLines={3}
                ellipsizeMode="tail"
            >
                {memory.content}
            </Text>

            {/* Tags */}
            {displayTags.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                    {displayTags.map((tag, index) => (
                        <View
                            key={`${tag}-${index}`}
                            className="bg-primary/20 px-2 py-1 rounded-full"
                        >
                            <Text className="text-primary text-xs">{tag}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Pressable>
    );
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if memory.id or memory.updatedAt changes
export const MemoryCard = memo(MemoryCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.memory.id === nextProps.memory.id &&
        prevProps.memory.updatedAt === nextProps.memory.updatedAt &&
        prevProps.onPress === nextProps.onPress
    );
});

export default MemoryCard;
