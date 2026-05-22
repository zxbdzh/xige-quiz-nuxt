# 多阶段构建：本地构建，只在容器内运行
FROM node:22-alpine AS runner

WORKDIR /app

COPY package.json package.json
RUN echo '{}' > package-lock.json

# 直接复制本地 .output 构建产物（本地运行 pnpm build 后再部署）
COPY .output ./.output

EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
