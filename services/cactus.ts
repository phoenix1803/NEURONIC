/**
 * Cactus SDK Service Wrapper
 * Singleton service for on-device AI operations using Cactus SDK
 * Handles text embeddings, completions, vision, and speech-to-text
 * Requirements: 10.2, 10.3, 10.4
 */

import { CactusLM, CactusSTT, type Message } from 'cactus-react-native';
import { MODEL_CONFIG, INFERENCE_OPTIONS, PROMPTS } from '../constants';

// Singleton model instances
let textModel: CactusLM | null = null;
let visionModel: CactusLM | null = null;
let sttModel: CactusSTT | null = null;

// Model ready states
let textModelReady = false;
let visionModelReady = false;
let sttModelReady = false;

// Initialization promises for preventing duplicate init calls
let textModelInitPromise: Promise<void> | null = null;
let visionModelInitPromise: Promise<void> | null = null;
let sttModelInitPromise: Promise<void> | null = null;

// Progress callback type
type ProgressCallback = (progress: number) => void;

/**
 * Initialize the text/embedding model (qwen3-0.6)
 * Uses promise caching to prevent duplicate initialization
 */
export async function initTextModel(onProgress?: ProgressCallback): Promise<void> {
    // Return early if already ready
    if (textModelReady && textModel) {
        return;
    }

    // Return existing promise if initialization is in progress
    if (textModelInitPromise) {
        return textModelInitPromise;
    }

    // Create new initialization promise
    textModelInitPromise = (async () => {
        try {
            textModel = new CactusLM({
                model: MODEL_CONFIG.text.model,
                contextSize: MODEL_CONFIG.text.contextSize,
            });

            await textModel.download({
                onProgress: (p) => onProgress?.(p),
            });

            textModelReady = true;
        } catch (error) {
            textModel = null;
            textModelReady = false;
            textModelInitPromise = null;
            throw new Error(`Failed to initialize text model: ${error}`);
        }
    })();

    return textModelInitPromise;
}

/**
 * Initialize the vision model (lfm2-vl-450m)
 * Uses promise caching to prevent duplicate initialization
 */
export async function initVisionModel(onProgress?: ProgressCallback): Promise<void> {
    if (visionModelReady && visionModel) {
        return;
    }

    if (visionModelInitPromise) {
        return visionModelInitPromise;
    }

    visionModelInitPromise = (async () => {
        try {
            visionModel = new CactusLM({
                model: MODEL_CONFIG.vision.model,
                contextSize: MODEL_CONFIG.vision.contextSize,
            });

            await visionModel.download({
                onProgress: (p) => onProgress?.(p),
            });

            visionModelReady = true;
        } catch (error) {
            visionModel = null;
            visionModelReady = false;
            visionModelInitPromise = null;
            throw new Error(`Failed to initialize vision model: ${error}`);
        }
    })();

    return visionModelInitPromise;
}


/**
 * Initialize the speech-to-text model (whisper-small)
 * Uses promise caching to prevent duplicate initialization
 */
export async function initSTTModel(onProgress?: ProgressCallback): Promise<void> {
    if (sttModelReady && sttModel) {
        return;
    }

    if (sttModelInitPromise) {
        return sttModelInitPromise;
    }

    sttModelInitPromise = (async () => {
        try {
            sttModel = new CactusSTT({
                model: MODEL_CONFIG.stt.model,
                contextSize: MODEL_CONFIG.stt.contextSize,
            });

            await sttModel.download({
                onProgress: (p) => onProgress?.(p),
            });

            await sttModel.init();
            sttModelReady = true;
        } catch (error) {
            sttModel = null;
            sttModelReady = false;
            sttModelInitPromise = null;
            throw new Error(`Failed to initialize STT model: ${error}`);
        }
    })();

    return sttModelInitPromise;
}

/**
 * Ensure text model is initialized (lazy loading)
 */
async function ensureTextModel(): Promise<CactusLM> {
    if (!textModel || !textModelReady) {
        await initTextModel();
    }
    if (!textModel) {
        throw new Error('Text model failed to initialize');
    }
    return textModel;
}

/**
 * Generate text embedding using CactusLM
 * Automatically initializes model if not ready (lazy loading)
 * @param text - Text to generate embedding for
 * @returns Array of embedding floats
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const model = await ensureTextModel();

    try {
        const result = await model.embed({ text });
        return result.embedding;
    } catch (error) {
        throw new Error(`Failed to generate embedding: ${error}`);
    }
}

/**
 * Run text completion using CactusLM
 * Automatically initializes model if not ready (lazy loading)
 * @param messages - Array of messages for completion
 * @param maxTokens - Maximum tokens to generate
 * @returns Completion response text
 */
export async function complete(
    messages: Message[],
    maxTokens: number = INFERENCE_OPTIONS.maxTokens
): Promise<string> {
    const model = await ensureTextModel();

    try {
        const result = await model.complete({
            messages,
            options: {
                maxTokens,
                temperature: INFERENCE_OPTIONS.temperature,
                topP: INFERENCE_OPTIONS.topP,
            },
        });
        return result.response;
    } catch (error) {
        throw new Error(`Failed to complete text: ${error}`);
    }
}

/**
 * Summarize text using on-device LLM
 * @param text - Text to summarize
 * @returns Summary string
 */
export async function summarizeText(text: string): Promise<string> {
    const messages: Message[] = [
        { role: 'system', content: PROMPTS.summarization },
        { role: 'user', content: text },
    ];

    return complete(messages, 256);
}

/**
 * Extract tags from text using on-device LLM
 * @param text - Text to extract tags from
 * @returns Array of tag strings
 */
export async function extractTags(text: string): Promise<string[]> {
    const messages: Message[] = [
        { role: 'system', content: PROMPTS.tagExtraction },
        { role: 'user', content: text },
    ];

    try {
        const response = await complete(messages, 64);
        // Parse comma-separated tags and clean them up
        const tags = response
            .split(',')
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0 && tag.length < 50)
            .slice(0, 5); // Max 5 tags
        return tags;
    } catch (error) {
        // Return empty array if tag extraction fails (non-critical)
        console.warn('Tag extraction failed:', error);
        return [];
    }
}


/**
 * Ensure vision model is initialized (lazy loading)
 */
async function ensureVisionModel(): Promise<CactusLM> {
    if (!visionModel || !visionModelReady) {
        await initVisionModel();
    }
    if (!visionModel) {
        throw new Error('Vision model failed to initialize');
    }
    return visionModel;
}

/**
 * Ensure STT model is initialized (lazy loading)
 */
async function ensureSTTModel(): Promise<CactusSTT> {
    if (!sttModel || !sttModelReady) {
        await initSTTModel();
    }
    if (!sttModel) {
        throw new Error('STT model failed to initialize');
    }
    return sttModel;
}

/**
 * Describe an image using on-device vision model
 * Automatically initializes model if not ready (lazy loading)
 * @param imagePath - Path to the image file
 * @returns Description string
 */
export async function describeImage(imagePath: string): Promise<string> {
    const model = await ensureVisionModel();

    try {
        const messages: Message[] = [
            {
                role: 'user',
                content: PROMPTS.imageDescription,
                images: [imagePath],
            },
        ];

        const result = await model.complete({
            messages,
            options: {
                maxTokens: 256,
                temperature: INFERENCE_OPTIONS.temperature,
            },
        });

        return result.response;
    } catch (error) {
        throw new Error(`Failed to describe image: ${error}`);
    }
}

/**
 * Generate image embedding using vision model
 * Automatically initializes model if not ready (lazy loading)
 * @param imagePath - Path to the image file
 * @returns Array of embedding floats
 */
export async function generateImageEmbedding(imagePath: string): Promise<number[]> {
    const model = await ensureVisionModel();

    try {
        const result = await model.imageEmbed({ imagePath });
        return result.embedding;
    } catch (error) {
        throw new Error(`Failed to generate image embedding: ${error}`);
    }
}

/**
 * Transcribe audio to text using on-device Whisper model
 * Automatically initializes model if not ready (lazy loading)
 * @param audioFilePath - Path to the audio file
 * @returns Transcription string
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
    const model = await ensureSTTModel();

    try {
        const result = await model.transcribe({ audioFilePath });
        return result.response;
    } catch (error) {
        throw new Error(`Failed to transcribe audio: ${error}`);
    }
}

/**
 * Clean up and destroy all model instances
 */
export async function destroy(): Promise<void> {
    try {
        if (textModel) {
            await textModel.destroy?.();
            textModel = null;
            textModelReady = false;
            textModelInitPromise = null;
        }

        if (visionModel) {
            await visionModel.destroy?.();
            visionModel = null;
            visionModelReady = false;
            visionModelInitPromise = null;
        }

        if (sttModel) {
            await sttModel.destroy?.();
            sttModel = null;
            sttModelReady = false;
            sttModelInitPromise = null;
        }
    } catch (error) {
        console.error('Error destroying models:', error);
    }
}

/**
 * Check if text model is ready
 */
export function isTextModelReady(): boolean {
    return textModelReady;
}

/**
 * Check if vision model is ready
 */
export function isVisionModelReady(): boolean {
    return visionModelReady;
}

/**
 * Check if STT model is ready
 */
export function isSTTModelReady(): boolean {
    return sttModelReady;
}

/**
 * Check if all models are ready
 */
export function areAllModelsReady(): boolean {
    return textModelReady && visionModelReady && sttModelReady;
}

// Export the CactusService as a namespace for convenience
export const CactusService = {
    // Initialization
    initTextModel,
    initVisionModel,
    initSTTModel,

    // Text processing
    generateEmbedding,
    complete,
    summarizeText,
    extractTags,

    // Vision processing
    describeImage,
    generateImageEmbedding,

    // Speech processing
    transcribeAudio,

    // Cleanup
    destroy,

    // Status checks
    isTextModelReady,
    isVisionModelReady,
    isSTTModelReady,
    areAllModelsReady,
};

export default CactusService;
