<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="-rotate-90"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="fromColor" />
          <stop offset="100%" :stop-color="toColor" />
        </linearGradient>
      </defs>
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="`url(#${gradientId})`"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-700 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <slot>
        <span class="text-[26px] font-bold leading-none tracking-tight" :style="{ color: labelColor }">
          {{ Math.round(percent) }}%
        </span>
        <span v-if="label" class="text-[11px] uppercase tracking-wider mt-1 opacity-70" :style="{ color: labelColor }">
          {{ label }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    percent: number
    size?: number
    strokeWidth?: number
    fromColor?: string
    toColor?: string
    trackColor?: string
    labelColor?: string
    label?: string
  }>(),
  {
    size: 120,
    strokeWidth: 10,
    fromColor: '#FFFFFF',
    toColor: '#A5F3FC',
    trackColor: 'rgba(255,255,255,0.2)',
    labelColor: '#FFFFFF',
    label: '',
  }
)

const gradientId = `pring-${Math.random().toString(36).slice(2, 9)}`
const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const p = Math.max(0, Math.min(100, props.percent))
  return circumference.value * (1 - p / 100)
})
</script>
