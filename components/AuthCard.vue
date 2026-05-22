<template>
  <div class="card max-w-sm mx-auto" style="width: 100%;">
    <!-- Logo mark -->
    <div class="flex justify-center mb-6">
      <span
        class="w-12 h-12 rounded-lg grid place-items-center"
        style="background: var(--brand); color: var(--fg-on-brand);"
        aria-hidden="true"
      >
        <Icon name="lucide:book-open-text" class="w-6 h-6" />
      </span>
    </div>

    <!-- Title -->
    <h1 class="text-center text-[20px] font-bold mb-1">{{ title }}</h1>
    <p class="text-center text-[13px] text-mute mb-6">{{ subtitle }}</p>

    <!-- Error -->
    <div
      v-if="error"
      class="mb-4 px-4 py-3 rounded-md text-[13px]"
      style="background: var(--err-soft); color: var(--err); border: 1px solid var(--err);"
      role="alert"
    >
      {{ error }}
    </div>

    <!-- Form slot -->
    <form @submit.prevent="onSubmit" novalidate>
      <slot />
    </form>

    <!-- GitHub OAuth -->
    <div v-if="hasGithub" class="relative my-5">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t" style="border-color: var(--line);" />
      </div>
      <div class="relative flex justify-center text-[12px]">
        <span class="px-3" style="background: var(--bg-elev); color: var(--fg-faint);">或</span>
      </div>
    </div>
    <button
      v-if="hasGithub"
      type="button"
      class="btn btn--outline btn--block mb-4"
      :disabled="loading"
      @click="onGithub"
    >
      <Icon name="lucide:github" class="w-4 h-4" aria-hidden="true" />
      使用 GitHub 登录
    </button>

    <!-- Footer link -->
    <p class="text-center text-[13px] text-mute">
      {{ footerPrompt }}
      <NuxtLink :to="footerLink.to" class="font-medium hover:underline" style="color: var(--brand);">
        {{ footerLink.label }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
interface FooterLink { to: string; label: string }

defineProps<{
  title: string
  subtitle: string
  footerPrompt: string
  footerLink: FooterLink
  error: string
  loading: boolean
  hasGithub: boolean
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'github'): void
}>()

function onSubmit() { emit('submit') }
function onGithub() { emit('github') }
</script>
