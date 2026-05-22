# 服务器构建：源码构建，原生模块自动为当前平台编译
FROM node:22-alpine AS builder

ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

# 先安装构建工具链（alpine 需要 build-base 来编译 native modules）
RUN apk add --no-cache python3 make g++

# 使用国内镜像安装 pnpm
RUN npm install -g pnpm --registry=$NPM_REGISTRY

# 设置 npm 镜像
RUN pnpm config set registry $NPM_REGISTRY

COPY package.json pnpm-lock.yaml ./
COPY .npmrc .npmrc 2>/dev/null || true

# 安装依赖（包括 native 模块）
RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .

# 构建（会为当前平台编译 better-sqlite3）
RUN pnpm build

# ============ 运行阶段 ============
FROM node:22-alpine AS runner

WORKDIR /app

# 复制 node_modules（包含已编译的 native 模块）
COPY --from=builder /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder /app/.output ./.output

# 复制数据目录
COPY --from=builder /app/data ./data 2>/dev/null || true

EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
