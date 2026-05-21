<template>
  <span class="spinner" :style="sizeStyle" :aria-label="label">
    <span class="spinner__inner" />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: number
    label?: string
  }>(),
  {
    size: 20,
    label: '加载中',
  }
)
const sizeStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<style scoped>
.spinner {
  display: inline-block;
  position: relative;
}
.spinner__inner {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid var(--bg-elev-2);
  border-top-color: var(--brand);
  animation: spin .8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
