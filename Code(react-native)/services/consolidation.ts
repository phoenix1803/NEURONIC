/**
 * Consolidation Service
 * Handles daily memory consolidation into compressed "memory packets"
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { MemoryPacket } from '../types';
import {
    getMemoriesByDate,
    insertMemoryPacket,
    getMemoryPackets as dbGetMemoryPackets,
    getPacketByDate as dbGetPacketByDate,
} from '../db/operations';
import { complete } from './cactus';
import { PROMPTS, APP_SETTINGS } from '../constants';
import type { Message } from 'cactus-react-native';

/**
 * Generate a unique ID for a memory packet
 */
function generatePacketId(): string {
    return `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parse the LLM response to extract summary and topics
 * Expected format:
 * SUMMARY: [summary text]
 * TOPICS: [topic1, topic2, topic3]
 */
function parseConsolidationResponse(response: string): { summary: string; topics: string[] } {
    const lines = response.split('\n');
    let summary = '';
    let topics: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.toUpperCase().startsWith('SUMMARY:')) {
            summary = trimmedLine.substring(8).trim();
        } else if (trimmedLine.toUpperCase().startsWith('TOPICS:')) {
            const topicsStr = trimmedLine.substring(7).trim();
            topics = topicsStr
                .split(',')
                .map((t) => t.trim().toLowerCase())
                .filter((t) => t.length > 0 && t.length < 50)
                .slice(0, 5);
        }
    }

    // Fallback if parsing fails
    if (!summary && response.length > 0) {
        summary = response.substring(0, 500);
    }

    return { summary, topics };
}


/**
 * Consolidate a day's memories into a memory packet
 * - Fetches all memories for the specified date
 * - Summarizes them using on-device LLM
 * - Extracts key topics
 * - Saves as a memory packet in SQLite
 * 
 * Requirements:
 * - 6.1: Display daily memory summaries
 * - 6.2: Run consolidation on previous day's memories
 * - 6.3: Use on-device LLM for summarization
 * - 6.4: Store as memory packet with date reference
 * - 6.5: Show compressed summaries with key topics
 * 
 * @param date Date string in YYYY-MM-DD format
 * @returns The created MemoryPacket
 */
export async function consolidateDay(date: string): Promise<MemoryPacket> {
    // Check if packet already exists for this date
    const existingPacket = await dbGetPacketByDate(date);
    if (existingPacket) {
        return existingPacket;
    }

    // Get all memories for the specified date
    const memories = await getMemoriesByDate(date);

    if (memories.length < APP_SETTINGS.consolidation.minMemoriesForConsolidation) {
        throw new Error(`Not enough memories to consolidate for ${date}. Found ${memories.length}, need at least ${APP_SETTINGS.consolidation.minMemoriesForConsolidation}.`);
    }

    // Limit memories to prevent context overflow
    const memoriesToConsolidate = memories.slice(0, APP_SETTINGS.consolidation.maxMemoriesPerPacket);

    // Build content string from memories
    const memoriesContent = memoriesToConsolidate
        .map((m, i) => `${i + 1}. [${m.type.toUpperCase()}] ${m.content}`)
        .join('\n');

    // Generate summary using on-device LLM
    const messages: Message[] = [
        { role: 'system', content: PROMPTS.dailyConsolidation },
        { role: 'user', content: `Here are the memories from ${date}:\n\n${memoriesContent}` },
    ];

    const response = await complete(messages, 256);

    // Parse the response to extract summary and topics
    const { summary, topics } = parseConsolidationResponse(response);

    const now = Date.now();
    const packet: MemoryPacket = {
        id: generatePacketId(),
        date,
        summary: summary || `Summary of ${memoriesToConsolidate.length} memories from ${date}`,
        keyTopics: topics,
        memoryIds: memoriesToConsolidate.map((m) => m.id),
        createdAt: now,
    };

    // Save to database
    await insertMemoryPacket(packet);

    return packet;
}

/**
 * Get all memory packets ordered by date (newest first)
 */
export async function getMemoryPackets(): Promise<MemoryPacket[]> {
    return dbGetMemoryPackets();
}

/**
 * Get a memory packet by date
 * @param date Date string in YYYY-MM-DD format
 */
export async function getPacketByDate(date: string): Promise<MemoryPacket | null> {
    return dbGetPacketByDate(date);
}

// Export as ConsolidationService namespace for convenience
export const ConsolidationService = {
    consolidateDay,
    getMemoryPackets,
    getPacketByDate,
};

export default ConsolidationService;
