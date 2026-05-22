import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { dirname } from 'node:path'
import { mkdirSync } from 'node:fs'
import * as schema from './schema'

const dbPath = process.env.DB_PATH || './data/app.db'

// 保险:目录不存在自动建
try {
  mkdirSync(dirname(dbPath), { recursive: true })
} catch {
  // ignore
}

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
export { schema }
