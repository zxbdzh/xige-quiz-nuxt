<template>
  <div>
    <!-- 工具条 -->
    <div class="flex items-center gap-2 flex-wrap mb-4">
      <NuxtLink to="/" class="btn btn--outline btn--sm">
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
        退出
      </NuxtLink>
      <span class="tag tag--brand">
        <Icon name="lucide:bookmark" class="w-3 h-3" />
        {{ chapName }}
      </span>
      <span class="tag tag--accent">
        <Icon :name="`lucide:${modeIcon}`" class="w-3 h-3" />
        {{ modeName }}
      </span>
      <div class="flex-1 min-w-[120px]" />
      <span class="text-caption text-mute tabular-nums">{{ idx + 1 }} / {{ total || '—' }}</span>
    </div>
    <div class="progress mb-5"><div class="progress__bar" :style="{ width: pct + '%' }" /></div>

    <!-- 完成态 -->
    <div v-if="finished" class="card text-center !py-12">
      <div class="flex justify-center mb-4">
        <ProgressRing
          :percent="doneAcc"
          :size="140"
          :stroke-width="10"
          from-color="#2563EB"
          to-color="#06B6D4"
          track-color="var(--bg-elev-2)"
          label-color="var(--fg)"
          label="正确率"
        />
      </div>
      <h1 class="text-h1 m-0">本组练习完成</h1>
      <p class="text-mute mt-2 mb-6">
        共 {{ total }} 题 · 正确 {{ doneCorrect }} / {{ doneTotal }}
      </p>
      <div class="flex gap-2.5 justify-center flex-wrap">
        <button class="btn" @click="restart">
          <Icon name="lucide:refresh-cw" class="w-4 h-4" />
          再来一组
        </button>
        <NuxtLink class="btn btn--outline" to="/">
          <Icon name="lucide:home" class="w-4 h-4" />
          返回首页
        </NuxtLink>
        <NuxtLink v-if="store.overall.wrong" class="btn btn--ghost" to="/wrong">
          <Icon name="lucide:alert-circle" class="w-4 h-4" />
          查看错题本
        </NuxtLink>
      </div>
    </div>

    <!-- 加载中 -->
    <SkeletonCard v-else-if="loading" :lines="4" />

    <!-- 没有题目 -->
    <div v-else-if="!q" class="card">
      <EmptyState
        :icon="mode === 'wrong' ? 'party-popper' : 'inbox'"
        :title="mode === 'wrong' ? '你已经没有错题了' : '暂无题目'"
        :desc="mode === 'wrong' ? '继续保持,把状态维持下去!' : '换个章节试试看吧。'"
        :tone="mode === 'wrong' ? 'ok' : 'mute'"
      >
        <template #action>
          <NuxtLink class="btn" to="/">
            <Icon name="lucide:home" class="w-4 h-4" />
            返回首页
          </NuxtLink>
        </template>
      </EmptyState>
    </div>

    <!-- 答题 -->
    <div v-else>
      <QuestionCard :q="q" :picked="picked" :revealed="revealed" @pick="onPick" />
      <div class="flex gap-2 mt-4 flex-wrap">
        <button class="btn btn--outline btn--sm" :disabled="idx === 0" @click="prev">
          <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
          上一题
        </button>
        <button class="btn btn--ghost btn--sm" @click="toggleMark">
          <Icon :name="marked ? 'lucide:star' : 'lucide:star-off'" class="w-3.5 h-3.5"
                :style="marked ? 'color: var(--warn)' : ''" />
          {{ marked ? '已收藏' : '收藏' }}
        </button>
        <div class="flex-1" />
        <button class="btn btn--ghost btn--sm" @click="next">
          跳过
          <Icon name="lucide:skip-forward" class="w-3.5 h-3.5" />
        </button>
        <button class="btn btn--sm" :disabled="!revealed" @click="next">
          下一题
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- 键盘提示 -->
      <div class="hidden md:flex items-center justify-center gap-3 mt-5 text-[11px] text-faint">
        <span class="inline-flex items-center gap-1">
          <kbd class="kbd">A</kbd> <kbd class="kbd">B</kbd> <kbd class="kbd">C</kbd> <kbd class="kbd">D</kbd>
          选答
        </span>
        <span class="inline-flex items-center gap-1">
          <kbd class="kbd">←</kbd> 上一题
        </span>
        <span class="inline-flex items-center gap-1">
          <kbd class="kbd">→</kbd> / <kbd class="kbd">Enter</kbd> 下一题
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bank, Letter, Mcq } from '~/types/bank'

const route = useRoute()
const store = useQuizStore()

const mode = computed(() => String(route.params.mode || 'sequential'))
const chapId = computed(() =>
  String(route.query.ch || (mode.value === 'wrong' ? 'wrong' : 'all'))
)

const { data: bank } = await useFetch<Bank>('/api/bank', { key: 'bank' })

const queue = ref<Mcq[]>([])
const idx = ref(0)
const picked = ref<Letter | null>(null)
const revealed = ref(false)
const marked = ref(false)
const finished = ref(false)
const loading = ref(true)

const q = computed<Mcq | undefined>(() => queue.value[idx.value])
const total = computed(() => queue.value.length)
const pct = computed(() => (total.value ? Math.round(((idx.value + 1) / total.value) * 100) : 0))

const modeName = computed(
  () => (({ sequential: '顺序', random: '随机', wrong: '错题' } as Record<string, string>)[mode.value] || mode.value)
)
const modeIcon = computed(
  () => (({ sequential: 'list-ordered', random: 'shuffle', wrong: 'repeat' } as Record<string, string>)[mode.value] || 'play')
)
const chapName = computed(() => {
  if (chapId.value === 'all') return '全部题目'
  if (mode.value === 'wrong' || chapId.value === 'wrong') return '错题复习'
  const c = bank.value?.chapters.find((c) => c.id === chapId.value)
  return c?.title || chapId.value
})

const doneCorrect = ref(0)
const doneTotal = ref(0)
const doneAcc = computed(() => (doneTotal.value ? Math.round((doneCorrect.value / doneTotal.value) * 100) : 0))

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function buildQueue() {
  loading.value = true
  let pool: Mcq[] = []
  if (mode.value === 'wrong' || chapId.value === 'wrong') {
    const ids = Object.keys(store.wrong)
    if (ids.length) pool = await fetchQuestions(ids)
  } else if (chapId.value === 'all') {
    pool = (bank.value?.chapters || []).flatMap((c) => c.mcq)
  } else {
    const c = (bank.value?.chapters || []).find((c) => c.id === chapId.value)
    pool = c ? c.mcq.slice() : []
  }
  if (mode.value === 'random') pool = shuffle(pool)
  queue.value = pool
  idx.value = 0
  picked.value = null
  revealed.value = false
  finished.value = false
  loading.value = false
  syncMarked()
}

function syncMarked() {
  marked.value = !!(q.value && store.mark[q.value.id])
}
function onPick(letter: Letter) {
  if (!q.value || revealed.value) return
  picked.value = letter
  revealed.value = true
  store.record(q.value.id, letter, q.value.answer)
}
function next() {
  if (idx.value + 1 >= total.value) return finish()
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
function toggleMark() {
  if (!q.value) return
  store.toggleMark(q.value.id)
  syncMarked()
}
function finish() {
  finished.value = true
  let ok = 0
  let tot = 0
  for (const item of queue.value) {
    const h = store.history[item.id]
    if (h) {
      tot++
      if (h.correct) ok++
    }
  }
  doneCorrect.value = ok
  doneTotal.value = tot
}
function restart() {
  finished.value = false
  buildQueue()
}

function onKey(e: KeyboardEvent) {
  if (finished.value || !q.value) return
  const k = e.key.toUpperCase()
  if (['A', 'B', 'C', 'D'].includes(k)) {
    e.preventDefault()
    onPick(k as Letter)
  } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
    if (revealed.value) next()
  } else if (e.key === 'ArrowLeft') {
    prev()
  }
}

watch([mode, chapId], () => {
  finished.value = false
  buildQueue()
})

onMounted(() => {
  buildQueue()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})

useHead({ title: () => `${modeName.value}练习 · ${chapName.value}` })
</script>

<style scoped>
.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  background: var(--bg-elev);
  color: var(--fg-mute);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1;
  box-shadow: 0 1px 0 var(--line-strong);
}
</style>
