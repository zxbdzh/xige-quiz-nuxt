<template>
  <div class="card">
    <!-- 题头 -->
    <div class="flex items-center gap-2 mb-4">
      <span class="tag tag--brand">
        <Icon name="lucide:bookmark" class="w-3 h-3" />
        {{ chapterLabel }}
      </span>
      <span class="tag">第 {{ q.no }} 题</span>
      <span class="overline text-faint ml-auto select-none">单选题</span>
    </div>

    <!-- 题干 -->
    <div class="text-[17px] leading-[1.7] font-medium mb-6">{{ q.stem }}</div>

    <!-- 选项列表 -->
    <div class="flex flex-col gap-2" role="list">
      <button
        v-for="k in (['A', 'B', 'C', 'D'] as const)"
        :key="k"
        type="button"
        class="q-option"
        :class="optionClass(k)"
        :disabled="revealed || readonly"
        :aria-pressed="!revealed && !readonly && picked === k ? 'true' : undefined"
        :aria-label="ariaOptionLabel(k)"
        @click="!readonly && onPick(k)"
      >
        <span class="q-option__key" :aria-hidden="true">{{ k }}</span>
        <span class="q-option__body">{{ q.options[k] }}</span>
        <span v-if="revealed && k === q.answer" class="q-option__icon" aria-hidden="true">
          <Icon name="lucide:check-circle-2" class="w-5 h-5" />
          <span class="sr-only">——正确答案</span>
        </span>
        <span v-else-if="revealed && k === picked && k !== q.answer" class="q-option__icon" aria-hidden="true">
          <Icon name="lucide:x-circle" class="w-5 h-5" />
          <span class="sr-only">——你的选择</span>
        </span>
      </button>
    </div>

    <!-- 解析区 -->
    <Transition name="explain">
      <div v-if="revealed" class="explain-box mt-6" role="region" aria-label="答案解析">
        <h4 class="explain-box__title" :class="isCorrect ? 'text-ok' : 'text-err'">
          <Icon
            :name="isCorrect ? 'lucide:check-circle-2' : 'lucide:x-circle'"
            class="w-4 h-4"
            aria-hidden="true"
          />
          {{ isCorrect ? '回答正确' : '回答错误' }}
          <span class="text-mute font-normal ml-2">
            · 参考答案 {{ q.answer }}. {{ q.options[q.answer] }}
          </span>
        </h4>
        <div class="flex items-start gap-2 text-mute leading-relaxed">
          <Icon name="lucide:sparkles" class="w-4 h-4 mt-0.5 shrink-0 text-brand" aria-hidden="true" />
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
  /** 只读模式(用于错题本展示,不触发 emit) */
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'pick', letter: Letter): void
}>()

const { chapterLabel } = useChapterLabel()

const isCorrect = computed(() => props.picked === props.q.answer)

function onPick(k: Letter) {
  if (props.revealed || props.readonly) return
  emit('pick', k)
}

function optionClass(k: Letter): string {
  if (!props.revealed) return props.picked === k ? 'q-option--picked' : ''
  if (k === props.q.answer) return 'q-option--correct'
  if (k === props.picked) return 'q-option--wrong'
  return ''
}

function ariaOptionLabel(k: Letter): string {
  if (props.revealed) {
    if (k === props.q.answer) return `选项 ${k}: 正确答案`
    if (k === props.picked) return `选项 ${k}: 你的选择 (错误)`
    return `选项 ${k}: 未选择`
  }
  return `选择选项 ${k}: ${props.q.options[k]}`
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.explain-enter-active,
.explain-leave-active {
  transition: opacity .2s ease, max-height .25s ease;
  overflow: hidden;
}
.explain-enter-from,
.explain-leave-to {
  opacity: 0;
  max-height: 0;
}
.explain-enter-to,
.explain-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
