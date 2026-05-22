<template>
  <svg
    class="ui-progress-ring"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    role="img"
    :aria-label="label ? `${label}: ${pct}%` : `${pct}%`"
    fill="none"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="fromColor" />
        <stop offset="100%" :stop-color="toColor" />
      </linearGradient>
    </defs>
    <!-- track -->
    <circle
      :cx="cx"
      :cy="cy"
      :r="r"
      :stroke="trackColor"
      :stroke-width="strokeWidth"
      fill="none"
    />
    <!-- fill -->
    <circle
      :cx="cx"
      :cy="cy"
      :r="r"
      :stroke="fromColor"
      :stroke-width="strokeWidth"
      fill="none"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="dashOffset"
      stroke-linecap="round"
      transform="rotate(-90)"
      :transform-origin="`${cx} ${cy}`"
    />
    <!-- label -->
    <text
      v-if="label"
      :x="cx"
      :y="cy"
      text-anchor="middle"
      dominant-baseline="central"
      :fill="labelColor"
      font-size="13"
      font-weight="600"
    >{{ label }}</text>
    <text
      v-if="!label"
      :x="cx"
      :y="cy"
      text-anchor="middle"
      dominant-baseline="central"
      :fill="labelColor"
      font-size="28"
      font-weight="700"
    >{{ pct }}%</text>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  percent: number
  size?: number
  strokeWidth?: number
  fromColor?: string
  toColor?: string
  trackColor?: string
  labelColor?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 80,
  strokeWidth: 6,
  fromColor: 'var(--brand)',
  toColor: 'var(--brand)',
  trackColor: 'var(--bg-elev-2)',
  labelColor: 'var(--fg)',
})

const uid = useId()
const gradientId = `prg-${uid}`

const pct = computed(() => Math.min(100, Math.max(0, Math.round(props.percent))))
const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const r = computed(() => (props.size - props.strokeWidth * 2) / 2)
const circumference = computed(() => 2 * Math.PI * r.value)
const dashOffset = computed(() => circumference.value * (1 - pct.value / 100))
</script>

<style scoped>
.ui-progress-ring {
  display: block;
}
</style>
