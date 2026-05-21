export const useThemeInit = () => {
  if (import.meta.server) return
  const store = useQuizStore()
  document.documentElement.classList.toggle('dark', store.theme === 'dark')
}

export const toggleTheme = () => {
  const store = useQuizStore()
  store.setTheme(store.theme === 'dark' ? 'light' : 'dark')
}
