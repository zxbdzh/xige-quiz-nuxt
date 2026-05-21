<template>
  <button
    class="relative w-9 h-9 rounded-lg grid place-items-center text-fg overflow-hidden transition-colors"
    :title="isDark ? '切到亮色模式' : '切到暗色模式'"
    :aria-label="isDark ? '切到亮色模式' : '切到暗色模式'"
    style="background: var(--bg-elev-2);"
    @click="toggle"
  >
    <ClientOnly>
      <Transition name="theme-icon">
        <Icon
          v-if="isDark"
          key="sun"
          name="lucide:sun"
          class="w-[18px] h-[18px]"
          style="color: var(--warn);"
        />
        <Icon
          v-else
          key="moon"
          name="lucide:moon"
          class="w-[18px] h-[18px]"
          style="color: var(--brand);"
        />
      </Transition>
      <template #fallback>
        <Icon name="lucide:contrast" class="w-[18px] h-[18px] text-mute" />
      </template>
    </ClientOnly>
  </button>
</template>

<script setup lang="ts">
const store = useQuizStore()
const isDark = computed(() => store.theme === 'dark')

function toggle() {
  store.setTheme(isDark.value ? 'light' : 'dark')
}
</script>
