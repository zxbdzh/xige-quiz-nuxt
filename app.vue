<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 w-full max-w-[1080px] mx-auto px-5 py-7 sm:px-6">
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const meta = useBankMeta()

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
      rel: 'icon',
      href: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 stop-color=%22%232563EB%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%2306B6D4%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22url(%23g)%22/%3E%3Ctext x=%2250%22 y=%2270%22 text-anchor=%22middle%22 font-size=%2258%22 fill=%22white%22 font-family=%22sans-serif%22 font-weight=%22700%22%3E%E4%B9%A0%3C/text%3E%3C/svg%3E',
    },
  ],
})

// 调用 meta 以便 SSR 时预热数据(footer 用到)
void meta
</script>
