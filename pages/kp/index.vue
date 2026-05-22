<template>
  <div>
    <div class="mb-5">
      <div class="overline mb-1.5 inline-flex items-center gap-1.5" style="color: var(--fg-mute);">
        <Icon name="lucide:book-marked" class="w-3 h-3" aria-hidden="true" />
        知识点速览
      </div>
      <h1 class="text-h1 m-0">知识点目录</h1>
      <p class="section-sub mt-1.5">
        提炼《习近平新时代中国特色社会主义思想概论》重点,按章节组织知识结构。
      </p>
    </div>

    <div v-if="!chaptersWithKp.length" class="card">
      <EmptyState icon="book-open" title="暂无知识点" tone="mute" />
    </div>
    <div v-else class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <ChapterCard
        v-for="ch in chaptersWithKp"
        :key="ch.id"
        :chap="ch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const meta = useBankMeta()
const chaptersWithKp = computed(() =>
  meta.data.value.chapters.filter(c => c.kpCount > 0)
)
useHead({ title: '知识点速览' })
</script>
