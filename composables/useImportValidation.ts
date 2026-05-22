import type { RemoteSnapshot } from '~/stores/quiz'
import type { Letter } from '~/types/bank'

export interface ValidationResult {
  valid: Partial<RemoteSnapshot>
  errors: string[]
}

/**
 * 导入 JSON 轻校验
 * 校验 history/wrong/mark 的形状，非法字段丢弃而不整体拒绝
 */
export function useImportValidation() {
  function validate(raw: unknown): ValidationResult {
    const errors: string[] = []
    if (!raw || typeof raw !== 'object') {
      return { valid: {}, errors: ['文件格式无效，必须是 JSON 对象'] }
    }

    const obj = raw as Record<string, unknown>
    const valid: Partial<RemoteSnapshot> = {}

    // history
    if (obj.history && typeof obj.history === 'object') {
      const history: Record<string, { ts: number; picked: Letter; correct: boolean }> = {}
      for (const [k, v] of Object.entries(obj.history as object)) {
        const rec = v as Record<string, unknown>
        if (
          rec &&
          typeof rec.ts === 'number' &&
          ['A', 'B', 'C', 'D'].includes(rec.picked as string) &&
          typeof rec.correct === 'boolean'
        ) {
          history[k] = { ts: rec.ts as number, picked: rec.picked as Letter, correct: rec.correct as boolean }
        }
      }
      valid.history = history
    } else {
      valid.history = {}
    }

    // wrong
    if (obj.wrong && typeof obj.wrong === 'object') {
      const wrong: Record<string, true> = {}
      for (const k of Object.keys(obj.wrong as object)) {
        if (k) wrong[k] = true
      }
      valid.wrong = wrong
    } else {
      valid.wrong = {}
    }

    // mark
    if (obj.mark && typeof obj.mark === 'object') {
      const mark: Record<string, true> = {}
      for (const k of Object.keys(obj.mark as object)) {
        if (k) mark[k] = true
      }
      valid.mark = mark
    } else {
      valid.mark = {}
    }

    // updatedAt
    if (typeof obj.updatedAt === 'number') {
      valid.updatedAt = obj.updatedAt
    }

    if (
      Object.keys(valid.history ?? {}).length === 0 &&
      Object.keys(valid.wrong ?? {}).length === 0 &&
      Object.keys(valid.mark ?? {}).length === 0
    ) {
      errors.push('未找到有效的答题记录(history/wrong/mark)')
    }

    return { valid, errors }
  }

  return { validate }
}
