/**
 * Relation Service
 * Handles extraction of entities and creation of relations between memories
 * Requirements: 9.1, 9.2, 9.3
 */

import { Memory, Relation, Entity, RelationType } from '../types';
import {
    insertRelation,
    getRelatedMemories as dbGetRelatedMemories,
    getAllMemories,
    checkRelationExists,
} from '../db/operations';
import { complete } from './cactus';
import { cosineSimilarity } from '../utils/similarity';
import { PROMPTS } from '../constants';
import type { Message } from 'cactus-react-native';

// Similarity threshold for creating relations
const RELATION_SIMILARITY_THRESHOLD = 0.6;

/**
 * Generate a unique ID for a relation
 */
function generateRelationId(): string {
    return `rel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract entities from memory content using on-device LLM
 * @param content - Memory content to extract entities from
 * @returns Array of extracted entities
 * Requirements: 9.1
 */
export async function extractEntities(content: string): Promise<Entity[]> {
    if (!content || content.trim().length === 0) {
        return [];
    }

    try {
        const messages: Message[] = [
            { role: 'system', content: PROMPTS.entityExtraction },
            { role: 'user', content },
        ];

        const response = await complete(messages, 256);

        // Try to parse JSON response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.filter(
                (e: any) =>
                    e.text &&
                    typeof e.text === 'string' &&
                    e.type &&
                    ['topic', 'person', 'place', 'date', 'task'].includes(e.type)
            ) as Entity[];
        }

        return [];
    } catch (error) {
        console.warn('Entity extraction failed:', error);
        return [];
    }
}

/**
 * Find memories with similar topics/entities
 * Compares tags and embedding similarity
 * @param memory - The memory to find relations for
 * @param existingMemories - Pool of memories to search through
 * @returns Array of related memories with similarity scores
 * Requirements: 9.2
 */
export async function findRelatedMemories(
    memory: Memory,
    existingMemories: Memory[]
): Promise<{ memory: Memory; similarity: number; relationType: RelationType }[]> {
    const related: { memory: Memory; similarity: number; relationType: RelationType }[] = [];

    for (const candidate of existingMemories) {
        // Skip self
        if (candidate.id === memory.id) {
            continue;
        }

        // Check embedding similarity
        let embeddingSimilarity = 0;
        if (memory.embedding.length > 0 && candidate.embedding.length > 0) {
            try {
                embeddingSimilarity = cosineSimilarity(memory.embedding, candidate.embedding);
            } catch {
                // Dimension mismatch, skip
            }
        }

        // Check tag overlap
        const tagOverlap = calculateTagOverlap(memory.tags, candidate.tags);

        // Check if same day
        const isSameDay = areSameDay(memory.createdAt, candidate.createdAt);

        // Determine relation type and strength
        if (embeddingSimilarity >= RELATION_SIMILARITY_THRESHOLD) {
            related.push({
                memory: candidate,
                similarity: embeddingSimilarity,
                relationType: 'similar_topic',
            });
        } else if (tagOverlap >= 0.5) {
            // At least 50% tag overlap
            related.push({
                memory: candidate,
                similarity: tagOverlap,
                relationType: 'similar_topic',
            });
        } else if (isSameDay && embeddingSimilarity >= 0.4) {
            // Same day with moderate similarity
            related.push({
                memory: candidate,
                similarity: embeddingSimilarity,
                relationType: 'same_day',
            });
        }
    }

    // Sort by similarity and limit results
    return related
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10); // Max 10 relations per memory
}

/**
 * Calculate tag overlap ratio between two tag arrays
 */
function calculateTagOverlap(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 || tags2.length === 0) {
        return 0;
    }

    const set1 = new Set(tags1.map(t => t.toLowerCase()));
    const set2 = new Set(tags2.map(t => t.toLowerCase()));

    let overlap = 0;
    for (const tag of set1) {
        if (set2.has(tag)) {
            overlap++;
        }
    }

    // Return ratio of overlap to smaller set
    const minSize = Math.min(set1.size, set2.size);
    return overlap / minSize;
}

/**
 * Check if two timestamps are on the same day
 */
function areSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * Create and store relations for a newly saved memory
 * This is the main entry point called after a memory is saved
 * @param memory - The newly created memory
 * Requirements: 9.1, 9.2, 9.3
 */
export async function createRelationsForMemory(memory: Memory): Promise<Relation[]> {
    const createdRelations: Relation[] = [];

    try {
        // Get all existing memories to compare against
        const existingMemories = await getAllMemories();

        // Find related memories
        const relatedMemories = await findRelatedMemories(memory, existingMemories);

        // Create relations for each related memory
        for (const related of relatedMemories) {
            // Check if relation already exists (in either direction)
            const exists = await checkRelationExists(memory.id, related.memory.id);
            if (exists) {
                continue;
            }

            const relation: Relation = {
                id: generateRelationId(),
                sourceMemoryId: memory.id,
                targetMemoryId: related.memory.id,
                relationType: related.relationType,
                strength: related.similarity,
                createdAt: Date.now(),
            };

            await insertRelation(relation);
            createdRelations.push(relation);
        }
    } catch (error) {
        console.warn('Failed to create relations for memory:', error);
        // Non-critical, don't throw
    }

    return createdRelations;
}

/**
 * Get all memories related to a given memory
 * @param memoryId - ID of the memory to find relations for
 * Requirements: 9.4
 */
export async function getRelatedMemories(
    memoryId: string
): Promise<{ memory: Memory; relation: Relation }[]> {
    return dbGetRelatedMemories(memoryId);
}

// Export as RelationService namespace
export const RelationService = {
    extractEntities,
    findRelatedMemories,
    createRelationsForMemory,
    getRelatedMemories,
};

export default RelationService;
