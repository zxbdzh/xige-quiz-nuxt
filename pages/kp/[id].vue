<template>
  <div>
    <div class="flex items-center gap-2 flex-wrap mb-5">
      <NuxtLink to="/kp" class="btn btn--outline btn--sm">
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
        知识点目录
      </NuxtLink>
      <span v-if="data" class="tag tag--brand">
        <Icon name="lucide:bookmark" class="w-3 h-3" />
        {{ data.title }}
      </span>
      <div class="flex-1" />
      <NuxtLink
        v-if="data && data.mcq.length"
        :to="`/practice/sequential?ch=${encodeURIComponent(data.id)}`"
        class="btn btn--sm"
      >
        <Icon name="lucide:play" class="w-3.5 h-3.5" />
        做这章题目 · {{ data.mcq.length }}
      </NuxtLink>
    </div>

    <div class="grid gap-5 md:grid-cols-[200px_1fr]">
      <!-- 锚点目录 -->
      <aside v-if="data?.kps?.length" class="hidden md:block">
        <div class="sticky top-20 surface-2 rounded-xl p-3">
          <div class="overline text-faint mb-2">本章目录</div>
          <ol class="space-y-1 m-0 p-0 list-none">
            <li v-for="(kp, i) in data.kps" :key="i">
              <a
                :href="`#kp-${i}`"
                class="block py-1 px-2 rounded text-caption text-mute hover:bg-bg-elev hover:text-brand transition"
              >
                {{ toCn(i + 1) }}、{{ kp.title }}
              </a>
            </li>
          </ol>
        </div>
      </aside>

      <!-- 知识点正文 -->
      <div class="card !p-6 sm:!p-7 min-w-0">
        <SkeletonCard v-if="pending" :lines="6" />
        <EmptyState
          v-else-if="!data || !data.kps.length"
          icon="book-open"
          title="本章暂无知识点速览"
          tone="mute"
        />
        <section
          v-for="(kp, i) in data?.kps || []"
          :id="`kp-${i}`"
          :key="i"
          class="scroll-mt-24 mb-6 last:mb-0"
        >
          <h3 class="flex items-center gap-2.5 text-[16px] font-semibold m-0 mb-3">
            <span
              class="w-7 h-7 rounded-lg grid place-items-center text-[13px] font-bold shrink-0"
              style="background: linear-gradient(135deg, var(--brand-soft), var(--accent-soft)); color: var(--brand);"
            >{{ i + 1 }}</span>
            <span class="leading-snug">{{ kp.title }}</span>
          </h3>
          <ol class="pl-9 m-0 space-y-2">
            <li v-for="(p, j) in kp.points" :key="j" class="leading-[1.75] text-fg">
              {{ p }}
            </li>
          </ol>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => String(route.params.id))
const { data, pending } = useChapter(id.value)

const cnMap = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
function toCn(n: number): string {
  if (n <= 10) return cnMap[n]
  if (n < 20) return '十' + cnMap[n - 10]
  return String(n)
}

useHead({ title: () => `${data.value?.title || '知识点'} · 速览` })
</script>
