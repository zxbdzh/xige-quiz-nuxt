<template>
  <div
    class="ui-progress"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-label="label || `${pct}%`"
  >
    <div class="ui-progress__track">
      <div
        class="ui-progress__bar"
        :style="{ width: pct + '%' }"
      />
    </div>
    <span v-if="showLabel" class="ui-progress__label">{{ pct }}%</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: number
  min?: number
  max?: number
  label?: string
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  showLabel: false,
})

const pct = computed(() => {
  if (props.max === props.min) return 0
  return Math.min(100, Math.max(0, Math.round(((props.value - props.min) / (props.max - props.min)) * 100)))
})
</script>

<style scoped>
.ui-progress {
  @apply flex items-center gap-2;
}
.ui-progress__track {
  @apply flex-1 h-1.5 rounded-full overflow-hidden;
  background: var(--bg-elev-2);
}
.ui-progress__bar {
  height: 100%;
  border-radius: 999px;
  background: var(--brand);
  transition: width .3s ease;
}
.ui-progress__label {
  @apply text-[13px] font-medium tabular-nums shrink-0;
  color: var(--fg-mute);
  min-width: 3ch;
  text-align: right;
}
</style>
