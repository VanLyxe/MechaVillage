import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || './data/village.db';
const DATA_DIR = path.dirname(DB_PATH);

export async function initDatabase(): Promise<sqlite3.Database> {
  // Create data directory if it doesn't exist
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create tables
      db.serialize(() => {
        // Users table
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            discriminator TEXT,
            avatar TEXT,
            email TEXT,
            house_x INTEGER DEFAULT 0,
            house_y INTEGER DEFAULT 0,
            last_x INTEGER DEFAULT 25,
            last_y INTEGER DEFAULT 25,
            coins INTEGER DEFAULT 100,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Items table
        db.run(`
          CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            rarity TEXT DEFAULT 'common',
            sprite_url TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // User items (inventory)
        db.run(`
          CREATE TABLE IF NOT EXISTS user_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (item_id) REFERENCES items (id)
          )
        `);

        // Chat messages (persistent)
        db.run(`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'chat',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Houses customization
        db.run(`
          CREATE TABLE IF NOT EXISTS house_decorations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            decoration_type TEXT NOT NULL,
            x INTEGER NOT NULL,
            y INTEGER NOT NULL,
            sprite_url TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        console.log('📦 Database tables created/verified');
        resolve(db);
      });
    });
  });
}