<template>
  <div>
    <!-- 工具条 -->
    <div class="flex items-center gap-2 flex-wrap mb-4">
      <NuxtLink to="/" class="btn btn--outline btn--sm">
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" aria-hidden="true" />
        退出
      </NuxtLink>
      <span class="tag tag--brand">
        <Icon name="lucide:bookmark" class="w-3 h-3" aria-hidden="true" />
        {{ chapName }}
      </span>
      <span class="tag">
        <Icon :name="`lucide:${modeIcon}`" class="w-3 h-3" aria-hidden="true" />
        {{ modeName }}
      </span>
      <div class="flex-1 min-w-[120px]" />
      <span class="text-caption text-mute tabular-nums">
        {{ idx + 1 }} / {{ total || '—' }}
      </span>
    </div>

    <!-- 进度条(ARIA) -->
    <UiProgress
      :value="idx + 1"
      :max="total || 1"
      show-label
      class="mb-5"
    />

    <!-- 完成态 -->
    <div v-if="finished" class="card text-center !py-12">
      <div class="flex justify-center mb-4">
        <UiProgressRing
          :percent="doneAcc"
          :size="140"
          :stroke-width="8"
          from-color="var(--brand)"
          label-color="var(--fg)"
        />
      </div>
      <h1 class="text-h1 m-0">本组练习完成</h1>
      <p class="text-mute mt-2 mb-6">
        共 {{ total }} 题 · 正确 {{ doneCorrect }} / {{ doneTotal }}
      </p>
      <div class="flex gap-2.5 justify-center flex-wrap">
        <button class="btn" @click="restart">
          <Icon name="lucide:refresh-cw" class="w-4 h-4" aria-hidden="true" />
          再来一组
        </button>
        <NuxtLink class="btn btn--outline" to="/">
          <Icon name="lucide:home" class="w-4 h-4" aria-hidden="true" />
          返回首页
        </NuxtLink>
        <NuxtLink v-if="store.overall.wrong" class="btn btn--ghost" to="/wrong">
          <Icon name="lucide:alert-circle" class="w-4 h-4" aria-hidden="true" />
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
            <Icon name="lucide:home" class="w-4 h-4" aria-hidden="true" />
            返回首页
          </NuxtLink>
        </template>
      </EmptyState>
    </div>

    <!-- 答题 -->
    <div v-else>
      <QuestionCard
        :q="q"
        :picked="picked"
        :revealed="revealed"
        @pick="handlePick"
      />
      <div class="flex gap-2 mt-4 flex-wrap">
        <button
          class="btn btn--outline btn--sm"
          :disabled="idx === 0"
          @click="prev"
        >
          <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" aria-hidden="true" />
          上一题
        </button>
        <button class="btn btn--ghost btn--sm" @click="toggleMarkFn">
          <Icon
            :name="isMarked ? 'lucide:star' : 'lucide:star-off'"
            class="w-3.5 h-3.5"
            :style="isMarked ? 'color: var(--warn);' : ''"
            aria-hidden="true"
          />
          {{ isMarked ? '已收藏' : '收藏' }}
        </button>
        <div class="flex-1" />
        <button class="btn btn--ghost btn--sm" @click="skip">
          跳过
          <Icon name="lucide:skip-forward" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button class="btn btn--sm" :disabled="!revealed" @click="next">
          {{ idx + 1 >= total ? '完成' : '下一题' }}
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <!-- 键盘提示 -->
      <div class="hidden md:flex items-center justify-center gap-3 mt-5 text-[11px] text-faint" aria-label="键盘快捷键">
        <span class="inline-flex items-center gap-1">
          <kbd class="kbd">A</kbd><kbd class="kbd">B</kbd><kbd class="kbd">C</kbd><kbd class="kbd">D</kbd> 选答
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
import { fetchRandom, fetchQuestions } from '~/composables/useBank'

const route = useRoute()
const store = useQuizStore()
const bank = useBank()

const mode = computed(() => String(route.params.mode || 'sequential'))
const chapId = computed(() =>
  String(route.query.ch || (mode.value === 'wrong' ? 'wrong' : 'all'))
)

// 章节名
const { chapterLabel } = useChapterLabel()
const chapName = computed(() => {
  if (chapId.value === 'all') return '全部题目'
  if (mode.value === 'wrong' || chapId.value === 'wrong') return '错题复习'
  const c = bank.data.value.chapters.find(c => c.id === chapId.value)
  if (!c) return chapId.value
  return chapterLabel(c) + ' · ' + c.title
})

// 状态机
const {
  queue, idx, picked, revealed, marked, finished, loading,
  doneCorrect, doneTotal, doneAcc,
  onPick, next, prev, restart, reset,
} = usePracticeSession()

const total = computed(() => queue.value.length)

// 当前题
const q = computed(() => queue.value[idx.value])

// 收藏状态
const isMarked = computed(() => !!(q.value && store.mark[q.value.id]))
function toggleMarkFn() {
  if (!q.value) return
  store.toggleMark(q.value.id)
}

// 选答
function handlePick(letter: import('~/types/bank').Letter) {
  if (!q.value || revealed.value) return
  store.record(q.value.id, letter, q.value.answer)
  onPick(letter, q.value.answer)
}

// 跳过(不计入会话记录)
function skip() {
  next()
}

// 重新开始
function doRestart() {
  reset()
  buildQueue()
}

// 构建题组
async function buildQueue() {
  loading.value = true
  let pool: import('~/types/bank').Mcq[] = []

  try {
    if (mode.value === 'wrong' || chapId.value === 'wrong') {
      const ids = Object.keys(store.wrong)
      if (ids.length) {
        pool = await fetchQuestions(ids)
      }
    } else if (chapId.value === 'all') {
      if (mode.value === 'random') {
        pool = await fetchRandom(20, 'all')
      } else {
        pool = (bank.data.value.chapters || []).flatMap(c => c.mcq)
      }
    } else {
      const c = (bank.data.value.chapters || []).find(c => c.id === chapId.value)
      if (c) {
        if (mode.value === 'random') {
          pool = await fetchRandom(Math.min(c.mcq.length, 20), c.id)
        } else {
          pool = c.mcq.slice()
        }
      }
    }
  } catch (err) {
    console.error('[practice] buildQueue failed:', err)
    pool = []
  }

  queue.value = pool
  loading.value = false
}

// 键盘操作
function onKey(e: KeyboardEvent) {
  if (finished.value || !q.value || revealed.value) return
  const k = e.key.toUpperCase()
  if (['A', 'B', 'C', 'D'].includes(k)) {
    e.preventDefault()
    handlePick(k as import('~/types/bank').Letter)
  } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
    if (revealed.value) skip()
  } else if (e.key === 'ArrowLeft') {
    prev()
  }
}

watch([mode, chapId], () => {
  reset()
  buildQueue()
})

onMounted(() => {
  buildQueue()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})

const modeName = computed(
  () => ({ sequential: '顺序', random: '随机', wrong: '错题' } as Record<string, string>)[mode.value] || mode.value
)
const modeIcon = computed(
  () => ({ sequential: 'list-ordered', random: 'shuffle', wrong: 'repeat' } as Record<string, string>)[mode.value] || 'play'
)

useHead({ title: () => `${modeName.value}练习 · ${chapName.value}` })
</script>
