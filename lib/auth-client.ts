import { createAuthClient } from 'better-auth/vue'

// __APP_BASE__ 由 nuxt.config 的 vite.define 在构建期注入(= NUXT_APP_BASE_URL)
declare const __APP_BASE__: string
const rawBase = typeof __APP_BASE__ !== 'undefined' ? __APP_BASE__ : '/'
// 子路径下的 auth 端点,如 /quiz/api/auth(浏览器自动补当前 origin)
const authBase = (rawBase === '/' ? '' : rawBase.replace(/\/+$/, '')) + '/api/auth'

export const authClient = createAuthClient({
  baseURL: authBase,
  account: {
    // 首次 OAuth 登录时自动创建账户，无需邮箱密码关联
    autoSignIn: true,
  },
})

export const { signIn, signUp, signOut, useSession } = authClient
