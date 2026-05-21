<template>
  <div class="flex flex-col items-center justify-center text-center py-14 px-6">
    <div
      class="w-16 h-16 rounded-2xl grid place-items-center mb-4"
      :style="bgStyle"
    >
      <Icon :name="`lucide:${icon}`" class="w-8 h-8" :style="iconStyle" />
    </div>
    <h3 class="text-h3 m-0 mb-1.5">{{ title }}</h3>
    <p v-if="desc" class="text-mute text-caption m-0 max-w-md">{{ desc }}</p>
    <div v-if="$slots.action" class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon?: string
    title: string
    desc?: string
    tone?: 'brand' | 'ok' | 'warn' | 'err' | 'mute'
  }>(),
  {
    icon: 'inbox',
    tone: 'brand',
  }
)

const toneMap: Record<string, { bg: string; fg: string }> = {
  brand: { bg: 'var(--brand-soft)', fg: 'var(--brand)' },
  ok: { bg: 'var(--ok-soft)', fg: 'var(--ok)' },
  warn: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
  err: { bg: 'var(--err-soft)', fg: 'var(--err)' },
  mute: { bg: 'var(--bg-elev-2)', fg: 'var(--fg-mute)' },
}

const bgStyle = computed(() => ({ background: toneMap[props.tone].bg }))
const iconStyle = computed(() => ({ color: toneMap[props.tone].fg }))
</script>
