<template>
  <div>
    <div class="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <div class="overline mb-1.5 inline-flex items-center gap-1.5" style="color: var(--err);">
          <Icon name="lucide:alert-circle" class="w-3 h-3" aria-hidden="true" />
          错题本
        </div>
        <h1 class="text-h1 m-0 inline-flex items-center gap-2.5">
          错题本
          <span v-if="wrongIds.length" class="tag tag--err text-[13px]">
            {{ wrongIds.length }} 题
          </span>
        </h1>
        <p class="section-sub mt-1.5">回顾错题,再次答对自动从错题本移除。</p>
      </div>
      <div v-if="wrongIds.length" class="flex gap-2">
        <NuxtLink to="/practice/wrong" class="btn btn--sm">
          <Icon name="lucide:play" class="w-3.5 h-3.5" aria-hidden="true" />
          错题练习
        </NuxtLink>
        <button class="btn btn--outline btn--sm" @click="onClearAll">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" aria-hidden="true" />
          清空
        </button>
      </div>
    </div>

    <!-- 加载态 -->
    <div v-if="pending" class="space-y-3">
      <SkeletonCard v-for="i in 3" :key="i" :lines="4" />
    </div>

    <!-- 空态 -->
    <div v-else-if="!wrongIds.length" class="card">
      <EmptyState
        icon="party-popper"
        title="暂无错题"
        desc="目前没有需要复习的错题,继续保持!"
        tone="ok"
      >
        <template #action>
          <NuxtLink class="btn" to="/practice/sequential?ch=all">
            <Icon name="lucide:play" class="w-4 h-4" aria-hidden="true" />
            继续练习
          </NuxtLink>
        </template>
      </EmptyState>
    </div>

    <!-- 错题列表 -->
    <div v-else class="space-y-3.5">
      <div
        v-for="q in questions"
        :key="q.id"
        class="wrong-card"
      >
        <!-- 题头:章节标签 + 移除按钮 -->
        <div class="flex items-center gap-2 mb-3">
          <span class="tag tag--brand">
            <Icon name="lucide:bookmark" class="w-3 h-3" aria-hidden="true" />
            {{ chapterLabelForQuestion(q) }}
          </span>
          <span class="tag">第 {{ q.no }} 题</span>
          <div class="flex-1" />
          <button
            class="btn btn--ghost btn--sm"
            @click="remove(q.id)"
            :title="`移除: ${q.stem.substring(0, 20)}...`"
          >
            <Icon name="lucide:x" class="w-3.5 h-3.5" aria-hidden="true" />
            移除
          </button>
        </div>

        <!-- 题目:复用 QuestionCard 只读态 -->
        <QuestionCard
          :q="q"
          :picked="userPickedFor(q)"
          :revealed="true"
          :readonly="true"
          class="mb-0"
          @pick="() => {}"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mcq } from '~/types/bank'

const store = useQuizStore()
const wrongIds = computed(() => Object.keys(store.wrong))
const pending = ref(true)
const questions = ref<Mcq[]>([])

const { chapterLabel } = useChapterLabel()
const { confirm } = useConfirm()

// 找章节信息(用于章节标签)
const bank = useBank()
function chapterLabelForQuestion(q: Mcq): string {
  const cid = q.chapterId || ''
  const c = bank.data.value.chapters.find(c => c.id === cid)
  if (c) return chapterLabel(c)
  if (cid === 'ch00' || cid === 'ch_导') return '导论'
  return cid
}

// 用户在该题的作答记录
function userPickedFor(q: Mcq) {
  return store.history[q.id]?.picked ?? null
}

async function loadQuestions() {
  pending.value = true
  try {
    questions.value = await fetchQuestions(wrongIds.value)
  } catch {
    questions.value = []
  }
  pending.value = false
}

watch(wrongIds, loadQuestions, { immediate: true })

function remove(id: string) {
  store.removeWrong(id)
}

async function onClearAll() {
  const ok = await confirm({
    title: '确定清空所有错题?',
    description: '此操作不可撤销,所有错题记录将被清除。',
    confirmText: '清空',
    danger: true,
  })
  if (ok) store.clearWrong()
}

useHead({ title: '错题本' })
</script>
