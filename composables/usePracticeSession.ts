import type { Mcq, Letter } from '~/types/bank'

interface SessionRecord {
  correct: boolean
}

export function usePracticeSession() {
  const queue = ref<Mcq[]>([])
  const idx = ref(0)
  const picked = ref<Letter | null>(null)
  const revealed = ref(false)
  const marked = ref(false)
  const finished = ref(false)
  const loading = ref(true)

  // 本组本次作答记录(仅本次,修复完成页正确率口径)
  const sessionRecords = ref<Map<string, SessionRecord>>(new Map())

  const q = computed<Mcq | undefined>(() => queue.value[idx.value])
  const total = computed(() => queue.value.length)
  const pct = computed(() => (total.value ? Math.round(((idx.value + 1) / total.value) * 100) : 0))

  // 完成统计:只统计本组本次
  const doneCorrect = computed(() => {
    let ok = 0
    for (const rec of sessionRecords.value.values()) {
      if (rec.correct) ok++
    }
    return ok
  })
  const doneTotal = computed(() => sessionRecords.value.size)
  const doneAcc = computed(() => (doneTotal.value ? Math.round((doneCorrect.value / doneTotal.value) * 100) : 0))

  function onPick(letter: Letter, correctAns: Letter) {
    if (!q.value || revealed.value) return
    picked.value = letter
    revealed.value = true
    const correct = letter === correctAns
    // 记录到本组会话
    sessionRecords.value.set(q.value.id, { correct })
  }

  function next() {
    if (idx.value + 1 >= total.value) {
      finished.value = true
      return
    }
    idx.value++
    picked.value = null
    revealed.value = false
    syncMarked()
  }

  function prev() {
    if (idx.value === 0) return
    idx.value--
    picked.value = null
    revealed.value = false
    syncMarked()
  }

  function toggleMark(markRecord: Record<string, true | undefined>, qid: string) {
    marked.value = !!markRecord[qid]
  }

  function syncMarked() {
    // 由调用方传入 mark 状态,这里只设置 marked ref
  }

  function finish() {
    finished.value = true
  }

  function restart() {
    finished.value = false
    sessionRecords.value.clear()
  }

  function reset() {
    queue.value = []
    idx.value = 0
    picked.value = null
    revealed.value = false
    marked.value = false
    finished.value = false
    loading.value = true
    sessionRecords.value.clear()
  }

  return {
    queue,
    idx,
    picked,
    revealed,
    marked,
    finished,
    loading,
    sessionRecords,
    q,
    total,
    pct,
    doneCorrect,
    doneTotal,
    doneAcc,
    onPick,
    next,
    prev,
    toggleMark,
    syncMarked,
    finish,
    restart,
    reset,
  }
}
