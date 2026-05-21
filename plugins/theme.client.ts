/**
 * 客户端启动时把当前 Pinia 中的主题应用到 <html class="dark"> 上,
 * 避免 SSR/CSR 切换瞬间样式抖动。
 */
export default defineNuxtPlugin(() => {
  const store = useQuizStore()
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', store.theme === 'dark')
  }
})
