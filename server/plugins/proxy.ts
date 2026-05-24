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
    //
    // 解析锚点必须是运行时 cwd(容器内 /app),不能让 Node 从打包后的
    // .output/server/chunks/nitro/nitro.mjs 自行上溯——那条路径上有 Nitro
    // 生成的残缺 .output/server/node_modules/undici(只有壳没有入口),会报
    // Cannot find package。Dockerfile 把完整 node_modules 拷到 /app/node_modules,
    // 这里用 createRequire(cwd) 拿到 undici 真身的绝对路径再 import。
    const { createRequire } = await import('node:module')
    const { pathToFileURL } = await import('node:url')
    const { join } = await import('node:path')

    const req = createRequire(join(process.cwd(), 'index.js'))
    const undiciEntry = req.resolve('undici')
    const { setGlobalDispatcher, EnvHttpProxyAgent } = await import(pathToFileURL(undiciEntry).href)
    setGlobalDispatcher(new EnvHttpProxyAgent())
    console.info('[proxy] 已启用出网代理:', proxy)
  } catch (err) {
    console.error('[proxy] 代理初始化失败:', err)
  }
})
