import { eq } from 'drizzle-orm'
import { auth } from '~~/server/utils/auth'
import { db, schema } from '~~/server/db'

interface SyncPayload {
  history?: Record<string, unknown>
  wrong?: Record<string, unknown>
  mark?: Record<string, unknown>
  updatedAt?: number
}

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<SyncPayload>(event)
  const incomingTs = Number(body?.updatedAt) || Date.now()

  const existing = await db.query.quizState.findFirst({
    where: eq(schema.quizState.userId, session.user.id),
  })

  // 乐观锁:若云端更新,把云端数据返回让客户端再合并
  if (existing && existing.updatedAt > incomingTs) {
    return {
      ok: false,
      conflict: true,
      remote: {
        history: safeParse(existing.historyJson),
        wrong: safeParse(existing.wrongJson),
        mark: safeParse(existing.markJson),
        updatedAt: existing.updatedAt,
      },
    }
  }

  const historyJson = JSON.stringify(body?.history ?? {})
  const wrongJson = JSON.stringify(body?.wrong ?? {})
  const markJson = JSON.stringify(body?.mark ?? {})

  if (existing) {
    await db
      .update(schema.quizState)
      .set({ historyJson, wrongJson, markJson, updatedAt: incomingTs })
      .where(eq(schema.quizState.userId, session.user.id))
  } else {
    await db.insert(schema.quizState).values({
      userId: session.user.id,
      historyJson,
      wrongJson,
      markJson,
      updatedAt: incomingTs,
    })
  }

  return { ok: true, conflict: false, updatedAt: incomingTs }
})

function safeParse(s: string): Record<string, unknown> {
  try {
    const v = JSON.parse(s)
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}
