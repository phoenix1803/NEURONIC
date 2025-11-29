/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 * Requirements: 6.2
 */

/**
 * Converts a timestamp to a date string in YYYY-MM-DD format
 * @param timestamp Unix timestamp in milliseconds
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateString(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Checks if a timestamp is from today
 * @param timestamp Unix timestamp in milliseconds
 * @returns True if the timestamp is from today
 */
export function isToday(timestamp: number): boolean {
    const today = new Date();
    const date = new Date(timestamp);
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

/**
 * Gets a human-readable relative time string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Relative time string (e.g., "Just now", "5 minutes ago", "Yesterday")
 */
export function getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    // Time constants in milliseconds
    const MINUTE = 60 * 1000;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const YEAR = 365 * DAY;

    if (diff < MINUTE) {
        return 'Just now';
    }

    if (diff < HOUR) {
        const minutes = Math.floor(diff / MINUTE);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    if (diff < DAY) {
        const hours = Math.floor(diff / HOUR);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    if (diff < 2 * DAY) {
        return 'Yesterday';
    }

    if (diff < WEEK) {
        const days = Math.floor(diff / DAY);
        return `${days} days ago`;
    }

    if (diff < MONTH) {
        const weeks = Math.floor(diff / WEEK);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    if (diff < YEAR) {
        const months = Math.floor(diff / MONTH);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    const years = Math.floor(diff / YEAR);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Formats a timestamp to a readable time string (HH:MM)
 * @param timestamp Unix timestamp in milliseconds
 * @returns Time string in HH:MM format
 */
export function getTimeString(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Formats a timestamp to a full readable date and time
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string (e.g., "Nov 29, 2025 at 14:30")
 */
export function getFormattedDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const time = getTimeString(timestamp);
    return `${month} ${day}, ${year} at ${time}`;
}
