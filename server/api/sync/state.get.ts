import { eq } from 'drizzle-orm'
import { auth } from '~~/server/utils/auth'
import { db, schema } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const row = await db.query.quizState.findFirst({
    where: eq(schema.quizState.userId, session.user.id),
  })

  if (!row) {
    return {
      history: {},
      wrong: {},
      mark: {},
      updatedAt: 0,
    }
  }

  return {
    history: safeParse(row.historyJson),
    wrong: safeParse(row.wrongJson),
    mark: safeParse(row.markJson),
    updatedAt: row.updatedAt,
  }
})

function safeParse(s: string): Record<string, unknown> {
  try {
    const v = JSON.parse(s)
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}
