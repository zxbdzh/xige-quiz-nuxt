<template>
  <div>
    <!-- ============ HERO ============ -->
    <section class="hero">
      <div class="grid gap-6 md:grid-cols-[1fr_auto] items-center">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-3"
               style="background: rgba(255,255,255,.18); backdrop-filter: blur(6px);">
            <Icon name="lucide:sparkles" class="w-3 h-3" />
            2025 自考重点
          </div>
          <h1 class="text-display m-0 mb-2 leading-tight">
            {{ meta.data.value.subject || '习近平新时代中国特色社会主义思想概论' }}
          </h1>
          <p class="opacity-85 text-[15px] m-0 max-w-xl">
            基于《2025习概重点笔记》自动构建的练习题库,覆盖选择题 + 知识点速览,助你高效备考。
          </p>

          <div class="flex flex-wrap gap-2.5 mt-5">
            <NuxtLink to="/practice/random?ch=all" class="btn btn--solid">
              <Icon name="lucide:shuffle" class="w-4 h-4" />
              随机刷题
            </NuxtLink>
            <NuxtLink to="/practice/sequential?ch=all" class="btn">
              <Icon name="lucide:list-ordered" class="w-4 h-4" />
              顺序刷题
            </NuxtLink>
            <NuxtLink to="/chapters" class="btn">
              <Icon name="lucide:layout-grid" class="w-4 h-4" />
              按章练习
            </NuxtLink>
            <ClientOnly>
              <NuxtLink v-if="overall.wrong" to="/practice/wrong" class="btn">
                <Icon name="lucide:repeat" class="w-4 h-4" />
                错题复习 · {{ overall.wrong }}
              </NuxtLink>
            </ClientOnly>
          </div>
        </div>

        <ClientOnly>
          <div class="hidden md:flex flex-col items-center">
            <ProgressRing :percent="overallPct" :size="140" :stroke-width="10" label="完成度" />
          </div>
          <template #fallback>
            <div class="hidden md:block w-[140px] h-[140px]" />
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- ============ Stat 卡组 ============ -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      <div class="card !p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl grid place-items-center shrink-0"
             style="background: var(--brand-soft); color: var(--brand);">
          <Icon name="lucide:files" class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <div class="text-[22px] font-bold leading-none tracking-tight">{{ meta.data.value.totalMcq }}</div>
          <div class="text-caption text-mute mt-1">道选择题</div>
        </div>
      </div>
      <div class="card !p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl grid place-items-center shrink-0"
             style="background: var(--accent-soft); color: var(--accent);">
          <Icon name="lucide:book-marked" class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <div class="text-[22px] font-bold leading-none tracking-tight">{{ meta.data.value.totalKp }}</div>
          <div class="text-caption text-mute mt-1">个知识点</div>
        </div>
      </div>
      <ClientOnly>
        <div class="card !p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl grid place-items-center shrink-0"
               style="background: var(--ok-soft); color: var(--ok);">
            <Icon name="lucide:check-circle-2" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="text-[22px] font-bold leading-none tracking-tight">{{ overall.accuracy }}%</div>
            <div class="text-caption text-mute mt-1">正确率 · {{ overall.done }} 已做</div>
          </div>
        </div>
        <div class="card !p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl grid place-items-center shrink-0"
               style="background: var(--err-soft); color: var(--err);">
            <Icon name="lucide:alert-circle" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <div class="text-[22px] font-bold leading-none tracking-tight">{{ overall.wrong }}</div>
            <div class="text-caption text-mute mt-1">错题待复习</div>
          </div>
        </div>
        <template #fallback>
          <div class="card !p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl grid place-items-center shrink-0 surface-2">
              <Icon name="lucide:check-circle-2" class="w-5 h-5 text-faint" />
            </div>
            <div class="min-w-0">
              <div class="text-[22px] font-bold leading-none tracking-tight">—</div>
              <div class="text-caption text-mute mt-1">正确率</div>
            </div>
          </div>
          <div class="card !p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl grid place-items-center shrink-0 surface-2">
              <Icon name="lucide:alert-circle" class="w-5 h-5 text-faint" />
            </div>
            <div class="min-w-0">
              <div class="text-[22px] font-bold leading-none tracking-tight">—</div>
              <div class="text-caption text-mute mt-1">错题待复习</div>
            </div>
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- ============ 学习路径 ============ -->
    <section class="grid gap-3 sm:grid-cols-3 mt-6">
      <div v-for="(step, i) in steps" :key="i" class="card !p-5 card--hover">
        <div class="flex items-center gap-2 mb-2.5">
          <span
            class="w-7 h-7 rounded-lg grid place-items-center font-bold text-[13px]"
            :style="{ background: step.bg, color: step.fg }"
          >{{ i + 1 }}</span>
          <Icon :name="`lucide:${step.icon}`" class="w-4 h-4" :style="{ color: step.fg }" />
        </div>
        <h3 class="text-[15px] font-semibold m-0 mb-1">{{ step.title }}</h3>
        <p class="text-mute text-caption m-0 leading-relaxed">{{ step.desc }}</p>
      </div>
    </section>

    <!-- ============ 章节概览 ============ -->
    <section class="mt-7">
      <div class="flex items-baseline justify-between mb-3.5">
        <div>
          <h2 class="section-title">章节概览</h2>
          <p class="section-sub mt-1">共 {{ meta.data.value.totalChapters }} 章 · 选择章节定向练习</p>
        </div>
        <NuxtLink to="/chapters" class="text-caption text-brand inline-flex items-center gap-1 hover:gap-2 transition-all">
          查看全部
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>
      <div class="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <ChapterCard
          v-for="ch in meta.data.value.chapters.slice(0, 6)"
          :key="ch.id"
          :chap="ch"
          :stats="statsFor(ch.id)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const meta = useBankMeta()
const store = useQuizStore()
const bank = useBank()

const overall = computed(() => store.overall)

const overallPct = computed(() => {
  const total = meta.data.value.totalMcq || 1
  return Math.round((overall.value.done / total) * 100)
})

const steps = [
  {
    icon: 'list-ordered',
    title: '顺序刷题',
    desc: '第一遍系统过题,按章节顺序建立知识脉络。',
    bg: 'var(--brand-soft)',
    fg: 'var(--brand)',
  },
  {
    icon: 'shuffle',
    title: '随机查漏',
    desc: '熟练后切换随机模式,模拟考场打散记忆点。',
    bg: 'var(--accent-soft)',
    fg: 'var(--accent)',
  },
  {
    icon: 'repeat',
    title: '错题精修',
    desc: '答错自动进入错题本,再次答对自动移除。',
    bg: 'var(--ok-soft)',
    fg: 'var(--ok)',
  },
]

function statsFor(id: string) {
  const c = bank.data.value.chapters.find(c => c.id === id)
  if (!c) return undefined
  return store.chapStats(c)
}
</script>
