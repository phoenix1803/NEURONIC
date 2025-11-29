/**
 * NEURONIC App Constants
 * Model configurations, prompts, and app settings
 */

// Model configurations for Cactus SDK
export const MODEL_CONFIG = {
    // Text/Embedding model (default qwen3-0.6)
    text: {
        model: 'qwen3-0.6',
        contextSize: 2048,
    },
    // Vision model for image analysis
    vision: {
        model: 'lfm2-vl-450m',
        contextSize: 2048,
    },
    // Speech-to-text model
    stt: {
        model: 'whisper-small',
        contextSize: 2048,
    },
} as const;

// Inference options
export const INFERENCE_OPTIONS = {
    maxTokens: 128,
    temperature: 0.7,
    topP: 0.9,
} as const;

// System prompts for AI operations
export const PROMPTS = {
    // System prompt for the Neuronic agent
    system: `You are NEURONIC, a personal cognitive twin AI assistant. You help users organize, recall, and connect their memories. You are privacy-focused and operate entirely on-device. Be concise, helpful, and insightful when analyzing memories.`,

    // Tag extraction prompt
    tagExtraction: `Extract relevant tags from the following text. Return only comma-separated tags, no explanations. Focus on key topics, people, places, and important concepts. Maximum 5 tags.`,

    // Memory summarization prompt
    summarization: `Summarize the following memory content in 1-2 sentences. Be concise and capture the key information.`,

    // Daily consolidation prompt
    dailyConsolidation: `You are summarizing a day's worth of memories. Create a brief summary (2-3 sentences) that captures the main themes and activities. Also extract 3-5 key topics as a comma-separated list.

Format your response as:
SUMMARY: [your summary here]
TOPICS: [topic1, topic2, topic3]`,

    // Image description prompt
    imageDescription: `Describe this image briefly in 1-2 sentences. Focus on the main subject and any notable details.`,

    // Entity extraction prompt
    entityExtraction: `Extract key entities from the following text. Identify topics, people, places, dates, and tasks. Return as JSON array with format: [{"text": "entity", "type": "topic|person|place|date|task"}]`,
} as const;

// App settings
export const APP_SETTINGS = {
    // Search settings
    search: {
        defaultLimit: 10,
        maxResults: 50,
        similarityThreshold: 0.5, // Minimum cosine similarity for results
    },
    // Memory settings
    memory: {
        maxTagsPerMemory: 5,
        maxContentLength: 10000,
    },
    // Consolidation settings
    consolidation: {
        minMemoriesForConsolidation: 1,
        maxMemoriesPerPacket: 100,
    },
    // UI settings
    ui: {
        recentMemoriesLimit: 20,
        searchDebounceMs: 300,
    },
} as const;

// Database table names
export const DB_TABLES = {
    memories: 'memories',
    memoryPackets: 'memory_packets',
    relations: 'relations',
} as const;

// AsyncStorage keys
export const STORAGE_KEYS = {
    modelsDownloaded: 'neuronic_models_downloaded',
    textModelReady: 'neuronic_text_model_ready',
    visionModelReady: 'neuronic_vision_model_ready',
    sttModelReady: 'neuronic_stt_model_ready',
    lastConsolidationDate: 'neuronic_last_consolidation_date',
} as const;
