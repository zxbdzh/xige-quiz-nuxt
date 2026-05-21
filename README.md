# 习概练习题库 · Nuxt 3 SSR

把《2025习概重点笔记.pdf》自动解析为可练习的 **选择题题库 + 知识点速览**,并提供一个基于 Nuxt 3 的 SSR 网页应用。

- 选择题:**198 道**(题干 / 4 选项 / 正确答案 / 笔记原版解析)
- 知识点:**428 条**,覆盖导论 + 17 章
- 技术栈:**Nuxt 3 (SSR) + TypeScript + Pinia (持久化到 localStorage) + Tailwind CSS**
- API:`/api/bank` `/api/meta` `/api/chapter/:id` `/api/random` `/api/questions?ids=...`(可作为前后端扩展点)
- 数据:用户进度 / 错题本 / 收藏 / 主题 全部保存在本地 localStorage

## 目录结构

```
xige-quiz-nuxt/
├─ app.vue                      # 应用根
├─ nuxt.config.ts               # SSR + node-server + serverAssets
├─ tailwind.config.ts           # 自定义品牌色与主题
├─ assets/css/main.css          # Tailwind + 自定义变量(亮/暗主题)
├─ components/
│  ├─ AppHeader.vue             # 顶栏 + 移动菜单
│  ├─ AppFooter.vue
│  ├─ ChapterCard.vue
│  ├─ QuestionCard.vue
│  └─ ThemeToggle.vue
├─ composables/
│  ├─ useBank.ts                # useFetch 封装(meta / bank / chapter / random / questions)
│  └─ useTheme.ts
├─ pages/
│  ├─ index.vue                 # 首页 hero + 章节概览
│  ├─ chapters.vue              # 全部章节
│  ├─ practice/[mode].vue       # 答题(mode: sequential|random|wrong,?ch=xxx)
│  ├─ kp/index.vue              # 知识点目录
│  ├─ kp/[id].vue               # 单章知识点
│  ├─ wrong.vue                 # 错题本
│  └─ stats.vue                 # 统计 + 导入导出
├─ plugins/theme.client.ts      # 客户端启动时同步 dark class
├─ server/
│  ├─ utils/bank.ts             # 题库加载(Nitro storage / 文件系统兜底)
│  ├─ data/bank.json            # 已生成的题库
│  └─ api/
│     ├─ bank.get.ts            # GET /api/bank
│     ├─ meta.get.ts            # GET /api/meta(轻量章节列表)
│     ├─ chapter/[id].get.ts    # GET /api/chapter/:id
│     ├─ random.get.ts          # GET /api/random?count=10&chapter=ch_一
│     └─ questions.get.ts       # GET /api/questions?ids=a,b,c
├─ stores/quiz.ts               # Pinia(history/wrong/mark/theme,持久化)
├─ types/bank.ts                # Bank / Mcq / Chapter 等类型
└─ tools/                       # PDF → 题库生成器(Python + pdfplumber)
   ├─ extract_pdf.py            # PDF → tools/raw_pages.json
   ├─ build_bank.py             # → server/data/bank.json
   ├─ analyze.py
   └─ peek.py
```

## 本地运行

需要 Node.js 18+ 和 pnpm。

```bash
cd xige-quiz-nuxt
pnpm install
pnpm dev               # 启动开发服务器 http://localhost:3000
```

> 如果遇到 `ERR_PNPM_IGNORED_BUILDS` 阻断,本仓库已在 `.npmrc` 关闭 `verify-deps-before-run`,以及在 `package.json` 配置了 `pnpm.onlyBuiltDependencies`。若仍报错,可直接用 `./node_modules/.bin/nuxt dev` 启动。

## 构建与生产部署

```bash
pnpm build             # 构建 SSR 产物(node-server preset)
pnpm preview           # 本地预览生产产物 http://localhost:3000
```

部署:把 `.output/` 上传到任意 Node 18+ 服务器,启动 `node .output/server/index.mjs` 即可。常见目标:

- 自建 Node 主机 / 容器
- Cloudflare Workers(改 `nitro.preset = 'cloudflare'`)
- Vercel(改 `nitro.preset = 'vercel'`)
- Netlify(改 `nitro.preset = 'netlify'`)

## 数据流

```
PDF (《2025习概重点笔记.pdf》)
   │  python tools/extract_pdf.py
   ▼
tools/raw_pages.json
   │  python tools/build_bank.py
   ▼
server/data/bank.json   (198 道题 + 428 知识点)
   │  /api/bank  /api/meta  /api/chapter/:id ...
   ▼
浏览器(Vue 组件 + Pinia 状态)
   │  localStorage 持久化
   ▼
错题本 / 进度 / 主题
```

## 重新生成题库

```bash
pip install pdfplumber       # 一次性
# 修改 tools/extract_pdf.py 中的 PDF 路径
python tools/extract_pdf.py
python tools/build_bank.py
# 产物:server/data/bank.json
```

可以一次跑完:`pnpm build:bank`。

## 后续扩展示例

由于走的是 SSR,可以直接在 `server/api/` 下增加接口,例如:

- `POST /api/progress`:把 history/wrong 写入数据库
- `GET /api/leaderboard`:正确率排行榜
- `POST /api/feedback`:用户反馈题目错误

也可以接入第三方:在客户端 fetch `https://your-supabase.com/...`,SSR 模式下浏览器 / 服务器都可以发起请求。

## 键盘操作

答题页支持:

- `A` / `B` / `C` / `D`:选答
- `Enter` / `→`:下一题
- `←`:上一题

## License

仅用于个人学习用途。
