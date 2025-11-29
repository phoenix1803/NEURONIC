/**
 * NEURONIC Type Definitions
 * Core types for the Cognitive Twin memory system
 */

// Memory type enum
export type MemoryType = 'text' | 'voice' | 'image';

// Core Memory interface
export interface Memory {
    id: string;
    type: MemoryType;
    content: string;
    rawContent?: string; // Original audio path or image path
    embedding: number[];
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

// Daily consolidated memory packet
export interface MemoryPacket {
    id: string;
    date: string; // YYYY-MM-DD format
    summary: string;
    keyTopics: string[];
    memoryIds: string[];
    createdAt: number;
}

// Relation types for knowledge graph
export type RelationType = 'similar_topic' | 'same_day' | 'referenced';

// Relation between memories
export interface Relation {
    id: string;
    sourceMemoryId: string;
    targetMemoryId: string;
    relationType: RelationType;
    strength: number; // 0.0 to 1.0
    createdAt: number;
}

// Search result with relevance score
export interface SearchResult {
    memory: Memory;
    score: number;
}

// Entity types for knowledge extraction
export type EntityType = 'topic' | 'person' | 'place' | 'date' | 'task';

// Extracted entity from memory content
export interface Entity {
    text: string;
    type: EntityType;
}
