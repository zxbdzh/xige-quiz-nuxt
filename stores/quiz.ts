import { defineStore } from 'pinia'
import type { AnswerRecord, Chapter, Letter } from '~/types/bank'

type Theme = 'light' | 'dark'

interface SessionState {
  key: string   // mode+chap
  idx: number
  total: number
}

interface State {
  history: Record<string, AnswerRecord>
  wrong: Record<string, true>
  mark: Record<string, true>
  session: SessionState | null
  theme: Theme
}

export const useQuizStore = defineStore('quiz', {
  state: (): State => ({
    history: {},
    wrong: {},
    mark: {},
    session: null,
    theme: 'light',
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
  },
  actions: {
    record(qid: string, picked: Letter, correctAns: Letter) {
      const correct = picked === correctAns
      this.history[qid] = { ts: Date.now(), picked, correct }
      if (!correct) this.wrong[qid] = true
      else delete this.wrong[qid]
    },
    toggleMark(qid: string) {
      if (this.mark[qid]) delete this.mark[qid]
      else this.mark[qid] = true
    },
    removeWrong(qid: string) {
      delete this.wrong[qid]
    },
    clearWrong() {
      this.wrong = {}
    },
    setSession(s: SessionState | null) {
      this.session = s
    },
    setTheme(t: Theme) {
      this.theme = t
      if (import.meta.client) {
        document.documentElement.classList.toggle('dark', t === 'dark')
      }
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
    /** 全量替换状态(导入进度) */
    importState(s: Partial<State>) {
      if (s.history) this.history = s.history
      if (s.wrong) this.wrong = s.wrong
      if (s.mark) this.mark = s.mark
      if (s.theme) this.setTheme(s.theme)
    },
    resetAll() {
      this.history = {}
      this.wrong = {}
      this.mark = {}
      this.session = null
    },
  },
  persist: {
    key: 'xige-quiz:v2',
    pick: ['history', 'wrong', 'mark', 'theme'],
  },
})
