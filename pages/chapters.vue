<template>
  <div>
    <div class="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <div class="overline mb-1.5 inline-flex items-center gap-1.5" style="color: var(--brand);">
          <Icon name="lucide:layout-grid" class="w-3 h-3" aria-hidden="true" />
          全部章节
        </div>
        <h1 class="text-h1 m-0">章节练习</h1>
        <p class="section-sub mt-1.5">选择章节进行专项练习,或浏览该章知识点。</p>
      </div>

      <ClientOnly>
        <div class="card !p-3 !py-2 flex items-center gap-3">
          <Icon name="lucide:trending-up" class="w-4 h-4" style="color: var(--brand);" aria-hidden="true" />
          <div class="text-[13px] text-mute">
            已完成 <strong class="text-fg">{{ overall.done }}</strong> / {{ meta.data.value.totalMcq }} 题
            <span class="text-faint">·</span>
            正确率 <strong style="color: var(--ok);">{{ overall.accuracy }}%</strong>
          </div>
        </div>
        <template #fallback>
          <div class="card !p-3 !py-2 h-[44px]" />
        </template>
      </ClientOnly>
    </div>

    <!-- 过滤器 tablist -->
    <div class="flex flex-wrap gap-1.5 mb-5">
      <div role="tablist" aria-label="章节过滤器" class="flex gap-1">
        <button
          v-for="f in filters"
          :key="f.value"
          role="tab"
          :aria-selected="filter === f.value"
          :tabindex="filter === f.value ? 0 : -1"
          :class="['nav-link', filter === f.value ? 'nav-link--active' : '']"
          @click="filter = f.value"
          @keydown="onFilterKey"
        >
          <Icon :name="`lucide:${f.icon}`" class="w-3.5 h-3.5" aria-hidden="true" />
          {{ f.label }}
        </button>
      </div>
    </div>

    <div v-if="!visibleChapters.length" class="card">
      <EmptyState icon="search-x" title="没有匹配的章节" desc="试试切换其他过滤条件。" tone="mute" />
    </div>
    <div v-else class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <ChapterCard
        v-for="ch in visibleChapters"
        :key="ch.id"
        :chap="ch"
        :stats="statsFor(ch.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const meta = useBankMeta()
const bank = useBank()
const store = useQuizStore()

const overall = computed(() => store.overall)

type Filter = 'all' | 'mcq' | 'kp' | 'incomplete'
const filter = ref<Filter>('all')

const filters: { value: Filter; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: 'list' },
  { value: 'mcq', label: '含选择题', icon: 'file-text' },
  { value: 'kp', label: '含知识点', icon: 'book-open' },
  { value: 'incomplete', label: '未完成', icon: 'circle-dashed' },
]

const visibleChapters = computed(() => {
  const list = meta.data.value.chapters
  if (filter.value === 'mcq') return list.filter(c => c.mcqCount > 0)
  if (filter.value === 'kp') return list.filter(c => c.kpCount > 0)
  if (filter.value === 'incomplete') {
    return list.filter(c => {
      const s = statsFor(c.id)
      return !s || s.done < s.total
    })
  }
  return list
})

function statsFor(id: string) {
  const c = bank.data.value.chapters.find(c => c.id === id)
  if (!c) return undefined
  return store.chapStats(c)
}

// 键盘左右切换 tab
function onFilterKey(e: KeyboardEvent) {
  const keys = filters.map(f => f.value)
  const cur = keys.indexOf(filter.value)
  if (e.key === 'ArrowRight') {
    filter.value = keys[(cur + 1) % keys.length]
  } else if (e.key === 'ArrowLeft') {
    filter.value = keys[(cur - 1 + keys.length) % keys.length]
  }
}

useHead({ title: '章节练习' })
</script>
