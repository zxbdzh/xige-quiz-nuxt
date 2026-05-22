import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient({
  // baseURL 留空,默认走当前域名 /api/auth
})

export const { signIn, signUp, signOut, useSession } = authClient
