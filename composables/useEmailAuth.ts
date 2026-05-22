import { authClient } from '~/lib/auth-client'

export type AuthMode = 'login' | 'signup'

interface UseEmailAuthOptions {
  mode: Ref<AuthMode>
}

export function useEmailAuth(opts: UseEmailAuthOptions) {
  const config = useRuntimeConfig()

  const email = ref('')
  const password = ref('')
  const name = ref('')
  const error = ref('')
  const loading = ref(false)

  const hasGithub = computed(() => config.public.hasGithubOAuth)

  async function submit() {
    error.value = ''
    if (!email.value || !password.value) {
      error.value = '请填写邮箱和密码'
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      error.value = '请输入有效的邮箱地址'
      return
    }
    if (password.value.length < 6) {
      error.value = '密码长度不能少于 6 位'
      return
    }
    if (opts.mode.value === 'signup' && !name.value.trim()) {
      error.value = '请填写昵称'
      return
    }

    loading.value = true
    try {
      if (opts.mode.value === 'signup') {
        await authClient.signUp.email({
          email: email.value,
          password: password.value,
          name: name.value.trim(),
        })
        await navigateTo('/')
      } else {
        await authClient.signIn.email({
          email: email.value,
          password: password.value,
        })
        await navigateTo('/')
      }
    } catch (e: any) {
      error.value = e?.message ?? '操作失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  async function onGithub() {
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
      })
    } catch (e: any) {
      error.value = e?.message ?? '第三方登录失败'
    }
  }

  return {
    email,
    password,
    name,
    error,
    loading,
    hasGithub,
    submit,
    onGithub,
  }
}
