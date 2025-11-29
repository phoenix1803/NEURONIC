/**
 * Search Service
 * Handles semantic search across memories using embeddings
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { SearchResult } from '../types';
import { getAllMemories } from '../db/operations';
import { generateEmbedding } from './cactus';
import { findTopKSimilar } from '../utils/similarity';
import { APP_SETTINGS } from '../constants';

/**
 * Perform semantic search across all memories
 * - Generates embedding for the query using on-device model
 * - Computes cosine similarity against all stored memory embeddings
 * - Returns memories ranked by relevance score
 * 
 * Requirements:
 * - 5.2: Generate embedding for query on-device
 * - 5.3: Compute cosine similarity against stored embeddings
 * - 5.4: Return memories ranked by relevance
 * - 5.5: Show memory content, type, timestamp, and relevance score
 * - 5.6: Perform search entirely locally (offline)
 * 
 * @param query Natural language search query
 * @param limit Maximum number of results to return (default: 10)
 * @returns Array of SearchResult objects sorted by relevance (highest first)
 */
export async function semanticSearch(
    query: string,
    limit: number = APP_SETTINGS.search.defaultLimit
): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
        return [];
    }

    // Clamp limit to max results
    const effectiveLimit = Math.min(limit, APP_SETTINGS.search.maxResults);

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query.trim());

    // Get all memories from database
    const memories = await getAllMemories();

    if (memories.length === 0) {
        return [];
    }

    // Find top K similar memories using cosine similarity
    const results = findTopKSimilar(queryEmbedding, memories, effectiveLimit);

    // Filter results below similarity threshold
    const filteredResults = results.filter(
        (result) => result.score >= APP_SETTINGS.search.similarityThreshold
    );

    return filteredResults;
}

// Export as SearchService namespace for convenience
export const SearchService = {
    semanticSearch,
};

export default SearchService;
