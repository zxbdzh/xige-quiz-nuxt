import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, schema } from '~~/server/db'

const githubId = process.env.GITHUB_CLIENT_ID
const githubSecret = process.env.GITHUB_CLIENT_SECRET
const hasGithub = !!(githubId && githubSecret)

// 应用对外 origin(纯域名,不含子路径)与子路径前缀
const origin = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
const appBase = process.env.NUXT_APP_BASE_URL || '/'
// better-auth 路由在子路径下的实际挂载点,如 /quiz/api/auth
const authBasePath = (appBase === '/' ? '' : appBase.replace(/\/+$/, '')) + '/api/auth'

export const auth = betterAuth({
  // origin + 子路径下的实际挂载点(/quiz/api/auth),用于生成正确的 OAuth callback
  baseURL: origin,
  basePath: authBasePath,

  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },

  socialProviders: hasGithub
    ? {
        github: {
          clientId: githubId!,
          clientSecret: githubSecret!,
        },
      }
    : undefined,

  // OAuth 自动关联同邮箱的已有账户
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['email-password', 'github'],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 天
    updateAge: 60 * 60 * 24, // 每天滑动续期
  },

  trustedOrigins: [origin],

  advanced: {
    cookies: {
      session_token: {
        attributes: {
          sameSite: 'lax',
        },
      },
    },
  },
})

export const hasGithubOAuth = hasGithub
