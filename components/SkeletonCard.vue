<template>
  <div class="card !p-5">
    <div class="skeleton h-3 w-16 mb-3" />
    <div class="skeleton h-5 w-3/4 mb-4" />
    <div class="space-y-2">
      <div class="skeleton h-3 w-full" />
      <div class="skeleton h-3 w-5/6" />
      <div v-if="lines > 2" class="skeleton h-3 w-4/6" />
    </div>
    <div v-if="withProgress" class="skeleton h-1.5 rounded-full mt-5 w-full" />
    <div v-if="withActions" class="flex gap-2 mt-5">
      <div class="skeleton h-8 flex-1 rounded-lg" />
      <div class="skeleton h-8 flex-1 rounded-lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    lines?: number
    withProgress?: boolean
    withActions?: boolean
  }>(),
  {
    lines: 3,
    withProgress: false,
    withActions: false,
  }
)
</script>
