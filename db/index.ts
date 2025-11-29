/**
 * Database initialization and migration logic for NEURONIC
 * Uses expo-sqlite for local SQLite storage
 */

import * as SQLite from 'expo-sqlite';
import {
    CREATE_MEMORIES_TABLE,
    CREATE_MEMORY_PACKETS_TABLE,
    CREATE_RELATIONS_TABLE,
    CREATE_INDEXES,
} from './schema';

const DATABASE_NAME = 'neuronic.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create the database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) {
        return db;
    }

    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    return db;
}

/**
 * Initialize the database with all required tables and indexes
 * Should be called once when the app starts
 */
export async function initializeDatabase(): Promise<void> {
    const database = await getDatabase();

    // Enable foreign keys
    await database.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables
    await database.execAsync(CREATE_MEMORIES_TABLE);
    await database.execAsync(CREATE_MEMORY_PACKETS_TABLE);
    await database.execAsync(CREATE_RELATIONS_TABLE);

    // Create indexes for performance
    for (const indexSQL of CREATE_INDEXES) {
        await database.execAsync(indexSQL);
    }
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.closeAsync();
        db = null;
    }
}
