<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-8 px-4">
    <AuthCard
      title="欢迎回来"
      subtitle="登录后云端自动备份你的刷题进度"
      footer-prompt="还没有账号?"
      :footer-link="{ to: '/signup', label: '立即注册' }"
      :error="error"
      :loading="loading"
      :has-github="hasGithub"
      @submit="submit"
      @github="onGithub"
    >
      <div class="space-y-3.5">
        <div>
          <label for="login-email" class="overline text-mute mb-1.5 block">邮箱</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label for="login-password" class="overline text-mute mb-1.5 block">密码</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            minlength="6"
            class="input"
            placeholder="至少 6 位"
          />
        </div>
        <button type="submit" class="btn btn--block btn--lg" :disabled="loading">
          <Spinner v-if="loading" :size="16" />
          <Icon v-else name="lucide:log-in" class="w-4 h-4" aria-hidden="true" />
          登录
        </button>
      </div>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
const mode = ref<'login'>('login')
const { email, password, error, loading, hasGithub, submit, onGithub } = useEmailAuth({ mode })
useHead({ title: '登录' })
</script>
