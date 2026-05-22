import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient({
  // baseURL 留空,默认走当前域名 /api/auth
  account: {
    // 首次 OAuth 登录时自动创建账户，无需邮箱密码关联
    autoSignIn: true,
  },
})

export const { signIn, signUp, signOut, useSession } = authClient
