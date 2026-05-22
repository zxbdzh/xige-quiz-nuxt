import type { Bank, BankMetaExt, Chapter, Mcq } from '~/types/bank'

/** 全量题库,通过 useFetch 在首次访问时获取并缓存(SSR + 客户端共用) */
export const useBank = () => {
  return useFetch<Bank>('/api/bank', {
    key: 'bank',
    server: true,
    default: () => ({
      meta: { source: '', subject: '', totalChapters: 0, totalMcq: 0, totalKp: 0 },
      chapters: [],
    }),
  })
}

/** 只取轻量元信息(章节列表 + 计数),首页/导航用 */
export const useBankMeta = () => {
  return useFetch<BankMetaExt>('/api/meta', {
    key: 'bank-meta',
    server: true,
    default: () => ({
      source: '',
      subject: '',
      totalChapters: 0,
      totalMcq: 0,
      totalKp: 0,
      chapters: [],
    }),
  })
}

/** 单章,watch 防止客户端导航数据不刷新 */
export const useChapter = (id: Ref<string> | ComputedRef<string>) => {
  return useFetch<Chapter>(() => `/api/chapter/${encodeURIComponent(unref(id))}`, {
    key: () => `chap-${unref(id)}`,
    server: true,
    watch: [id],
  })
}

/** 随机抽题 */
export const fetchRandom = async (count = 10, chapter = 'all') => {
  return await $fetch<Mcq[]>('/api/random', { params: { count, chapter } })
}

/** 批量取题(错题本) */
export const fetchQuestions = async (ids: string[]) => {
  if (!ids.length) return []
  return await $fetch<Mcq[]>('/api/questions', { params: { ids: ids.join(',') } })
}
