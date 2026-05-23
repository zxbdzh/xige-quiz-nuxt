# ============ 构建阶段 ============
# 目标平台: linux/amd64 (Alpine)
FROM node:22-alpine AS builder

ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

# 换 apk 国内源(否则从境外拉取 gcc 工具链极慢),再装构建工具
RUN sed -i 's#dl-cdn.alpinelinux.org#mirrors.aliyun.com#g' /etc/apk/repositories \
 && apk add --no-cache python3 make g++

# 安装 pnpm（利用 Docker 缓存层）
# 使用 pnpm@9 避免 v11 的构建脚本批准问题
RUN npm install -g pnpm@9 --registry=$NPM_REGISTRY

# 设置 npm 镜像
RUN pnpm config set registry $NPM_REGISTRY

# ===== 利用 Docker 层缓存: 只在 lock 文件变化时重新安装 =====
# 步骤1: 复制 lock 文件并安装依赖
COPY package.json pnpm-lock.yaml .npmrc ./
RUN touch .npmrc 2>/dev/null || true
RUN pnpm install --frozen-lockfile

# 步骤2: 复制源码并构建（依赖不变时跳过）
COPY . .

# 确保 shamefully-hoist 配置在构建时生效
RUN echo 'shamefully-hoist=true' >> .npmrc 2>/dev/null || true

# 子路径部署前缀(改路径只需改这里 + runner ENV + docker-compose + nginx)
ENV NUXT_APP_BASE_URL=/quiz/

# 构建（会为 linux 平台编译 better-sqlite3）
RUN npx nuxt build

# ============ 运行阶段 ============
FROM node:22-alpine AS runner

LABEL maintainer="xige-quiz"

WORKDIR /app

# 换 apk 国内源后安装 dumb-init（优雅处理 PID 1 信号）
RUN sed -i 's#dl-cdn.alpinelinux.org#mirrors.aliyun.com#g' /etc/apk/repositories \
 && apk add --no-cache dumb-init

# 复制 node_modules（包含已编译的 better-sqlite3）
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder --chown=node:node /app/.output ./.output

# 创建数据目录（持久化 SQLite）
RUN mkdir -p data && chown -R node:node data

USER node

EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
# 子路径前缀(Nitro / better-auth 服务端运行时读取),需与构建期一致
ENV NUXT_APP_BASE_URL=/quiz/

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/quiz/api/meta || exit 1

# 使用 dumb-init 优雅处理信号
CMD ["dumb-init", "node", ".output/server/index.mjs"]
