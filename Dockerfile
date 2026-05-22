# ============ 构建阶段 ============
FROM node:22-alpine AS builder
ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

# 使用国内镜像安装 pnpm
RUN npm install -g pnpm --registry=$NPM_REGISTRY

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --registry=$NPM_REGISTRY

# 复制源码并构建
COPY . .
RUN pnpm build

# ============ 运行阶段 ============
FROM node:22-alpine AS runner
ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

# 使用 npm 安装生产依赖
RUN npm install -g pnpm --registry=$NPM_REGISTRY

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --registry=$NPM_REGISTRY

# 复制构建产物
COPY --from=builder /app/.output ./.output

# 复制数据目录（如果存在）
COPY --from=builder /app/data ./data 2>/dev/null || true

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtapp && \
    chown -R nuxtapp:nodejs /app
USER nuxtapp

EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
