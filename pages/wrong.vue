<template>
  <div>
    <div class="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <div class="overline text-err mb-1.5 inline-flex items-center gap-1.5">
          <Icon name="lucide:alert-circle" class="w-3 h-3" />
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
          <Icon name="lucide:play" class="w-3.5 h-3.5" />
          错题练习
        </NuxtLink>
        <button class="btn btn--outline btn--sm" @click="clearAll">
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
          清空
        </button>
      </div>
    </div>

    <div v-if="pending" class="space-y-3">
      <SkeletonCard v-for="i in 3" :key="i" :lines="4" />
    </div>
    <div v-else-if="!wrongIds.length" class="card">
      <EmptyState
        icon="party-popper"
        title="暂无错题"
        desc="目前没有需要复习的错题,继续保持!"
        tone="ok"
      >
        <template #action>
          <NuxtLink class="btn" to="/practice/sequential?ch=all">
            <Icon name="lucide:play" class="w-4 h-4" />
            继续练习
          </NuxtLink>
        </template>
      </EmptyState>
    </div>
    <div v-else class="space-y-3.5">
      <div v-for="q in questions" :key="q.id" class="wrong-card">
        <div class="flex items-center gap-2 mb-3">
          <span class="tag tag--brand">
            <Icon name="lucide:bookmark" class="w-3 h-3" />
            {{ chapterLabel(q.chapterId) }}
          </span>
          <span class="tag">第 {{ q.no }} 题</span>
          <button
            class="btn btn--ghost btn--sm ml-auto"
            @click="remove(q.id)"
            title="从错题本移除"
          >
            <Icon name="lucide:x" class="w-3.5 h-3.5" />
            移除
          </button>
        </div>

        <div class="text-[15px] leading-relaxed mb-3">{{ q.stem }}</div>

        <div class="space-y-1.5 mb-3">
          <div
            v-for="k in (['A','B','C','D'] as const)"
            :key="k"
            class="flex items-start gap-2.5 px-3 py-2 rounded-lg text-[14px]"
            :class="optionClass(q, k)"
          >
            <span class="w-6 h-6 rounded-full grid place-items-center font-bold text-[12px] shrink-0 surface-2">
              {{ k }}
            </span>
            <span class="flex-1 leading-relaxed">{{ q.options[k] }}</span>
            <Icon
              v-if="k === q.answer"
              name="lucide:check-circle-2"
              class="w-4 h-4 text-ok shrink-0 mt-0.5"
            />
            <Icon
              v-else-if="store.history[q.id]?.picked === k"
              name="lucide:x-circle"
              class="w-4 h-4 text-err shrink-0 mt-0.5"
            />
          </div>
        </div>

        <div v-if="q.explain" class="explain-box">
          <div class="explain-box__title text-brand">
            <Icon name="lucide:sparkles" class="w-4 h-4" />
            答案解析
          </div>
          <div class="text-mute leading-relaxed">{{ q.explain }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Letter, Mcq } from '~/types/bank'

const store = useQuizStore()
const wrongIds = computed(() => Object.keys(store.wrong))

const pending = ref(true)
const questions = ref<Mcq[]>([])

async function loadQuestions() {
  pending.value = true
  questions.value = await fetchQuestions(wrongIds.value)
  pending.value = false
}

watch(wrongIds, loadQuestions, { immediate: true })

function chapterLabel(id?: string) {
  if (!id) return '—'
  if (id === 'ch00') return '导论'
  return `第 ${id.replace(/^ch_/, '')} 章`
}

function optionClass(q: Mcq, k: Letter): string {
  if (k === q.answer) return '!surface-2 ring-1 ring-ok/30 text-ok'
  if (store.history[q.id]?.picked === k) return '!surface-2 ring-1 ring-err/30 text-err'
  return 'text-mute'
}

function remove(id: string) {
  store.removeWrong(id)
}
function clearAll() {
  if (confirm('确定清空所有错题?')) store.clearWrong()
}

useHead({ title: '错题本' })
</script>

<style scoped>
.ring-ok\/30 { box-shadow: inset 0 0 0 1px rgba(16, 185, 129, .25); }
.ring-err\/30 { box-shadow: inset 0 0 0 1px rgba(239, 68, 68, .25); }
</style>
