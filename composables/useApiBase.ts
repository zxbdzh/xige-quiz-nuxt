/**
 * 子路径部署下,所有内部 API 请求需带上 app.baseURL 前缀。
 * Nuxt 不会给 useFetch/$fetch 的绝对路径(/api/...)自动加 baseURL,
 * 这里集中暴露给 useFetch/$fetch 的 baseURL 选项使用。
 */
export const apiBaseURL = () => useRuntimeConfig().app.baseURL
