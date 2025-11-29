/**
 * SQLite Database Schema for NEURONIC
 * Defines table structures for memories, memory_packets, and relations
 */

// SQL statements for creating tables
export const CREATE_MEMORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    raw_content TEXT,
    embedding TEXT NOT NULL,
    tags TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

export const CREATE_MEMORY_PACKETS_TABLE = `
  CREATE TABLE IF NOT EXISTS memory_packets (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    key_topics TEXT,
    memory_ids TEXT,
    created_at INTEGER NOT NULL
  );
`;

export const CREATE_RELATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS relations (
    id TEXT PRIMARY KEY,
    source_memory_id TEXT NOT NULL,
    target_memory_id TEXT NOT NULL,
    relation_type TEXT,
    strength REAL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (source_memory_id) REFERENCES memories(id) ON DELETE CASCADE,
    FOREIGN KEY (target_memory_id) REFERENCES memories(id) ON DELETE CASCADE
  );
`;

// Index creation statements for performance optimization
export const CREATE_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);',
    'CREATE INDEX IF NOT EXISTS idx_packets_date ON memory_packets(date);',
    'CREATE INDEX IF NOT EXISTS idx_relations_source ON relations(source_memory_id);',
    'CREATE INDEX IF NOT EXISTS idx_relations_target ON relations(target_memory_id);',
];
