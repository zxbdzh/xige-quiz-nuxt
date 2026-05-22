<script setup lang="ts">
const { state, open, resolveDialog } = useConfirm()
</script>

<template>
  <ClientOnly>
    <UiDialog
      :title="state.title"
      :description="state.description"
      :confirm-text="state.confirmText"
      :cancel-text="state.cancelText"
      :danger="state.danger"
      :open="open"
      @confirm="resolveDialog(true)"
      @cancel="resolveDialog(false)"
    />
  </ClientOnly>
</template>
