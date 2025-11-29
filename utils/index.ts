/**
 * Utility Functions Index
 * Re-exports all utility functions for convenient imports
 */

export { cosineSimilarity, findTopKSimilar } from './similarity';
export {
    getDateString,
    isToday,
    getRelativeTime,
    getTimeString,
    getFormattedDateTime,
} from './date';
export {
    ErrorCode,
    createAppError,
    getUserFriendlyMessage,
    withErrorHandling,
    logError,
} from './errorHandler';
export type { AppError } from './errorHandler';
