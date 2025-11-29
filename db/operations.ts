/**
 * Database CRUD operations for NEURONIC
 * Provides functions for memories, memory_packets, and relations
 */

import { getDatabase } from './index';

// Type definitions (will be moved to types/index.ts in task 3)
export type MemoryType = 'text' | 'voice' | 'image';

export interface Memory {
    id: string;
    type: MemoryType;
    content: string;
    rawContent?: string;
    embedding: number[];
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

export interface MemoryPacket {
    id: string;
    date: string;
    summary: string;
    keyTopics: string[];
    memoryIds: string[];
    createdAt: number;
}

export interface Relation {
    id: string;
    sourceMemoryId: string;
    targetMemoryId: string;
    relationType: 'similar_topic' | 'same_day' | 'referenced';
    strength: number;
    createdAt: number;
}

// ============================================
// Memory Operations
// ============================================

/**
 * Insert a new memory into the database
 */
export async function insertMemory(memory: Memory): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
        `INSERT INTO memories (id, type, content, raw_content, embedding, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            memory.id,
            memory.type,
            memory.content,
            memory.rawContent ?? null,
            JSON.stringify(memory.embedding),
            JSON.stringify(memory.tags),
            memory.createdAt,
            memory.updatedAt,
        ]
    );
}

/**
 * Get a single memory by ID
 */
export async function getMemory(id: string): Promise<Memory | null> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<{
        id: string;
        type: MemoryType;
        content: string;
        raw_content: string | null;
        embedding: string;
        tags: string | null;
        created_at: number;
        updated_at: number;
    }>('SELECT * FROM memories WHERE id = ?', [id]);

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        type: row.type,
        content: row.content,
        rawContent: row.raw_content ?? undefined,
        embedding: JSON.parse(row.embedding),
        tags: row.tags ? JSON.parse(row.tags) : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

/**
 * Get recent memories ordered by creation date (newest first)
 */
export async function getRecentMemories(limit: number = 50): Promise<Memory[]> {
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
        id: string;
        type: MemoryType;
        content: string;
        raw_content: string | null;
        embedding: string;
        tags: string | null;
        created_at: number;
        updated_at: number;
    }>('SELECT * FROM memories ORDER BY created_at DESC LIMIT ?', [limit]);

    return rows.map((row) => ({
        id: row.id,
        type: row.type,
        content: row.content,
        rawContent: row.raw_content ?? undefined,
        embedding: JSON.parse(row.embedding),
        tags: row.tags ? JSON.parse(row.tags) : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

/**
 * Delete a memory by ID
 */
export async function deleteMemory(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM memories WHERE id = ?', [id]);
}

/**
 * Get all memories for a specific date (YYYY-MM-DD format)
 */
export async function getMemoriesByDate(date: string): Promise<Memory[]> {
    const db = await getDatabase();

    // Convert date to timestamp range (start and end of day)
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    const rows = await db.getAllAsync<{
        id: string;
        type: MemoryType;
        content: string;
        raw_content: string | null;
        embedding: string;
        tags: string | null;
        created_at: number;
        updated_at: number;
    }>(
        'SELECT * FROM memories WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC',
        [startOfDay, endOfDay]
    );

    return rows.map((row) => ({
        id: row.id,
        type: row.type,
        content: row.content,
        rawContent: row.raw_content ?? undefined,
        embedding: JSON.parse(row.embedding),
        tags: row.tags ? JSON.parse(row.tags) : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

/**
 * Get all memories (for semantic search)
 */
export async function getAllMemories(): Promise<Memory[]> {
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
        id: string;
        type: MemoryType;
        content: string;
        raw_content: string | null;
        embedding: string;
        tags: string | null;
        created_at: number;
        updated_at: number;
    }>('SELECT * FROM memories ORDER BY created_at DESC');

    return rows.map((row) => ({
        id: row.id,
        type: row.type,
        content: row.content,
        rawContent: row.raw_content ?? undefined,
        embedding: JSON.parse(row.embedding),
        tags: row.tags ? JSON.parse(row.tags) : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

// ============================================
// Memory Packet Operations
// ============================================

/**
 * Insert a new memory packet (daily consolidation)
 */
export async function insertMemoryPacket(packet: MemoryPacket): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
        `INSERT INTO memory_packets (id, date, summary, key_topics, memory_ids, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            packet.id,
            packet.date,
            packet.summary,
            JSON.stringify(packet.keyTopics),
            JSON.stringify(packet.memoryIds),
            packet.createdAt,
        ]
    );
}


/**
 * Get all memory packets ordered by date (newest first)
 */
export async function getMemoryPackets(): Promise<MemoryPacket[]> {
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
        id: string;
        date: string;
        summary: string;
        key_topics: string | null;
        memory_ids: string | null;
        created_at: number;
    }>('SELECT * FROM memory_packets ORDER BY date DESC');

    return rows.map((row) => ({
        id: row.id,
        date: row.date,
        summary: row.summary,
        keyTopics: row.key_topics ? JSON.parse(row.key_topics) : [],
        memoryIds: row.memory_ids ? JSON.parse(row.memory_ids) : [],
        createdAt: row.created_at,
    }));
}

/**
 * Get a memory packet by date (YYYY-MM-DD format)
 */
export async function getPacketByDate(date: string): Promise<MemoryPacket | null> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<{
        id: string;
        date: string;
        summary: string;
        key_topics: string | null;
        memory_ids: string | null;
        created_at: number;
    }>('SELECT * FROM memory_packets WHERE date = ?', [date]);

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        date: row.date,
        summary: row.summary,
        keyTopics: row.key_topics ? JSON.parse(row.key_topics) : [],
        memoryIds: row.memory_ids ? JSON.parse(row.memory_ids) : [],
        createdAt: row.created_at,
    };
}

// ============================================
// Relation Operations
// ============================================

/**
 * Insert a new relation between memories
 */
export async function insertRelation(relation: Relation): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
        `INSERT INTO relations (id, source_memory_id, target_memory_id, relation_type, strength, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            relation.id,
            relation.sourceMemoryId,
            relation.targetMemoryId,
            relation.relationType,
            relation.strength,
            relation.createdAt,
        ]
    );
}

/**
 * Get all memories related to a given memory ID
 */
export async function getRelatedMemories(memoryId: string): Promise<{ memory: Memory; relation: Relation }[]> {
    const db = await getDatabase();

    // Get relations where the memory is either source or target
    const relations = await db.getAllAsync<{
        id: string;
        source_memory_id: string;
        target_memory_id: string;
        relation_type: 'similar_topic' | 'same_day' | 'referenced';
        strength: number;
        created_at: number;
    }>(
        `SELECT * FROM relations 
     WHERE source_memory_id = ? OR target_memory_id = ?
     ORDER BY strength DESC`,
        [memoryId, memoryId]
    );

    const results: { memory: Memory; relation: Relation }[] = [];

    for (const rel of relations) {
        // Get the related memory (the one that isn't the input memoryId)
        const relatedId = rel.source_memory_id === memoryId
            ? rel.target_memory_id
            : rel.source_memory_id;

        const memory = await getMemory(relatedId);

        if (memory) {
            results.push({
                memory,
                relation: {
                    id: rel.id,
                    sourceMemoryId: rel.source_memory_id,
                    targetMemoryId: rel.target_memory_id,
                    relationType: rel.relation_type,
                    strength: rel.strength,
                    createdAt: rel.created_at,
                },
            });
        }
    }

    return results;
}

/**
 * Delete all relations for a memory (called when deleting a memory)
 */
export async function deleteRelationsForMemory(memoryId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        'DELETE FROM relations WHERE source_memory_id = ? OR target_memory_id = ?',
        [memoryId, memoryId]
    );
}

/**
 * Check if a relation already exists between two memories (in either direction)
 */
export async function checkRelationExists(
    memoryId1: string,
    memoryId2: string
): Promise<boolean> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM relations 
         WHERE (source_memory_id = ? AND target_memory_id = ?)
            OR (source_memory_id = ? AND target_memory_id = ?)`,
        [memoryId1, memoryId2, memoryId2, memoryId1]
    );

    return (row?.count ?? 0) > 0;
}
