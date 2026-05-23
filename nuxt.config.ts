// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  // SSR + Node server output
  ssr: true,
  nitro: {
    preset: 'node-server',
    // 让 server/data 下的文件以 `assets:data` 命名空间通过 useStorage 取用
    serverAssets: [
      { baseName: 'data', dir: 'server/data' },
    ],
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],

  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true,
    },
  },

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/tailwind.config.ts',
    exposeConfig: false,
    viewer: false,
  },

  app: {
    // 子路径部署:由 NUXT_APP_BASE_URL 驱动(如 /quiz/),默认根路径
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '习概练习题库 · 2025',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width,initial-scale=1' },
        { name: 'description', content: '《习近平新时代中国特色社会主义思想概论》自考练习题库,基于 2025 重点笔记自动生成' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      appName: '习概练习题库',
      version: '1.0.0',
      // 在 SSR 启动时根据环境变量判断 GitHub OAuth 是否启用,
      // 供 login / signup 页面决定是否显示 GitHub 入口
      hasGithubOAuth: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
  },

  // 这些路由强依赖 localStorage(进度、错题、收藏等),走 CSR 即可,
  // 避免 SSR/CSR 状态不一致导致 Vue hydration mismatch
  routeRules: {
    '/practice/**': { ssr: false },
    '/wrong': { ssr: false },
    '/stats': { ssr: false },
    // 登录 / 注册依赖 authClient,走 CSR 避免 hydration 抖动
    '/login': { ssr: false },
    '/signup': { ssr: false },
  },

  // 我们不用路由 manifest 预取,关掉避免 Nuxt 3.21 + pnpm 严格 hoisting 下
  // "#app-manifest" 虚拟模块解析时序问题
  experimental: {
    appManifest: false,
  },

  // 帮 Vite 显式跳过这个虚拟模块的预打包探测
  vite: {
    // 把 baseURL 固化为构建期常量,供模块级(无 Nuxt context)的 better-auth client 使用
    define: {
      __APP_BASE__: JSON.stringify(process.env.NUXT_APP_BASE_URL || '/'),
    },
    optimizeDeps: {
      exclude: ['#app-manifest'],
    },
  },
})
