<template>
  <button
    class="w-9 h-9 rounded grid place-items-center overflow-hidden transition-colors"
    style="background: var(--bg-elev-2);"
    :title="isDark ? '切到亮色模式' : '切到暗色模式'"
    :aria-label="isDark ? '切到亮色模式' : '切到暗色模式'"
    :aria-pressed="isDark"
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
          aria-hidden="true"
        />
        <Icon
          v-else
          key="moon"
          name="lucide:moon"
          class="w-[18px] h-[18px]"
          style="color: var(--fg-mute);"
          aria-hidden="true"
        />
      </Transition>
      <template #fallback>
        <Icon name="lucide:contrast" class="w-[18px] h-[18px] text-mute" aria-hidden="true" />
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
