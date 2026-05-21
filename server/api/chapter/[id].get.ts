import { loadBank } from '~/server/utils/bank'

export default defineEventHandler(async (event) => {
  const id = decodeURIComponent(getRouterParam(event, 'id') || '')
  const bank = await loadBank()
  const chap = bank.chapters.find(c => c.id === id)
  if (!chap) {
    throw createError({ statusCode: 404, statusMessage: `Chapter ${id} not found` })
  }
  return chap
})
