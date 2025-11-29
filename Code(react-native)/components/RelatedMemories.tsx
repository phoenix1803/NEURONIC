/**
 * RelatedMemories Component
 * Displays memories related to a given memory based on knowledge graph relations
 * Requirements: 9.4
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Memory, Relation, RelationType } from '../types';
import { getRelatedMemories } from '../services/relation';
import { getRelativeTime } from '../utils/date';

interface RelatedMemoriesProps {
    memoryId: string;
    onMemoryPress?: (memory: Memory) => void;
}

interface RelatedMemoryItem {
    memory: Memory;
    relation: Relation;
}

// Relation type labels and colors
const RELATION_LABELS: Record<RelationType, string> = {
    similar_topic: 'Similar Topic',
    same_day: 'Same Day',
    referenced: 'Referenced',
};

const RELATION_COLORS: Record<RelationType, string> = {
    similar_topic: 'bg-primary/20 text-primary',
    same_day: 'bg-secondary/20 text-secondary',
    referenced: 'bg-accent/20 text-accent',
};

// Type icons
const TYPE_ICONS: Record<string, string> = {
    text: '📝',
    voice: '🎤',
    image: '📷',
};

/**
 * Single related memory card component
 */
const RelatedMemoryCard: React.FC<{
    item: RelatedMemoryItem;
    onPress?: (memory: Memory) => void;
}> = ({ item, onPress }) => {
    const { memory, relation } = item;
    const strengthPercent = Math.round(relation.strength * 100);

    return (
        <Pressable
            onPress={() => onPress?.(memory)}
            className="bg-surface/50 rounded-lg p-3 mb-2 active:opacity-80"
        >
            {/* Header: Type icon and relation badge */}
            <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center">
                    <Text className="text-sm mr-2">{TYPE_ICONS[memory.type]}</Text>
                    <Text className="text-gray-400 text-xs">
                        {getRelativeTime(memory.createdAt)}
                    </Text>
                </View>
                <View className={`px-2 py-0.5 rounded-full ${RELATION_COLORS[relation.relationType].split(' ')[0]}`}>
                    <Text className={`text-xs ${RELATION_COLORS[relation.relationType].split(' ')[1]}`}>
                        {RELATION_LABELS[relation.relationType]} • {strengthPercent}%
                    </Text>
                </View>
            </View>

            {/* Content preview */}
            <Text
                className="text-white text-sm leading-5"
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {memory.content}
            </Text>
        </Pressable>
    );
};

/**
 * Main RelatedMemories component
 */
export const RelatedMemories: React.FC<RelatedMemoriesProps> = ({
    memoryId,
    onMemoryPress,
}) => {
    const [relatedMemories, setRelatedMemories] = useState<RelatedMemoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRelatedMemories();
    }, [memoryId]);

    const loadRelatedMemories = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const related = await getRelatedMemories(memoryId);
            setRelatedMemories(related);
        } catch (err) {
            console.error('Failed to load related memories:', err);
            setError('Failed to load related memories');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <View className="py-4">
                <Text className="text-gray-400 text-sm font-medium mb-3">Related Memories</Text>
                <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#6366f1" />
                </View>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View className="py-4">
                <Text className="text-gray-400 text-sm font-medium mb-3">Related Memories</Text>
                <Text className="text-gray-500 text-sm text-center py-2">{error}</Text>
            </View>
        );
    }

    // Empty state
    if (relatedMemories.length === 0) {
        return (
            <View className="py-4">
                <Text className="text-gray-400 text-sm font-medium mb-3">Related Memories</Text>
                <Text className="text-gray-500 text-sm text-center py-2">
                    No related memories found
                </Text>
            </View>
        );
    }

    // Display related memories
    return (
        <View className="py-4">
            <Text className="text-gray-400 text-sm font-medium mb-3">
                Related Memories ({relatedMemories.length})
            </Text>
            {relatedMemories.map((item) => (
                <RelatedMemoryCard
                    key={item.relation.id}
                    item={item}
                    onPress={onMemoryPress}
                />
            ))}
        </View>
    );
};

export default RelatedMemories;
