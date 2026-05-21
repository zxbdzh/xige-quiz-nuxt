import { loadBank } from '~/server/utils/bank'

export default defineEventHandler(async () => {
  const bank = await loadBank()
  return {
    ...bank.meta,
    chapters: bank.chapters.map(c => ({
      id: c.id,
      no: c.no,
      title: c.title,
      mcqCount: c.mcq.length,
      kpCount: c.kps.reduce((n, k) => n + k.points.length, 0),
    })),
  }
})
