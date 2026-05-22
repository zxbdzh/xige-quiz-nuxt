# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

习概练习题库 — 基于 Nuxt 3 SSR 的《习近平新时代中国特色社会主义思想概论》自考练习工具,包含选择题练习、知识点速览、错题本、云端同步。

## 开发命令

```bash
pnpm dev          # 开发服务器
pnpm build        # 生产构建
pnpm preview      # 预览构建产物
pnpm typecheck    # vue-tsc 类型检查
pnpm postinstall  # nuxt prepare(自动运行)
pnpm db:generate  # drizzle 生成迁移
pnpm db:migrate   # drizzle 执行迁移
pnpm db:studio    # drizzle 可视化
```

## 架构概览

### 目录结构
```
assets/css/main.css    # CSS 变量设计 token (墨纸专注风)
tailwind.config.ts     # Tailwind 配置,CSS 变量映射到语义色
app.vue               # 根组件,防 FOUC inline script
composables/
  useBank.ts          # 数据入口(useBank/useBankMeta/useChapter/fetchRandom/fetchQuestions)
  useChapterLabel.ts   # 全站唯一章节标签真源(chapterLabel/chapterShort)
  usePracticeSession.ts# 答题状态机(队列/作答/完成统计)
  useCloudSync.ts     # 云端同步单例
  useEmailAuth.ts      # 登录/注册表单逻辑
  useConfirm.ts        # 全局对话框(替代原生 confirm/alert)
  useImportValidation.ts# 导入 JSON 轻校验
stores/quiz.ts        # Pinia store,localStorage 持久化
components/
  QuestionCard.vue    # 答题卡片,支持只读模式(错题本复用)
  ChapterCard.vue      # 章节卡片
  AppHeader.vue       # 导航头
  UiProgress.vue      # 线性进度条(role=progressbar+ARIA)
  UiProgressRing.vue  # 环形进度(useId 防 SSR mismatch)
  UiDialog.vue        # 对话框(受控组件)
  AppDialogHost.vue   # 全局对话框宿主
  AuthCard.vue        # 登录/注册卡片骨架
  SyncStatus.vue      # 同步状态指示器
  ThemeToggle.vue      # 明暗切换
  EmptyState.vue      # 空状态
  Spinner.vue         # 加载圈
  SkeletonCard.vue     # 骨架屏
pages/
  index.vue           # 首页(刊头 masthead + KPI + 章节概览)
  chapters.vue        # 章节列表(tablist 过滤器)
  practice/[mode].vue # 答题页(sequential/random/wrong)
  kp/index.vue        # 知识点目录
  kp/[id].vue         # 知识点详情(锚点目录)
  wrong.vue           # 错题本(复用 QuestionCard 只读态)
  stats.vue           # 学习统计
  login.vue / signup.vue # 认证页
server/
  api/bank.get.ts     # 全量题库(SSR 缓存)
  api/meta.get.ts      # 轻量元信息
  api/chapter/[id].get.ts
  api/random.get.ts    # 服务端随机抽题(练习页 random 模式用)
  api/questions.get.ts # 批量取题
  api/sync/state.{get,post}.ts # 云端同步
  api/auth/[...all].ts # better-auth 路由代理
  db/schema.ts         # Drizzle schema(users/sessions/accounts/quiz_state)
  utils/bank.ts       # 题库加载与缓存
```

### 关键契约

**数据模型**(types/bank.ts, 不改动):
- `Mcq`: `{id, no, stem, options{A/B/C/D}, answer, explain, chapterId?}`
- `Chapter`: `{id, no, title, mcq[], kps:{title, points[]}[]}`
- `Letter`: `'A'|'B'|'C'|'D'`
- `ChapterSummary`: `{id, no, title, mcqCount, kpCount}` — **kpCount 是 points 总数,非 kps 条目数**

**章节标签**:全站统一用 `useChapterLabel()` — `no < 1 ⇒ 导论`,其余 `第 N 章`(N = no)。**禁止**在组件内手写章号逻辑。

**Pinia store**(stores/quiz.ts): 云同步依赖 `store.updatedAt`、`store.history`、`store.wrong`、`store.mark` 的响应式。修改时不得破坏这些 getter/action。

**useCloudSync**: 模块级单例,依赖 session watch 和 `store.updatedAt` watch。不得改为多例。

### 墨纸专注风设计 token

全局 CSS 变量在 `assets/css/main.css`:root 定义亮色,.dark 定义暗色。**全站组件用 `var(--xxx)` 而非写死 hex 值**。

亮色强调色: `#1F6F50`(墨绿); 暗色: `#5FB98F`。**全站单一强调色,不要引入第三彩色**。

## 可访问性要点

- 答题选项按钮: `aria-pressed` + `aria-label`
- 进度条: `role="progressbar"` + `aria-valuenow/min/max`
- 过滤器: `role="tablist"` / `role="tab"` + `aria-selected` + 左右键切换
- 图标按钮: `aria-label`
- skip-link: `#main` 跳转
- 对话框: `role="dialog"` + 焦点陷阱 + Esc
- 尊重 `prefers-reduced-motion`
