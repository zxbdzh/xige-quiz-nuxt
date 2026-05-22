import type { Chapter, ChapterSummary } from '~/types/bank'

/**
 * 全站唯一章节标签真源
 * 导论(ch00) no=-1,其余章 no=1~17
 */
export function useChapterLabel() {
  /** 完整标签:导论 / 第 N 章 */
  function chapterLabel(ch: { id: string; no: number }): string {
    return ch.no < 1 ? '导论' : `第 ${ch.no} 章`
  }

  /** 短标签:导 / N(用于 stats 等空间有限场景) */
  function chapterShort(ch: { id: string; no: number }): string {
    return ch.no < 1 ? '导' : String(ch.no)
  }

  /** 序号文本:一 / 1(用于知识点锚点) */
  function chapterSeq(no: number): string {
    if (no < 1) return '0'
    if (no <= 17) return String(no)
    return String(no)
  }

  return { chapterLabel, chapterShort, chapterSeq }
}
