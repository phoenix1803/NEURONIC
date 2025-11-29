/**
 * Similarity Utilities
 * Functions for computing cosine similarity between embeddings
 * Requirements: 5.3, 5.4
 */

import { Memory, SearchResult } from '../types';

/**
 * Computes cosine similarity between two embedding vectors
 * @param a First embedding vector
 * @param b Second embedding vector
 * @returns Similarity score between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error(`Embedding dimensions must match: ${a.length} vs ${b.length}`);
    }

    if (a.length === 0) {
        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        magnitudeA += a[i] * a[i];
        magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    // Avoid division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds the top K most similar memories to a query embedding
 * @param queryEmbedding The embedding vector to search with
 * @param memories Array of memories to search through
 * @param k Number of top results to return
 * @returns Array of SearchResult objects sorted by similarity (highest first)
 */
export function findTopKSimilar(
    queryEmbedding: number[],
    memories: Memory[],
    k: number
): SearchResult[] {
    if (memories.length === 0 || k <= 0) {
        return [];
    }

    // Compute similarity scores for all memories
    const results: SearchResult[] = memories
        .filter(memory => memory.embedding && memory.embedding.length > 0)
        .map(memory => ({
            memory,
            score: cosineSimilarity(queryEmbedding, memory.embedding),
        }));

    // Sort by score descending and take top k
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
}
