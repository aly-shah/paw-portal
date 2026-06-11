// SQLite database setup + schema. Single-file DB stored next to the server.
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DB file location can be overridden with DB_PATH (useful in production).
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'pawportal.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // better concurrency
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL,
    avatar        TEXT,
    created_at    TEXT NOT NULL
  );

  -- Generic per-collection item store.
  -- scope = 'user'   -> private to one user (their pets, records, etc.)
  -- scope = 'global' -> shared across everyone (community feed, etc.); user_id = author
  CREATE TABLE IF NOT EXISTS items (
    pk          INTEGER PRIMARY KEY AUTOINCREMENT,
    scope       TEXT NOT NULL,
    collection  TEXT NOT NULL,
    item_id     TEXT NOT NULL,
    user_id     TEXT,
    data        TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    UNIQUE (scope, collection, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_items_user ON items (scope, collection, user_id);
  CREATE INDEX IF NOT EXISTS idx_items_global ON items (scope, collection);
`);

export default db;
