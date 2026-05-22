<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
    <div class="card !p-7 sm:!p-8 w-full max-w-[420px]">
      <div class="text-center mb-6">
        <div
          class="w-12 h-12 mx-auto mb-3 rounded-2xl grid place-items-center text-white shadow-brand"
          style="background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%);"
        >
          <Icon name="lucide:log-in" class="w-6 h-6" />
        </div>
        <h1 class="text-h1 m-0">欢迎回来</h1>
        <p class="section-sub mt-1.5">登录后云端自动备份你的刷题进度</p>
      </div>

      <form class="space-y-3.5" @submit.prevent="onSubmit">
        <div>
          <label class="overline text-mute mb-1.5 block">邮箱</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label class="overline text-mute mb-1.5 block">密码</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            minlength="6"
            class="input"
            placeholder="至少 6 位"
          />
        </div>

        <p v-if="error" class="text-err text-caption flex items-center gap-1.5">
          <Icon name="lucide:alert-circle" class="w-3.5 h-3.5" />
          {{ error }}
        </p>

        <button type="submit" class="btn btn--block btn--lg" :disabled="loading">
          <Spinner v-if="loading" :size="16" />
          <Icon v-else name="lucide:log-in" class="w-4 h-4" />
          登录
        </button>
      </form>

      <div v-if="hasGithub" class="my-4 flex items-center gap-3">
        <div class="flex-1 border-t border-line" />
        <span class="text-caption text-faint">或</span>
        <div class="flex-1 border-t border-line" />
      </div>

      <button
        v-if="hasGithub"
        class="btn btn--outline btn--block btn--lg"
        :disabled="loading"
        @click="onGithub"
      >
        <Icon name="lucide:github" class="w-4 h-4" />
        使用 GitHub 登录
      </button>

      <p class="text-center text-caption text-mute mt-5">
        还没有账号?
        <NuxtLink to="/signup" class="text-brand font-medium hover:underline">立即注册</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

definePageMeta({ layout: 'default' })
useHead({ title: '登录' })

const config = useRuntimeConfig()
const hasGithub = computed(() => !!config.public.hasGithubOAuth)

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await authClient.signIn.email({
      email: email.value.trim(),
      password: password.value,
    })
    if (res.error) {
      error.value = res.error.message || '登录失败,请检查邮箱或密码'
      return
    }
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

async function onGithub() {
  loading.value = true
  try {
    await authClient.signIn.social({ provider: 'github', callbackURL: '/' })
  } catch (e: any) {
    error.value = e?.message || 'GitHub 登录失败'
    loading.value = false
  }
}
</script>
