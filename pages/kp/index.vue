<template>
  <div>
    <div class="mb-5">
      <div class="overline text-accent mb-1.5 inline-flex items-center gap-1.5">
        <Icon name="lucide:book-marked" class="w-3 h-3" />
        知识点速览
      </div>
      <h1 class="text-h1 m-0">知识点目录</h1>
      <p class="section-sub mt-1.5">
        提炼《2025习概重点笔记》主观题部分,按章节组织知识结构。
      </p>
    </div>

    <div v-if="!chaptersWithKp.length" class="card">
      <EmptyState icon="book-open" title="暂无知识点" tone="mute" />
    </div>
    <div v-else class="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="ch in chaptersWithKp"
        :key="ch.id"
        :to="`/kp/${ch.id}`"
        class="chap-card"
      >
        <div class="overline text-accent inline-flex items-center gap-1.5">
          <span class="w-1 h-1 rounded-full" style="background: var(--accent);" />
          {{ ch.id === 'ch00' ? '导论' : `第 ${ch.id.replace('ch_', '')} 章` }}
        </div>
        <h3 class="text-[15px] font-semibold m-0 leading-snug line-clamp-2 min-h-[42px]">{{ ch.title }}</h3>
        <div class="text-caption text-mute inline-flex items-center gap-1.5 mt-auto">
          <Icon name="lucide:book-open" class="w-3.5 h-3.5" />
          {{ ch.kpCount }} 个知识点
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5 ml-auto opacity-60" />
        </div>
      </NuxtLink>
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
