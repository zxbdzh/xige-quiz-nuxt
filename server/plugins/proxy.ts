// 让服务端 fetch 走出网代理。
// better-auth 的 GitHub OAuth 在回调阶段需要由服务器访问 github.com 换 token,
// 国内服务器直连会 ECONNREFUSED。设置 HTTPS_PROXY 后,这里把 undici 全局
// dispatcher 换成代理 agent(Node 22 的全局 fetch 默认不读代理环境变量)。
//
// 仅当存在代理环境变量时才动态 import undici:没配代理时(如本地 dev)
// 完全不触碰 undici,避免无谓依赖加载。
export default defineNitroPlugin(async () => {
  const proxy
    = process.env.HTTPS_PROXY
    || process.env.https_proxy
    || process.env.HTTP_PROXY
    || process.env.http_proxy

  if (!proxy) return

  try {
    // EnvHttpProxyAgent 会读取 HTTP(S)_PROXY / NO_PROXY,
    // NO_PROXY 可让 localhost、内网地址绕过代理直连。
    // undici 仅在生产镜像中安装(见 package.json 依赖),本地 node_modules 可能未同步,
    // 故用 string 类型的动态 specifier 绕过 TS 模块解析(运行时从 node_modules 解析)。
    const moduleName: string = 'undici'
    const { setGlobalDispatcher, EnvHttpProxyAgent } = await import(moduleName)
    setGlobalDispatcher(new EnvHttpProxyAgent())
    console.info('[proxy] 已启用出网代理:', proxy)
  } catch (err) {
    console.error('[proxy] 代理初始化失败:', err)
  }
})
