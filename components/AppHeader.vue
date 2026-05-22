<template>
  <header
    class="sticky top-0 z-30 border-b"
    style="background: var(--bg-elev); border-color: var(--line);"
  >
    <div class="max-w-[1080px] mx-auto flex items-center gap-3 px-5 sm:px-6 h-14">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0" aria-label="习概练习 · 首页">
        <span
          class="w-9 h-9 rounded grid place-items-center"
          style="background: var(--brand); color: var(--fg-on-brand);"
          aria-hidden="true"
        >
          <Icon name="lucide:book-open-text" class="w-5 h-5" />
        </span>
        <span class="flex flex-col leading-tight">
          <strong class="text-[15px] font-bold tracking-tight">习概练习</strong>
          <em class="text-[10px] text-faint not-italic tracking-wider uppercase">2025 NOTES</em>
        </span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex gap-1 mx-auto" aria-label="主导航">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="['nav-link', isActive(link.to) ? 'nav-link--active' : '']"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          <Icon :name="`lucide:${link.icon}`" class="w-4 h-4" aria-hidden="true" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-1.5 ml-auto md:ml-0">
        <UserMenu />
        <ThemeToggle />
        <button
          @click="mobileOpen = !mobileOpen"
          class="md:hidden w-9 h-9 rounded grid place-items-center"
          style="background: var(--bg-elev-2);"
          :aria-label="mobileOpen ? '关闭导航菜单' : '打开导航菜单'"
          :aria-expanded="mobileOpen"
        >
          <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Teleport to="body">
      <Transition name="page">
        <div
          v-if="mobileOpen"
          class="md:hidden fixed inset-0 z-40"
          style="background: rgba(26, 26, 26, .4);"
          @click="mobileOpen = false"
          aria-hidden="true"
        >
          <div
            class="absolute top-16 right-4 p-2 flex flex-col gap-0.5 w-48 rounded-lg"
            style="background: var(--bg-elev); border: 1px solid var(--line-strong);"
            @click.stop
          >
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              @click="mobileOpen = false"
              :class="['nav-link justify-start', isActive(link.to) ? 'nav-link--active' : '']"
              :aria-current="isActive(link.to) ? 'page' : undefined"
            >
              <Icon :name="`lucide:${link.icon}`" class="w-4 h-4" aria-hidden="true" />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const mobileOpen = ref(false)

const links = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/chapters', label: '章节练习', icon: 'layout-grid' },
  { to: '/kp', label: '知识点', icon: 'book-marked' },
  { to: '/wrong', label: '错题本', icon: 'alert-circle' },
  { to: '/stats', label: '统计', icon: 'bar-chart-3' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>
