import { defineStore } from 'pinia'
import type { AnswerRecord, Chapter, Letter } from '~/types/bank'

type Theme = 'light' | 'dark'

interface SessionState {
  key: string   // mode+chap
  idx: number
  total: number
}

export interface RemoteSnapshot {
  history: Record<string, AnswerRecord>
  wrong: Record<string, true>
  mark: Record<string, true>
  updatedAt: number
}

interface State {
  history: Record<string, AnswerRecord>
  wrong: Record<string, true>
  mark: Record<string, true>
  session: SessionState | null
  theme: Theme
  /** 本地数据最近一次变更的时间戳 */
  updatedAt: number
  /** 上次成功同步到云端的 updatedAt(用于判断是否需要 push) */
  cloudUpdatedAt: number
}

function touch(this: { updatedAt: number }) {
  this.updatedAt = Date.now()
}

export const useQuizStore = defineStore('quiz', {
  state: (): State => ({
    history: {},
    wrong: {},
    mark: {},
    session: null,
    theme: 'light',
    updatedAt: 0,
    cloudUpdatedAt: 0,
  }),
  getters: {
    overall(state) {
      const ids = Object.keys(state.history)
      const done = ids.length
      const correct = ids.reduce((n, id) => n + (state.history[id].correct ? 1 : 0), 0)
      return {
        done,
        correct,
        accuracy: done ? Math.round((correct / done) * 100) : 0,
        wrong: Object.keys(state.wrong).length,
      }
    },
    /** 本地是否有未同步到云端的变更 */
    isDirty(state): boolean {
      return state.updatedAt > state.cloudUpdatedAt
    },
  },
  actions: {
    record(qid: string, picked: Letter, correctAns: Letter) {
      const correct = picked === correctAns
      this.history[qid] = { ts: Date.now(), picked, correct }
      if (!correct) this.wrong[qid] = true
      else delete this.wrong[qid]
      touch.call(this)
    },
    toggleMark(qid: string) {
      if (this.mark[qid]) delete this.mark[qid]
      else this.mark[qid] = true
      touch.call(this)
    },
    removeWrong(qid: string) {
      delete this.wrong[qid]
      touch.call(this)
    },
    clearWrong() {
      this.wrong = {}
      touch.call(this)
    },
    setSession(s: SessionState | null) {
      this.session = s
    },
    setTheme(t: Theme) {
      this.theme = t
      if (import.meta.client) {
        document.documentElement.classList.toggle('dark', t === 'dark')
      }
      touch.call(this)
    },
    chapStats(chap: Chapter) {
      let done = 0
      let correct = 0
      for (const q of chap.mcq) {
        const h = this.history[q.id]
        if (h) {
          done++
          if (h.correct) correct++
        }
      }
      return {
        done,
        total: chap.mcq.length,
        correct,
        accuracy: done ? Math.round((correct / done) * 100) : 0,
      }
    },

    /** 全量替换状态(从 JSON 文件导入) */
    importState(s: Partial<State>) {
      if (s.history) this.history = s.history
      if (s.wrong) this.wrong = s.wrong
      if (s.mark) this.mark = s.mark
      if (s.theme) this.setTheme(s.theme)
      touch.call(this)
    },

    /** 全量覆盖,用于首次登录且本地无数据 */
    applyFromCloud(remote: RemoteSnapshot) {
      this.history = { ...remote.history }
      this.wrong = { ...remote.wrong }
      this.mark = { ...remote.mark }
      this.updatedAt = remote.updatedAt
      this.cloudUpdatedAt = remote.updatedAt
    },

    /**
     * Per-record 合并云端 → 本地:
     * - history: 每个 qid 取 ts 较新的一条
     * - wrong / mark: 并集
     * 合并后 updatedAt 用 max(local, remote)
     */
    mergeFromCloud(remote: RemoteSnapshot) {
      const mergedHistory: Record<string, AnswerRecord> = { ...this.history }
      for (const [qid, rec] of Object.entries(remote.history || {})) {
        const local = mergedHistory[qid]
        if (!local || (rec.ts || 0) > (local.ts || 0)) {
          mergedHistory[qid] = rec
        }
      }
      this.history = mergedHistory

      // wrong / mark 取并集
      this.wrong = { ...this.wrong, ...(remote.wrong || {}) }
      this.mark = { ...this.mark, ...(remote.mark || {}) }

      this.updatedAt = Math.max(this.updatedAt, remote.updatedAt || 0)
    },

    /** 标记最近一次成功 push 到云端 */
    markSynced(serverTs: number) {
      this.cloudUpdatedAt = serverTs
    },

    resetAll() {
      this.history = {}
      this.wrong = {}
      this.mark = {}
      this.session = null
      touch.call(this)
    },
  },
  persist: {
    key: 'xige-quiz:v2',
    pick: ['history', 'wrong', 'mark', 'theme', 'updatedAt', 'cloudUpdatedAt'],
  },
})
