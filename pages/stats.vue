<template>
  <div>
    <div class="mb-5">
      <div class="overline text-brand mb-1.5 inline-flex items-center gap-1.5">
        <Icon name="lucide:bar-chart-3" class="w-3 h-3" />
        学习统计
      </div>
      <h1 class="text-h1 m-0">学习统计</h1>
      <p class="section-sub mt-1.5">
        数据保存在本浏览器(localStorage),可导出 JSON 备份。
      </p>
    </div>

    <!-- 顶部 KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center"
               style="background: var(--brand-soft); color: var(--brand);">
            <Icon name="lucide:files" class="w-4 h-4" />
          </div>
          <span class="text-caption text-mute">累计答题</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight">{{ overall.done }}</div>
      </div>
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center"
               style="background: var(--ok-soft); color: var(--ok);">
            <Icon name="lucide:check-circle-2" class="w-4 h-4" />
          </div>
          <span class="text-caption text-mute">答对</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight text-ok">{{ overall.correct }}</div>
      </div>
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center"
               style="background: var(--accent-soft); color: var(--accent);">
            <Icon name="lucide:percent" class="w-4 h-4" />
          </div>
          <span class="text-caption text-mute">正确率</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight">{{ overall.accuracy }}%</div>
      </div>
      <div class="card !p-5">
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-8 h-8 rounded-lg grid place-items-center"
               style="background: var(--err-soft); color: var(--err);">
            <Icon name="lucide:alert-circle" class="w-4 h-4" />
          </div>
          <span class="text-caption text-mute">错题待复习</span>
        </div>
        <div class="text-[26px] font-bold leading-none tracking-tight text-err">{{ overall.wrong }}</div>
      </div>
    </div>

    <!-- 各章节情况 -->
    <div class="card mb-5">
      <h2 class="section-title mb-3">各章节情况</h2>
      <div
        v-for="ch in bank.data.value.chapters"
        :key="ch.id"
        class="stat-row"
      >
        <span
          class="w-8 h-8 rounded-lg grid place-items-center text-caption font-semibold"
          style="background: var(--bg-elev-2); color: var(--fg-mute);"
        >
          {{ chShort(ch.id) }}
        </span>
        <span class="truncate text-fg">{{ ch.title }}</span>
        <div class="acc-bar" :title="`${store.chapStats(ch).accuracy}%`">
          <div :style="{ width: store.chapStats(ch).accuracy + '%' }" />
        </div>
        <span class="text-right text-caption text-mute tabular-nums">
          {{ store.chapStats(ch).done }}/{{ store.chapStats(ch).total }}
        </span>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card">
      <h2 class="section-title mb-1">数据管理</h2>
      <p class="section-sub mb-4">建议定期导出 JSON 进行备份,以免清除浏览器数据时丢失进度。</p>
      <div class="flex gap-2.5 flex-wrap">
        <button class="btn btn--outline" @click="exportProgress">
          <Icon name="lucide:download" class="w-4 h-4" />
          导出进度
        </button>
        <button class="btn btn--outline" @click="triggerImport">
          <Icon name="lucide:upload" class="w-4 h-4" />
          导入进度
        </button>
        <button class="btn btn--danger" @click="reset">
          <Icon name="lucide:trash-2" class="w-4 h-4" />
          重置所有数据
        </button>
      </div>
      <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="onImport" />
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useQuizStore()
const bank = useBank()
const overall = computed(() => store.overall)
const fileInput = ref<HTMLInputElement | null>(null)

function chShort(id: string) {
  if (id === 'ch00') return '导'
  return id.replace('ch_', '')
}

function exportProgress() {
  const payload = {
    history: store.history,
    wrong: store.wrong,
    mark: store.mark,
    theme: store.theme,
    exportedAt: new Date().toISOString(),
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
    const obj = JSON.parse(txt)
    store.importState(obj)
    alert('导入成功')
  } catch (err: any) {
    alert('导入失败:' + err.message)
  }
}

function reset() {
  if (confirm('将清空全部本地数据(错题/进度/统计),确定吗?')) {
    store.resetAll()
  }
}

useHead({ title: '学习统计' })
</script>
