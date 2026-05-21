<template>
  <div class="card !p-6 sm:!p-7">
    <div class="flex items-center gap-2 mb-4">
      <span class="tag tag--brand">
        <Icon name="lucide:bookmark" class="w-3 h-3" />
        {{ chapterLabel }}
      </span>
      <span class="tag">第 {{ q.no }} 题</span>
      <span class="overline text-faint ml-auto select-none">单选题</span>
    </div>

    <div class="text-[17px] leading-[1.7] font-medium mb-6">{{ q.stem }}</div>

    <div class="flex flex-col gap-2.5">
      <button
        v-for="k in (['A', 'B', 'C', 'D'] as const)"
        :key="k"
        type="button"
        class="q-option"
        :class="optionClass(k)"
        :disabled="revealed"
        @click="onPick(k)"
      >
        <span class="q-option__key">{{ k }}</span>
        <span class="q-option__body">{{ q.options[k] }}</span>
        <Icon
          v-if="revealed && k === q.answer"
          name="lucide:check-circle-2"
          class="q-option__icon w-5 h-5"
        />
        <Icon
          v-else-if="revealed && k === picked && k !== q.answer"
          name="lucide:x-circle"
          class="q-option__icon w-5 h-5"
        />
      </button>
    </div>

    <Transition name="explain">
      <div v-if="revealed" class="explain-box mt-6">
        <h4 class="explain-box__title" :class="isCorrect ? 'text-ok' : 'text-err'">
          <Icon
            :name="isCorrect ? 'lucide:check-circle-2' : 'lucide:x-circle'"
            class="w-4 h-4"
          />
          {{ isCorrect ? '回答正确' : '回答错误' }}
          <span class="text-mute font-normal ml-2">
            · 参考答案 {{ q.answer }}. {{ q.options[q.answer] }}
          </span>
        </h4>
        <div class="flex items-start gap-2 text-mute leading-relaxed">
          <Icon name="lucide:sparkles" class="w-4 h-4 mt-0.5 shrink-0 text-brand" />
          <span>{{ q.explain || '暂无解析' }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Letter, Mcq } from '~/types/bank'

const props = defineProps<{
  q: Mcq
  picked: Letter | null
  revealed: boolean
}>()
const emit = defineEmits<{
  (e: 'pick', letter: Letter): void
}>()

const isCorrect = computed(() => props.picked === props.q.answer)

const chapterLabel = computed(() => {
  const id = props.q.chapterId || ''
  if (id === 'ch00') return '导论'
  return `第 ${id.replace(/^ch_/, '')} 章`
})

function onPick(k: Letter) {
  if (props.revealed) return
  emit('pick', k)
}

function optionClass(k: Letter): string {
  if (!props.revealed) return props.picked === k ? 'q-option--picked' : ''
  if (k === props.q.answer) return 'q-option--correct q-option--reveal-correct'
  if (k === props.picked) return 'q-option--wrong'
  return ''
}
</script>

<style scoped>
.explain-enter-active,
.explain-leave-active {
  transition: opacity .2s ease, transform .2s ease, max-height .25s ease;
  overflow: hidden;
}
.explain-enter-from,
.explain-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
.explain-enter-to,
.explain-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
