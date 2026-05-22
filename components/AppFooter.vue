<template>
  <footer class="border-t mt-auto" style="border-color: var(--line); background: var(--bg-elev);">
    <div class="max-w-[1080px] mx-auto px-5 sm:px-6 py-10">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        <!-- 品牌 -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <span
              class="w-8 h-8 rounded grid place-items-center"
              style="background: var(--brand); color: var(--fg-on-brand);"
              aria-hidden="true"
            >
              <Icon name="lucide:book-open-text" class="w-4 h-4" />
            </span>
            <strong class="font-bold">习概练习题库</strong>
          </div>
          <p class="text-[13px] text-mute leading-relaxed m-0">
            基于《习近平新时代中国特色社会主义思想概论》2025 重点笔记,
            专为自考生设计的练习工具。
          </p>
        </div>

        <!-- 学习资源 -->
        <div>
          <h3 class="text-[13px] font-semibold mb-3">学习资源</h3>
          <ul class="space-y-2 text-[13px] text-mute list-none p-0 m-0">
            <li><NuxtLink to="/chapters" class="hover:text-fg transition-colors">章节练习</NuxtLink></li>
            <li><NuxtLink to="/kp" class="hover:text-fg transition-colors">知识点速览</NuxtLink></li>
            <li><NuxtLink to="/wrong" class="hover:text-fg transition-colors">错题本</NuxtLink></li>
            <li><NuxtLink to="/stats" class="hover:text-fg transition-colors">学习统计</NuxtLink></li>
          </ul>
        </div>

        <!-- 数据说明 -->
        <div>
          <h3 class="text-[13px] font-semibold mb-3">数据说明</h3>
          <ul class="space-y-2 text-[13px] text-mute list-none p-0 m-0">
            <li class="inline-flex items-center gap-1.5">
              <Icon name="lucide:database" class="w-3.5 h-3.5" aria-hidden="true" />
              进度存储于本地浏览器
            </li>
            <li class="inline-flex items-center gap-1.5">
              <Icon name="lucide:log-in" class="w-3.5 h-3.5" aria-hidden="true" />
              登录后支持跨设备同步
            </li>
            <li class="inline-flex items-center gap-1.5">
              <Icon name="lucide:shield-check" class="w-3.5 h-3.5" aria-hidden="true" />
              仅同步学习进度数据
            </li>
          </ul>
        </div>
      </div>

      <!-- 版权 -->
      <div class="pt-6 border-t flex flex-wrap items-center justify-between gap-2 text-[12px] text-faint" style="border-color: var(--line);">
        <span>© {{ year }} 习概练习题库 · 仅供学习参考</span>
        <span>{{ meta.data.value.totalMcq }} 题 · {{ meta.data.value.totalChapters }} 章</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
const meta = useBankMeta()
</script>
