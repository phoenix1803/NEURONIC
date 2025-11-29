/**
 * TagChip Component
 * Reusable component for displaying tags
 * Requirements: 1.4
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

type TagVariant = 'primary' | 'secondary' | 'accent' | 'neutral';

interface TagChipProps {
    tag: string;
    variant?: TagVariant;
    size?: 'sm' | 'md';
    onPress?: (tag: string) => void;
    removable?: boolean;
    onRemove?: (tag: string) => void;
}

const VARIANT_STYLES: Record<TagVariant, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary/20', text: 'text-primary' },
    secondary: { bg: 'bg-secondary/20', text: 'text-secondary' },
    accent: { bg: 'bg-accent/20', text: 'text-accent' },
    neutral: { bg: 'bg-gray-700', text: 'text-gray-300' },
};

const SIZE_STYLES = {
    sm: { container: 'px-2 py-0.5', text: 'text-xs' },
    md: { container: 'px-3 py-1', text: 'text-sm' },
};

export const TagChip: React.FC<TagChipProps> = ({
    tag,
    variant = 'primary',
    size = 'sm',
    onPress,
    removable = false,
    onRemove,
}) => {
    const variantStyle = VARIANT_STYLES[variant];
    const sizeStyle = SIZE_STYLES[size];

    const handlePress = () => {
        onPress?.(tag);
    };

    const handleRemove = () => {
        onRemove?.(tag);
    };

    const Container = onPress ? Pressable : View;

    return (
        <Container
            onPress={onPress ? handlePress : undefined}
            className={`flex-row items-center rounded-full ${variantStyle.bg} ${sizeStyle.container} ${onPress ? 'active:opacity-70' : ''
                }`}
        >
            <Text className={`${variantStyle.text} ${sizeStyle.text}`}>{tag}</Text>

            {removable && onRemove && (
                <Pressable
                    onPress={handleRemove}
                    className="ml-1 -mr-1"
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                >
                    <Text className={`${variantStyle.text} ${sizeStyle.text}`}>✕</Text>
                </Pressable>
            )}
        </Container>
    );
};

// Convenience component for displaying a list of tags
interface TagListProps {
    tags: string[];
    variant?: TagVariant;
    size?: 'sm' | 'md';
    onTagPress?: (tag: string) => void;
    maxTags?: number;
}

export const TagList: React.FC<TagListProps> = ({
    tags,
    variant = 'primary',
    size = 'sm',
    onTagPress,
    maxTags,
}) => {
    const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
    const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

    return (
        <View className="flex-row flex-wrap gap-2">
            {displayTags.map((tag, index) => (
                <TagChip
                    key={`${tag}-${index}`}
                    tag={tag}
                    variant={variant}
                    size={size}
                    onPress={onTagPress}
                />
            ))}
            {remainingCount > 0 && (
                <View className="bg-gray-700 px-2 py-0.5 rounded-full">
                    <Text className="text-gray-400 text-xs">+{remainingCount}</Text>
                </View>
            )}
        </View>
    );
};

export default TagChip;
