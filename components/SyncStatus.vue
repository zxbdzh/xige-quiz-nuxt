<template>
  <span
    v-if="user"
    class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
    :style="toneStyle"
    :title="title"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass" :style="{ background: toneColor }" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const sync = import.meta.client ? useCloudSync() : null
const session = authClient.useSession()
const user = computed(() => (session.value as any)?.data?.user ?? null)

const status = computed(() => sync?.status.value ?? 'idle')

const label = computed(() => {
  switch (status.value) {
    case 'pending':
      return '等待同步'
    case 'syncing':
      return '同步中'
    case 'synced':
      return '已同步'
    case 'error':
      return '同步失败'
    case 'offline':
      return '离线'
    default:
      return '就绪'
  }
})

const toneMap: Record<string, { bg: string; fg: string }> = {
  idle: { bg: 'var(--bg-elev-2)', fg: 'var(--fg-mute)' },
  pending: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
  syncing: { bg: 'var(--brand-soft)', fg: 'var(--brand)' },
  synced: { bg: 'var(--ok-soft)', fg: 'var(--ok)' },
  error: { bg: 'var(--err-soft)', fg: 'var(--err)' },
  offline: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
}

const toneStyle = computed(() => ({
  background: toneMap[status.value].bg,
  color: toneMap[status.value].fg,
}))
const toneColor = computed(() => toneMap[status.value].fg)

const dotClass = computed(() =>
  status.value === 'syncing' || status.value === 'pending' ? 'animate-pulse' : ''
)

const title = computed(() => {
  const ts = sync?.lastSyncedAt.value
  if (!ts) return label.value
  return `${label.value} · 上次同步:${new Date(ts).toLocaleString()}`
})
</script>
