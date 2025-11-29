/**
 * Error Handler Utilities
 * Centralized error handling for the app
 * Requirements: 10.4
 */

// Error codes for categorizing errors
export enum ErrorCode {
    MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
    EMBEDDING_FAILED = 'EMBEDDING_FAILED',
    TRANSCRIPTION_FAILED = 'TRANSCRIPTION_FAILED',
    VISION_FAILED = 'VISION_FAILED',
    DATABASE_ERROR = 'DATABASE_ERROR',
    STORAGE_FULL = 'STORAGE_FULL',
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// App error interface
export interface AppError {
    code: ErrorCode;
    message: string;
    originalError?: Error;
    recoverable: boolean;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.MODEL_LOAD_FAILED]: 'Failed to load AI model. Please restart the app.',
    [ErrorCode.EMBEDDING_FAILED]: 'Failed to process text. Please try again.',
    [ErrorCode.TRANSCRIPTION_FAILED]: 'Failed to transcribe audio. Please try again.',
    [ErrorCode.VISION_FAILED]: 'Failed to analyze image. Please try again.',
    [ErrorCode.DATABASE_ERROR]: 'Database error occurred. Please try again.',
    [ErrorCode.STORAGE_FULL]: 'Device storage is full. Please free up space.',
    [ErrorCode.PERMISSION_DENIED]: 'Permission denied. Please check app settings.',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Create an AppError from an unknown error
 */
export function createAppError(
    error: unknown,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR
): AppError {
    const originalError = error instanceof Error ? error : new Error(String(error));

    return {
        code,
        message: ERROR_MESSAGES[code],
        originalError,
        recoverable: code !== ErrorCode.STORAGE_FULL && code !== ErrorCode.MODEL_LOAD_FAILED,
    };
}

/**
 * Get user-friendly message from error
 */
export function getUserFriendlyMessage(error: unknown): string {
    if (error instanceof Error) {
        // Check for specific error patterns
        const message = error.message.toLowerCase();

        if (message.includes('model') || message.includes('initialize')) {
            return ERROR_MESSAGES[ErrorCode.MODEL_LOAD_FAILED];
        }
        if (message.includes('embedding')) {
            return ERROR_MESSAGES[ErrorCode.EMBEDDING_FAILED];
        }
        if (message.includes('transcri')) {
            return ERROR_MESSAGES[ErrorCode.TRANSCRIPTION_FAILED];
        }
        if (message.includes('vision') || message.includes('image')) {
            return ERROR_MESSAGES[ErrorCode.VISION_FAILED];
        }
        if (message.includes('database') || message.includes('sqlite')) {
            return ERROR_MESSAGES[ErrorCode.DATABASE_ERROR];
        }
        if (message.includes('storage') || message.includes('disk') || message.includes('space')) {
            return ERROR_MESSAGES[ErrorCode.STORAGE_FULL];
        }
        if (message.includes('permission')) {
            return ERROR_MESSAGES[ErrorCode.PERMISSION_DENIED];
        }

        // Return the original message if it's short enough
        if (error.message.length < 100) {
            return error.message;
        }
    }

    return ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Wrap an async function with error handling
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        console.error(`Error [${errorCode}]:`, error);
        throw createAppError(error, errorCode);
    }
}

/**
 * Log error for debugging
 */
export function logError(context: string, error: unknown): void {
    console.error(`[${context}]`, error);

    if (error instanceof Error) {
        console.error('Stack:', error.stack);
    }
}

export default {
    ErrorCode,
    createAppError,
    getUserFriendlyMessage,
    withErrorHandling,
    logError,
};
