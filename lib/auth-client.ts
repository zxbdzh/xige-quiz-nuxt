import { createAuthClient } from 'better-auth/vue'

// baseURL 留空,默认走当前域名 /api/auth
// (账户自动创建 / OAuth autoSignIn 等行为均在 server/utils/auth.ts 配置)
export const authClient = createAuthClient({})

export const { signIn, signUp, signOut, useSession } = authClient
