<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-8 px-4">
    <AuthCard
      title="创建账号"
      subtitle="本地进度会在注册成功后同步到云端"
      footer-prompt="已有账号?"
      :footer-link="{ to: '/login', label: '立即登录' }"
      :error="error"
      :loading="loading"
      :has-github="hasGithub"
      @submit="submit"
      @github="onGithub"
    >
      <div class="space-y-3.5">
        <div>
          <label for="signup-name" class="overline text-mute mb-1.5 block">昵称</label>
          <input
            id="signup-name"
            v-model="name"
            type="text"
            autocomplete="nickname"
            required
            maxlength="32"
            class="input"
            placeholder="你想被怎么称呼"
          />
        </div>
        <div>
          <label for="signup-email" class="overline text-mute mb-1.5 block">邮箱</label>
          <input
            id="signup-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label for="signup-password" class="overline text-mute mb-1.5 block">密码</label>
          <input
            id="signup-password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="6"
            class="input"
            placeholder="至少 6 位"
          />
        </div>
        <button type="submit" class="btn btn--block btn--lg" :disabled="loading">
          <Spinner v-if="loading" :size="16" />
          <Icon v-else name="lucide:user-plus" class="w-4 h-4" aria-hidden="true" />
          注册并登录
        </button>
      </div>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
const mode = ref<'signup'>('signup')
const { email, password, name, error, loading, hasGithub, submit, onGithub } = useEmailAuth({ mode })
useHead({ title: '注册' })
</script>
