import { loadBank, shuffle, type Mcq } from '~/server/utils/bank'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const count = Math.max(1, Math.min(100, Number(q.count) || 10))
  const chapterId = q.chapter ? String(q.chapter) : ''
  const bank = await loadBank()
  let pool: Mcq[] = []
  if (chapterId && chapterId !== 'all') {
    const c = bank.chapters.find(c => c.id === chapterId)
    pool = c ? c.mcq.slice() : []
  } else {
    pool = bank.chapters.flatMap(c => c.mcq)
  }
  return shuffle(pool).slice(0, count)
})
