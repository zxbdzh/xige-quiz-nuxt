<template>
  <div>
    <!-- ============ 刊头 ============ -->
    <section class="masthead">
      <div class="grid gap-6 md:grid-cols-[1fr_auto] items-center">
        <div>
          <div class="overline mb-3" style="color: var(--fg-mute);">
            2025 自考重点 · 习近平新时代中国特色社会主义思想概论
          </div>
          <h1 class="text-display m-0 mb-2 leading-tight">
            {{ meta.data.value.subject || '习概练习题库' }}
          </h1>
          <p class="text-[15px] m-0 max-w-xl" style="color: var(--fg-mute);">
            基于重点笔记自动构建的选择题库,覆盖章节练习与知识点速览,助你高效备考。
          </p>

          <div class="flex flex-wrap gap-2 mt-5">
            <NuxtLink to="/practice/random?ch=all" class="btn">
              <Icon name="lucide:shuffle" class="w-4 h-4" aria-hidden="true" />
              随机刷题
            </NuxtLink>
            <NuxtLink to="/practice/sequential?ch=all" class="btn btn--outline">
              <Icon name="lucide:list-ordered" class="w-4 h-4" aria-hidden="true" />
              顺序刷题
            </NuxtLink>
            <NuxtLink to="/chapters" class="btn btn--ghost">
              <Icon name="lucide:layout-grid" class="w-4 h-4" aria-hidden="true" />
              按章练习
            </NuxtLink>
            <ClientOnly>
              <NuxtLink v-if="overall.wrong" to="/practice/wrong" class="btn btn--ghost">
                <Icon name="lucide:repeat" class="w-4 h-4" aria-hidden="true" />
                错题复习 · {{ overall.wrong }}
              </NuxtLink>
            </ClientOnly>
          </div>
        </div>

        <!-- 完成度环形 -->
        <ClientOnly>
          <div class="hidden md:flex flex-col items-center gap-3">
            <UiProgressRing
              :percent="overallPct"
              :size="140"
              :stroke-width="8"
              from-color="var(--brand)"
              label-color="var(--fg)"
            />
            <span class="text-[13px] text-mute">完成度</span>
          </div>
          <template #fallback>
            <div class="hidden md:block w-[140px] h-[140px] rounded-full" style="background: var(--bg-elev-2);" />
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- ============ KPI 卡组 ============ -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      <!-- 题库(SSR 安全) -->
      <div class="card !p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded grid place-items-center shrink-0" style="background: var(--bg-elev-2);" aria-hidden="true">
          <Icon name="lucide:files" class="w-5 h-5" style="color: var(--fg-mute);" />
        </div>
        <div class="min-w-0">
          <div class="text-[22px] font-bold leading-none tracking-tight">{{ meta.data.value.totalMcq }}</div>
          <div class="text-caption text-mute mt-1">道选择题</div>
        </div>
      </div>
      <div class="card !p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded grid place-items-center shrink-0" style="background: var(--bg-elev-2);" aria-hidden="true">
          <Icon name="lucide:book-marked" class="w-5 h-5" style="color: var(--fg-mute);" />
        </div>
        <div class="min-w-0">
          <div class="text-[22px] font-bold leading-none tracking-tight">{{ meta.data.value.totalKp }}</div>
          <div class="text-caption text-mute mt-1">个知识点</div>
        </div>
      </div>
      <!-- 正确率/错题(依赖 localStorage) -->
      <ClientOnly>
        <div class="card !p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded grid place-items-center shrink-0" style="background: var(--bg-elev-2);" aria-hidden="true">
            <Icon name="lucide:check-circle-2" class="w-5 h-5" style="color: var(--fg-mute);" />
          </div>
          <div class="min-w-0">
            <div class="text-[22px] font-bold leading-none tracking-tight">{{ overall.accuracy }}%</div>
            <div class="text-caption text-mute mt-1">正确率 · {{ overall.done }} 已做</div>
          </div>
        </div>
        <div class="card !p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded grid place-items-center shrink-0" style="background: var(--bg-elev-2);" aria-hidden="true">
            <Icon name="lucide:alert-circle" class="w-5 h-5" style="color: var(--fg-mute);" />
          </div>
          <div class="min-w-0">
            <div class="text-[22px] font-bold leading-none tracking-tight">{{ overall.wrong }}</div>
            <div class="text-caption text-mute mt-1">错题待复习</div>
          </div>
        </div>
        <template #fallback>
          <div v-for="n in 2" :key="n" class="card !p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded grid place-items-center shrink-0" style="background: var(--bg-elev-2);" aria-hidden="true">
              <Icon name="lucide:check-circle-2" class="w-5 h-5 text-faint" />
            </div>
            <div>
              <div class="text-[22px] font-bold leading-none tracking-tight">—</div>
              <div class="text-caption text-mute mt-1">—</div>
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
            class="w-7 h-7 rounded grid place-items-center font-bold text-[13px]"
            style="background: var(--bg-elev-2); color: var(--fg-mute);"
          >{{ i + 1 }}</span>
          <Icon :name="`lucide:${step.icon}`" class="w-4 h-4" style="color: var(--fg-mute);" aria-hidden="true" />
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
        <NuxtLink
          to="/chapters"
          class="text-caption inline-flex items-center gap-1 hover:text-brand transition-colors"
        >
          查看全部
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
const bank = useBank()
const store = useQuizStore()

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
  },
  {
    icon: 'shuffle',
    title: '随机查漏',
    desc: '熟练后切换随机模式,模拟考场打散记忆点。',
  },
  {
    icon: 'repeat',
    title: '错题精修',
    desc: '答错自动进入错题本,再次答对自动移除。',
  },
]

function statsFor(id: string) {
  const c = bank.data.value.chapters.find(c => c.id === id)
  if (!c) return undefined
  return store.chapStats(c)
}
</script>
