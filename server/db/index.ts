import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { dirname, resolve } from 'node:path'
import { mkdirSync, existsSync } from 'node:fs'
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

// 启动时自动执行迁移(幂等,drizzle 用 __drizzle_migrations 记录已应用版本)。
// 生产容器没有独立迁移步骤,靠这里保证 better-auth 等所需表存在。
// drizzle 目录在 build 阶段拷入运行镜像(见 Dockerfile),运行时 cwd 为 /app。
const migrationsFolder = resolve(process.cwd(), 'drizzle')
if (existsSync(migrationsFolder)) {
  try {
    migrate(db, { migrationsFolder })
  } catch (err) {
    console.error('[db] 自动迁移失败:', err)
  }
} else {
  console.warn('[db] 未找到迁移目录,跳过自动迁移:', migrationsFolder)
}

export { schema }
