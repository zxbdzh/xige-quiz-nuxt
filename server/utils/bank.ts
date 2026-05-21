import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Bank, Mcq, Chapter, OptionMap, Letter, Kp } from '~/types/bank'

export type { Bank, Mcq, Chapter, Kp, OptionMap, Letter }

let cache: Bank | null = null

/**
 * 加载 bank.json。
 * 1) 先尝试 Nitro serverAssets(useStorage('assets:data')),生产构建后会内联
 * 2) 退回到文件系统读取(dev 模式更可靠)
 */
export async function loadBank(): Promise<Bank> {
  if (cache) return cache

  let bank: Bank | null = null

  // 方式 A:Nitro server assets
  try {
    const storage = useStorage('assets:data')
    const raw = await storage.getItem<unknown>('bank.json')
    if (raw) {
      bank = typeof raw === 'string' ? (JSON.parse(raw) as Bank) : (raw as Bank)
    }
  } catch {
    // ignore
  }

  // 方式 B:文件系统(开发模式兜底)
  if (!bank) {
    const candidates = [
      resolve(process.cwd(), 'server/data/bank.json'),
      resolve(process.cwd(), 'data/bank.json'),
    ]
    for (const p of candidates) {
      try {
        const text = await readFile(p, 'utf-8')
        bank = JSON.parse(text) as Bank
        break
      } catch {
        // try next
      }
    }
  }

  if (!bank) {
    throw createError({ statusCode: 500, statusMessage: 'bank.json not found' })
  }
  for (const c of bank.chapters) {
    for (const q of c.mcq) q.chapterId = c.id
  }
  cache = bank
  return bank
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
