/**
 * Memory Service
 * Handles creation, retrieval, and deletion of memories
 * Integrates with Cactus SDK for AI processing and SQLite for storage
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.5
 */

import { Memory } from '../types';
import {
    insertMemory,
    getMemory as dbGetMemory,
    getRecentMemories as dbGetRecentMemories,
    deleteMemory as dbDeleteMemory,
    deleteRelationsForMemory,
} from '../db/operations';
import {
    generateEmbedding,
    extractTags,
    transcribeAudio,
    describeImage,
    generateImageEmbedding,
} from './cactus';
import { createRelationsForMemory } from './relation';

/**
 * Generate a unique ID for a memory
 */
function generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a text memory
 * - Generates embedding using Cactus SDK
 * - Extracts tags using on-device LLM
 * - Saves to SQLite database
 * Requirements: 1.1-1.5
 */
export async function createTextMemory(content: string): Promise<Memory> {
    if (!content || content.trim().length === 0) {
        throw new Error('Memory content cannot be empty');
    }

    const now = Date.now();
    const id = generateId();

    // Generate embedding for semantic search
    const embedding = await generateEmbedding(content);

    // Extract tags using on-device LLM (non-critical, fallback to empty)
    let tags: string[] = [];
    try {
        tags = await extractTags(content);
    } catch (error) {
        console.warn('Tag extraction failed, continuing without tags:', error);
    }

    const memory: Memory = {
        id,
        type: 'text',
        content: content.trim(),
        embedding,
        tags,
        createdAt: now,
        updatedAt: now,
    };

    // Save to database
    await insertMemory(memory);

    // Create relations with existing memories (non-blocking)
    createRelationsForMemory(memory).catch((error) => {
        console.warn('Failed to create relations:', error);
    });

    return memory;
}


/**
 * Create a voice memory
 * - Transcribes audio using on-device Whisper model
 * - Generates embedding from transcribed text
 * - Extracts tags using on-device LLM
 * - Saves to SQLite database with original audio path
 * Requirements: 2.1-2.5
 */
export async function createVoiceMemory(audioUri: string): Promise<Memory> {
    if (!audioUri || audioUri.trim().length === 0) {
        throw new Error('Audio URI cannot be empty');
    }

    const now = Date.now();
    const id = generateId();

    // Transcribe audio using on-device Whisper
    const transcription = await transcribeAudio(audioUri);

    if (!transcription || transcription.trim().length === 0) {
        throw new Error('Transcription resulted in empty text');
    }

    // Generate embedding from transcribed text
    const embedding = await generateEmbedding(transcription);

    // Extract tags using on-device LLM (non-critical, fallback to empty)
    let tags: string[] = [];
    try {
        tags = await extractTags(transcription);
    } catch (error) {
        console.warn('Tag extraction failed, continuing without tags:', error);
    }

    const memory: Memory = {
        id,
        type: 'voice',
        content: transcription.trim(),
        rawContent: audioUri, // Store original audio path
        embedding,
        tags,
        createdAt: now,
        updatedAt: now,
    };

    // Save to database
    await insertMemory(memory);

    // Create relations with existing memories (non-blocking)
    createRelationsForMemory(memory).catch((error) => {
        console.warn('Failed to create relations:', error);
    });

    return memory;
}

/**
 * Create an image memory
 * - Describes image using on-device vision model
 * - Generates embedding from image
 * - Saves to SQLite database with original image path
 * Requirements: 3.1-3.5
 */
export async function createImageMemory(imageUri: string): Promise<Memory> {
    if (!imageUri || imageUri.trim().length === 0) {
        throw new Error('Image URI cannot be empty');
    }

    const now = Date.now();
    const id = generateId();

    // Describe image using on-device vision model
    const description = await describeImage(imageUri);

    // Generate embedding from image
    const embedding = await generateImageEmbedding(imageUri);

    // Extract tags from description (non-critical, fallback to empty)
    let tags: string[] = [];
    try {
        if (description && description.trim().length > 0) {
            tags = await extractTags(description);
        }
    } catch (error) {
        console.warn('Tag extraction failed, continuing without tags:', error);
    }

    const memory: Memory = {
        id,
        type: 'image',
        content: description.trim(),
        rawContent: imageUri, // Store original image path
        embedding,
        tags,
        createdAt: now,
        updatedAt: now,
    };

    // Save to database
    await insertMemory(memory);

    // Create relations with existing memories (non-blocking)
    createRelationsForMemory(memory).catch((error) => {
        console.warn('Failed to create relations:', error);
    });

    return memory;
}

/**
 * Get recent memories from the database
 * @param limit Maximum number of memories to retrieve
 */
export async function getRecentMemories(limit: number = 50): Promise<Memory[]> {
    return dbGetRecentMemories(limit);
}

/**
 * Get a single memory by ID
 * @param id Memory ID
 */
export async function getMemory(id: string): Promise<Memory | null> {
    return dbGetMemory(id);
}

/**
 * Delete a memory by ID
 * Also removes any relations associated with the memory
 * @param id Memory ID
 */
export async function deleteMemory(id: string): Promise<void> {
    // Delete relations first to maintain referential integrity
    await deleteRelationsForMemory(id);
    // Delete the memory
    await dbDeleteMemory(id);
}

// Export as MemoryService namespace for convenience
export const MemoryService = {
    createTextMemory,
    createVoiceMemory,
    createImageMemory,
    getRecentMemories,
    getMemory,
    deleteMemory,
};

export default MemoryService;
