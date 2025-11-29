/**
 * Search Screen
 * Semantic search through memories
 * Requirements: 7.4, 5.1, 5.5, 10.4
 */

import React, { useCallback } from 'react';
import { View, Text, FlatList, ListRenderItem } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../store';
import { SearchBar } from '../../components/SearchBar';
import { MemoryCard } from '../../components/MemoryCard';
import { useToast } from '../../components/ToastProvider';
import { semanticSearch } from '../../services/search';
import { SearchResult, Memory } from '../../types';

export default function SearchScreen() {
    const {
        searchQuery,
        searchResults,
        isSearching,
        setSearchQuery,
        setSearchResults,
        setIsSearching,
    } = useAppStore();
    const { showError } = useToast();

    // Handle search query with error handling
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await semanticSearch(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            showError(`Search failed: ${message}`);
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [setSearchQuery, setSearchResults, setIsSearching, showError]);

    // Handle memory press - navigate to detail view
    const handleMemoryPress = useCallback((memory: Memory) => {
        router.push(`/memory/${memory.id}`);
    }, []);

    // Render search result item with relevance score
    const renderResultItem: ListRenderItem<SearchResult> = useCallback(
        ({ item }) => (
            <View className="mb-1">
                <MemoryCard
                    memory={item.memory}
                    onPress={handleMemoryPress}
                />
                {/* Relevance score badge */}
                <View className="absolute top-3 right-3 bg-primary/80 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-medium">
                        {Math.round(item.score * 100)}% match
                    </Text>
                </View>
            </View>
        ),
        [handleMemoryPress]
    );

    const keyExtractor = useCallback((item: SearchResult) => item.memory.id, []);

    // Render empty state
    const renderEmptyState = () => {
        if (isSearching) {
            return null;
        }

        if (searchQuery.trim()) {
            return (
                <View className="flex-1 items-center justify-center py-20">
                    <Text className="text-5xl mb-4">🔍</Text>
                    <Text className="text-gray-400 text-center text-base px-8">
                        No memories found for "{searchQuery}"
                    </Text>
                    <Text className="text-gray-500 text-center text-sm px-8 mt-2">
                        Try different keywords or phrases
                    </Text>
                </View>
            );
        }

        return (
            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-5xl mb-4">🧠</Text>
                <Text className="text-gray-400 text-center text-base px-8">
                    Search your memories using natural language
                </Text>
                <Text className="text-gray-500 text-center text-sm px-8 mt-2">
                    Try "meetings last week" or "ideas about project"
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-4 pt-4 pb-2">
                <Text className="text-white text-2xl font-bold">Search</Text>
                <Text className="text-gray-400 text-sm">
                    Find memories by meaning, not just keywords
                </Text>
            </View>

            {/* Search Bar */}
            <SearchBar
                onSearch={handleSearch}
                isSearching={isSearching}
                placeholder="Search your memories..."
            />

            {/* Results List */}
            <FlatList
                data={searchResults}
                renderItem={renderResultItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 100,
                    flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                // Performance optimizations
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
            />
        </View>
    );
}
