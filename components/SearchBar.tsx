/**
 * SearchBar Component
 * Text input with search icon and debounced search trigger
 * Requirements: 5.1, 10.2, 10.3, 10.4
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, TextInput, Pressable, Text, ActivityIndicator } from 'react-native';
import { APP_SETTINGS } from '../constants';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    isSearching?: boolean;
    debounceMs?: number;
}

/**
 * Custom hook for debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Search your memories...',
    isSearching = false,
    debounceMs = APP_SETTINGS.ui.searchDebounceMs,
}) => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, debounceMs);
    const previousDebouncedQuery = useRef<string>('');

    // Trigger search when debounced query changes
    useEffect(() => {
        // Only trigger if the debounced value actually changed
        if (debouncedQuery !== previousDebouncedQuery.current) {
            previousDebouncedQuery.current = debouncedQuery;
            if (debouncedQuery.trim()) {
                onSearch(debouncedQuery.trim());
            }
        }
    }, [debouncedQuery, onSearch]);

    const handleClear = useCallback(() => {
        setQuery('');
        onSearch('');
    }, [onSearch]);

    const handleSubmit = useCallback(() => {
        if (query.trim()) {
            onSearch(query.trim());
        }
    }, [query, onSearch]);

    return (
        <View className="px-4 py-2">
            <View className="bg-surface rounded-xl flex-row items-center px-4 py-3">
                {/* Search Icon */}
                <Text className="text-lg mr-3">🔍</Text>

                {/* Text Input */}
                <TextInput
                    className="flex-1 text-white text-base"
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={handleSubmit}
                />

                {/* Loading indicator or clear button */}
                {isSearching ? (
                    <ActivityIndicator size="small" color="#6366f1" />
                ) : query.length > 0 ? (
                    <Pressable onPress={handleClear} className="p-1">
                        <Text className="text-gray-400 text-lg">✕</Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
};

// Memoize the component to prevent unnecessary re-renders
export const SearchBar = memo(SearchBarComponent);

export default SearchBar;
