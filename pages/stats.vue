<template>
  <div>
    <div class="mb-5">
      <div class="overline mb-1.5 inline-flex items-center gap-1.5" style="color: var(--brand);">
        <Icon name="lucide:bar-chart-3" class="w-3 h-3" aria-hidden="true" />
        学习统计
      </div>
      <h1 class="text-h1 m-0">学习统计</h1>
      <p class="section-sub mt-1.5">
        数据保存在本浏览器(localStorage),可导出 JSON 备份。
      </p>
    </div>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center" style="background: var(--bg-elev-2);" aria-hidden="true">
            <Icon name="lucide:files" class="w-4 h-4" style="color: var(--fg-mute);" />
          </div>
          <span class="text-caption text-mute">累计答题</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight">{{ overall.done }}</div>
      </div>
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center" style="background: var(--ok-soft);" aria-hidden="true">
            <Icon name="lucide:check-circle-2" class="w-4 h-4" style="color: var(--ok);" />
          </div>
          <span class="text-caption text-mute">答对</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight" style="color: var(--ok);">{{ overall.correct }}</div>
      </div>
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center" style="background: var(--bg-elev-2);" aria-hidden="true">
            <Icon name="lucide:percent" class="w-4 h-4" style="color: var(--fg-mute);" />
          </div>
          <span class="text-caption text-mute">正确率</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight">{{ overall.accuracy }}%</div>
      </div>
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center" style="background: var(--err-soft);" aria-hidden="true">
            <Icon name="lucide:alert-circle" class="w-4 h-4" style="color: var(--err);" />
          </div>
          <span class="text-caption text-mute">错题待复习</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight" style="color: var(--err);">{{ overall.wrong }}</div>
      </div>
    </div>

    <!-- 各章节情况(依赖 localStorage,CSR) -->
    <ClientOnly>
      <div class="card mb-5">
        <h2 class="section-title mb-3">各章节情况</h2>
        <div
          v-for="ch in bank.data.value.chapters"
          :key="ch.id"
          class="stat-row"
        >
          <span
            class="w-8 h-8 rounded grid place-items-center text-caption font-semibold"
            style="background: var(--bg-elev-2); color: var(--fg-mute);"
            :aria-label="chapterShortLabel(ch) + '章'"
          >{{ chapterShortLabel(ch) }}</span>
          <span class="truncate">{{ ch.title }}</span>
          <!-- 进度条 -->
          <UiProgress
            v-if="chapterStats.get(ch.id)"
            :value="chapterStats.get(ch.id)!.done"
            :max="chapterStats.get(ch.id)!.total || 1"
            class="hidden sm:block"
          />
          <span v-else class="hidden sm:block" />
          <span class="text-right text-caption text-mute tabular-nums">
            {{ chapterStats.get(ch.id)?.done ?? 0 }}/{{ chapterStats.get(ch.id)?.total ?? ch.mcq.length }}
          </span>
        </div>
      </div>
    </ClientOnly>

    <!-- 云同步 -->
    <ClientOnly>
      <div class="card mb-5">
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-xl grid place-items-center shrink-0"
            :style="user ? 'background: var(--ok-soft); color: var(--ok);' : 'background: var(--bg-elev-2); color: var(--fg-mute);'"
            aria-hidden="true"
          >
            <Icon :name="user ? 'lucide:cloud-check' : 'lucide:cloud-off'" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="section-title m-0 mb-1 inline-flex items-center gap-2">
              云端同步
              <SyncStatus />
            </h2>
            <p v-if="user" class="section-sub m-0">
              已登录 <strong class="text-fg">{{ user.email }}</strong>
              <span v-if="lastSyncedAt" class="text-faint">
                · 上次同步: {{ formatTs(lastSyncedAt) }}
              </span>
            </p>
            <p v-else class="section-sub m-0">
              登录后自动云端备份,换设备无缝接续学习进度。
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button v-if="user" class="btn btn--sm" @click="onSyncNow">
              <Icon name="lucide:refresh-cw" class="w-3.5 h-3.5" aria-hidden="true" />
              立即同步
            </button>
            <NuxtLink v-else to="/login" class="btn btn--sm">
              <Icon name="lucide:log-in" class="w-3.5 h-3.5" aria-hidden="true" />
              登录
            </NuxtLink>
          </div>
        </div>
      </div>
    </ClientOnly>

    <!-- 数据管理 -->
    <div class="card">
      <h2 class="section-title mb-1">数据管理</h2>
      <p class="section-sub mb-4">建议定期导出 JSON 进行备份,以免清除浏览器数据时丢失进度。</p>
      <div class="flex gap-2.5 flex-wrap">
        <button class="btn btn--outline" @click="exportProgress">
          <Icon name="lucide:download" class="w-4 h-4" aria-hidden="true" />
          导出进度
        </button>
        <button class="btn btn--outline" @click="triggerImport">
          <Icon name="lucide:upload" class="w-4 h-4" aria-hidden="true" />
          导入进度
        </button>
        <button class="btn btn--danger" @click="onReset">
          <Icon name="lucide:trash-2" class="w-4 h-4" aria-hidden="true" />
          重置所有数据
        </button>
      </div>
      <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="onImport" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const store = useQuizStore()
const bank = useBank()
const overall = computed(() => store.overall)
const fileInput = ref<HTMLInputElement | null>(null)
const { confirm } = useConfirm()
const { validate } = useImportValidation()

const sync = import.meta.client ? useCloudSync() : null
const session = authClient.useSession()
const user = computed(() => (session.value as any)?.data?.user ?? null)
const lastSyncedAt = computed(() => sync?.lastSyncedAt.value ?? 0)

const { chapterLabel, chapterShort: chapterShortLabel } = useChapterLabel()

// 每章只计算一次 stats(避免 O(章×题×3))
const chapterStats = computed(() => {
  const map = new Map<string, { done: number; total: number; correct: number; accuracy: number }>()
  for (const c of bank.data.value.chapters) {
    map.set(c.id, store.chapStats(c))
  }
  return map
})

async function onSyncNow() {
  await sync?.syncNow()
}

function formatTs(ts: number): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

function exportProgress() {
  const payload = {
    history: store.history,
    wrong: store.wrong,
    mark: store.mark,
    updatedAt: store.updatedAt,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `xige_quiz_progress_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

async function onImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const txt = await file.text()
    const raw = JSON.parse(txt)
    const { valid, errors } = validate(raw)
    if (errors.length) {
      const ok = await confirm({
        title: '导入文件部分数据无效',
        description: errors.join('\n'),
        confirmText: '忽略无效部分',
        danger: false,
      })
      if (!ok) return
    }
    store.importState(valid)
  } catch (err: any) {
    await confirm({
      title: '导入失败',
      description: err?.message ?? '无法读取文件',
      confirmText: '确定',
    })
  }
  ;(e.target as HTMLInputElement).value = ''
}

async function onReset() {
  const ok = await confirm({
    title: '确定重置所有数据?',
    description: '此操作将清空全部本地数据(错题/进度/统计),且不可恢复。',
    confirmText: '重置',
    danger: true,
  })
  if (ok) store.resetAll()
}

useHead({ title: '学习统计' })
</script>
