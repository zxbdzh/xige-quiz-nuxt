<template>
  <footer class="border-t border-line mt-10" style="background: var(--bg-elev);">
    <div class="max-w-[1080px] mx-auto px-5 sm:px-6 py-7 grid gap-6 sm:grid-cols-3 text-[13px]">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span
            class="w-7 h-7 rounded-lg grid place-items-center text-white"
            style="background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%);"
          >
            <Icon name="lucide:book-open-text" class="w-4 h-4" />
          </span>
          <strong class="text-[14px] font-semibold">习概练习题库</strong>
        </div>
        <p class="text-faint leading-relaxed m-0">
          基于《2025习概重点笔记》自动生成的自考练习题库,共 {{ meta.data.value.totalMcq }} 题 / {{ meta.data.value.totalChapters }} 章。
        </p>
      </div>

      <div>
        <div class="overline mb-2.5">学习资源</div>
        <ul class="space-y-1.5 m-0 p-0 list-none">
          <li><NuxtLink to="/chapters" class="text-mute hover:text-brand">章节练习</NuxtLink></li>
          <li><NuxtLink to="/kp" class="text-mute hover:text-brand">知识点速览</NuxtLink></li>
          <li><NuxtLink to="/practice/random?ch=all" class="text-mute hover:text-brand">随机刷题</NuxtLink></li>
        </ul>
      </div>

      <div>
        <div class="overline mb-2.5">数据 & 隐私</div>
        <ul class="space-y-1.5 m-0 p-0 list-none">
          <li class="text-mute inline-flex items-center gap-1.5">
            <Icon name="lucide:database" class="w-3.5 h-3.5" />
            进度存储于本地 localStorage
          </li>
          <li class="text-mute inline-flex items-center gap-1.5">
            <Icon name="lucide:shield-check" class="w-3.5 h-3.5" />
            不收集任何个人数据
          </li>
          <li><NuxtLink to="/stats" class="text-mute hover:text-brand inline-flex items-center gap-1.5">
            <Icon name="lucide:download" class="w-3.5 h-3.5" />
            导出 / 导入进度
          </NuxtLink></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-line">
      <div class="max-w-[1080px] mx-auto px-5 sm:px-6 py-3 flex flex-wrap items-center gap-3 text-[11px] text-faint">
        <span>© {{ new Date().getFullYear() }} 习概练习题库 · 仅供个人学习</span>
        <span class="ml-auto inline-flex items-center gap-1">
          <Icon name="lucide:heart" class="w-3 h-3" />
          Built with Nuxt 3
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const meta = useBankMeta()
</script>
