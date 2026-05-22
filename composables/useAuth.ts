import { createAuthClient } from 'better-auth/vue'

/**
 * 请求作用域 auth client,SSR 安全。
 * SSR 时把 cookie 转发到 better-auth handler,这样 useSession 在服务端能拿到登录状态。
 *
 * 客户端组件里如果只需要 sign-in/out 等命令式方法,直接用 `lib/auth-client.ts` 的全局实例更简单。
 * 在页面 setup 里用 await authClient.useSession(useFetch) 即可正确 SSR/hydrate。
 */
export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  return createAuthClient({
    baseURL: url.origin,
    fetchOptions: { headers },
  })
}
