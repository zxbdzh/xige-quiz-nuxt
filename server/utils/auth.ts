import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, schema } from '~~/server/db'

const githubId = process.env.GITHUB_CLIENT_ID
const githubSecret = process.env.GITHUB_CLIENT_SECRET
const hasGithub = !!(githubId && githubSecret)

export const auth = betterAuth({
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

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 天
    updateAge: 60 * 60 * 24, // 每天滑动续期
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],

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
