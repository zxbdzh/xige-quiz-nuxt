<template>
  <ClientOnly>
    <div v-if="user" class="relative">
      <button
        class="flex items-center gap-2 h-9 px-1.5 rounded-lg transition-colors"
        :class="open ? 'bg-bg-elev-2' : 'hover:bg-bg-elev-2'"
        @click="open = !open"
        :aria-expanded="open"
      >
        <span
          class="w-7 h-7 rounded-full grid place-items-center text-white text-[12px] font-bold overflow-hidden"
          :style="avatarStyle"
        >
          <img v-if="user.image" :src="user.image" alt="" class="w-full h-full object-cover" />
          <span v-else>{{ initial }}</span>
        </span>
        <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 text-faint" :class="open ? 'rotate-180' : ''" />
      </button>

      <Transition name="menu">
        <div
          v-if="open"
          class="absolute right-0 mt-2 w-60 rounded-xl border border-line shadow-lg p-2 z-50"
          style="background: var(--bg-elev);"
          @click.stop
        >
          <div class="px-3 py-2.5 border-b border-line mb-1">
            <div class="text-[13px] font-semibold truncate">{{ user.name || '用户' }}</div>
            <div class="text-[11px] text-faint truncate">{{ user.email }}</div>
            <div class="mt-2">
              <SyncStatus />
            </div>
          </div>
          <NuxtLink
            to="/stats"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-caption text-fg hover:bg-bg-elev-2"
            @click="open = false"
          >
            <Icon name="lucide:bar-chart-3" class="w-4 h-4 text-mute" />
            学习统计
          </NuxtLink>
          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-caption text-fg hover:bg-bg-elev-2"
            @click="onSyncNow"
          >
            <Icon name="lucide:refresh-cw" class="w-4 h-4 text-mute" />
            立即同步
          </button>
          <div class="my-1 border-t border-line" />
          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-caption hover:bg-err-soft"
            style="color: var(--err);"
            @click="onSignOut"
          >
            <Icon name="lucide:log-out" class="w-4 h-4" />
            退出登录
          </button>
        </div>
      </Transition>
    </div>

    <NuxtLink
      v-else
      to="/login"
      class="btn btn--ghost btn--sm"
    >
      <Icon name="lucide:log-in" class="w-3.5 h-3.5" />
      登录
    </NuxtLink>

    <template #fallback>
      <span class="w-9 h-9 rounded-lg surface-2" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()
const user = computed(() => (session.value as any)?.data?.user ?? null)

const open = ref(false)

const initial = computed(() => {
  const n = user.value?.name || user.value?.email || '?'
  return n.charAt(0).toUpperCase()
})

const avatarStyle = computed(() => ({
  background:
    user.value?.image
      ? 'transparent'
      : 'linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)',
}))

const sync = import.meta.client ? useCloudSync() : null

async function onSyncNow() {
  open.value = false
  await sync?.syncNow()
}

async function onSignOut() {
  open.value = false
  await authClient.signOut()
  await navigateTo('/')
}

// 点外面关菜单
if (import.meta.client) {
  onMounted(() => {
    const handler = (e: MouseEvent) => {
      if (!open.value) return
      const target = e.target as HTMLElement
      if (!target.closest('.relative')) open.value = false
    }
    window.addEventListener('click', handler)
    onBeforeUnmount(() => window.removeEventListener('click', handler))
  })
}
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity .15s ease, transform .15s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(.96);
  transform-origin: top right;
}
</style>
