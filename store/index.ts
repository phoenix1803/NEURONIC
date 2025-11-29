/**
 * Zustand Store for NEURONIC
 * Manages app state for memories, search results, and memory packets
 * Requirements: 10.4
 */

import { create } from 'zustand';
import { Memory, MemoryPacket, SearchResult } from '../types';
import {
    getRecentMemories,
    getMemoryPackets as fetchMemoryPackets,
    insertMemory,
    deleteMemory as removeMemory,
    deleteRelationsForMemory,
} from '../db/operations';
import { logError } from '../utils/errorHandler';

interface AppState {
    // Memory state
    memories: Memory[];
    currentMemory: Memory | null;
    isLoading: boolean;

    // Search state
    searchQuery: string;
    searchResults: SearchResult[];
    isSearching: boolean;

    // Consolidation state
    memoryPackets: MemoryPacket[];

    // AI state
    isModelReady: boolean;
    modelLoadingProgress: number;

    // Error state
    lastError: string | null;

    // Actions
    addMemory: (memory: Memory) => Promise<void>;
    removeMemory: (id: string) => Promise<void>;
    setCurrentMemory: (memory: Memory | null) => void;
    setSearchQuery: (query: string) => void;
    setSearchResults: (results: SearchResult[]) => void;
    setIsSearching: (isSearching: boolean) => void;
    loadMemories: () => Promise<void>;
    loadPackets: () => Promise<void>;
    setIsModelReady: (ready: boolean) => void;
    setModelLoadingProgress: (progress: number) => void;
    setLastError: (error: string | null) => void;
    clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    memories: [],
    currentMemory: null,
    isLoading: false,
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    memoryPackets: [],
    isModelReady: false,
    modelLoadingProgress: 0,
    lastError: null,

    // Actions
    addMemory: async (memory: Memory) => {
        set({ isLoading: true, lastError: null });
        try {
            // Save to database
            await insertMemory(memory);
            // Update local state
            set((state) => ({
                memories: [memory, ...state.memories],
                isLoading: false,
            }));
        } catch (error) {
            logError('addMemory', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to add memory';
            set({ isLoading: false, lastError: errorMessage });
            throw error;
        }
    },

    removeMemory: async (id: string) => {
        set({ isLoading: true, lastError: null });
        try {
            // Delete relations first, then the memory
            await deleteRelationsForMemory(id);
            await removeMemory(id);
            // Update local state
            set((state) => ({
                memories: state.memories.filter((m) => m.id !== id),
                currentMemory: state.currentMemory?.id === id ? null : state.currentMemory,
                isLoading: false,
            }));
        } catch (error) {
            logError('removeMemory', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove memory';
            set({ isLoading: false, lastError: errorMessage });
            throw error;
        }
    },

    setCurrentMemory: (memory: Memory | null) => {
        set({ currentMemory: memory });
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    setSearchResults: (results: SearchResult[]) => {
        set({ searchResults: results, isSearching: false });
    },

    setIsSearching: (isSearching: boolean) => {
        set({ isSearching });
    },

    loadMemories: async () => {
        set({ isLoading: true, lastError: null });
        try {
            const memories = await getRecentMemories(100);
            set({ memories, isLoading: false });
        } catch (error) {
            logError('loadMemories', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load memories';
            set({ isLoading: false, lastError: errorMessage });
            throw error;
        }
    },

    loadPackets: async () => {
        set({ isLoading: true, lastError: null });
        try {
            const memoryPackets = await fetchMemoryPackets();
            set({ memoryPackets, isLoading: false });
        } catch (error) {
            logError('loadPackets', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load memory packets';
            set({ isLoading: false, lastError: errorMessage });
            throw error;
        }
    },

    setIsModelReady: (ready: boolean) => {
        set({ isModelReady: ready });
    },

    setModelLoadingProgress: (progress: number) => {
        set({ modelLoadingProgress: progress });
    },

    setLastError: (error: string | null) => {
        set({ lastError: error });
    },

    clearError: () => {
        set({ lastError: null });
    },
}));
