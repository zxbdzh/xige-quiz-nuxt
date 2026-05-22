/**
 * 根据 ids[] 批量取题(供"错题本"刷题使用)
 * 调用: /api/questions?ids=ch_一-q1,ch_二-q3
 */
import { loadBank } from '~/server/utils/bank'
import type { Mcq } from '~/types/bank'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const idsRaw = String(q.ids || '')
  const ids = idsRaw.split(',').map(s => s.trim()).filter(Boolean)
  if (!ids.length) return []
  const bank = await loadBank()
  const map = new Map<string, Mcq>()
  for (const c of bank.chapters) for (const m of c.mcq) map.set(m.id, m)
  return ids.map(id => map.get(id)).filter(Boolean)
})
