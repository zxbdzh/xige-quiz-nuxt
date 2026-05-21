import { loadBank } from '~/server/utils/bank'

export default defineEventHandler(async () => {
  const bank = await loadBank()
  return bank
})
