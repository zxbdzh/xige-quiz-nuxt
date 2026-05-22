<template>
  <div class="chap-card group">
    <div class="flex items-start justify-between gap-2">
      <div class="overline text-brand inline-flex items-center gap-1.5">
        <span class="w-1 h-1 rounded-full" style="background: var(--brand);" />
        {{ chapterLabel(chap) }}
      </div>
      <ClientOnly>
        <span
          v-if="stats && stats.done"
          class="tag tag--ok shrink-0"
          :title="`已完成 ${stats.done} / ${stats.total}`"
        >
          <Icon name="lucide:check" class="w-3 h-3" aria-hidden="true" />
          {{ stats.accuracy }}%
        </span>
        <template #fallback />
      </ClientOnly>
    </div>

    <h3 class="text-[15px] font-semibold m-0 leading-snug line-clamp-2 min-h-[42px]">
      {{ chap.title }}
    </h3>

    <div class="flex items-center gap-3 text-caption text-mute">
      <span v-if="chap.mcqCount" class="inline-flex items-center gap-1">
        <Icon name="lucide:file-text" class="w-3.5 h-3.5" aria-hidden="true" />
        {{ chap.mcqCount }} 题
      </span>
      <span v-if="chap.kpCount" class="inline-flex items-center gap-1">
        <Icon name="lucide:book-open" class="w-3.5 h-3.5" aria-hidden="true" />
        {{ chap.kpCount }} 知识点
      </span>
      <ClientOnly>
        <span v-if="stats && stats.done" class="inline-flex items-center gap-1 ml-auto text-faint">
          {{ stats.done }}/{{ stats.total }}
        </span>
        <template #fallback />
      </ClientOnly>
    </div>

    <ClientOnly>
      <UiProgress
        :value="stats?.done ?? 0"
        :max="stats?.total ?? 1"
        class="mt-1"
      />
      <template #fallback>
        <div class="h-1.5 rounded-full" style="background: var(--bg-elev-2);" />
      </template>
    </ClientOnly>

    <div class="flex gap-2 mt-auto pt-1">
      <NuxtLink
        v-if="chap.mcqCount"
        :to="`/practice/sequential?ch=${encodeURIComponent(chap.id)}`"
        class="btn btn--sm flex-1"
      >
        <Icon name="lucide:play" class="w-3.5 h-3.5" aria-hidden="true" />
        练习
      </NuxtLink>
      <NuxtLink
        v-if="chap.kpCount"
        :to="`/kp/${chap.id}`"
        class="btn btn--ghost btn--sm flex-1"
      >
        <Icon name="lucide:book-open" class="w-3.5 h-3.5" aria-hidden="true" />
        速览
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChapterSummary } from '~/types/bank'

const props = defineProps<{
  chap: ChapterSummary
  stats?: { done: number; total: number; correct: number; accuracy: number }
}>()

const { chapterLabel } = useChapterLabel()
</script>
