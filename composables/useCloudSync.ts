import { authClient } from '~/lib/auth-client'
import type { RemoteSnapshot } from '~/stores/quiz'

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced' | 'error' | 'offline'

const DEBOUNCE_MS = 2000

interface UseCloudSyncReturn {
  status: Ref<SyncStatus>
  lastSyncedAt: Ref<number>
  syncNow: () => Promise<void>
  pullFromCloud: () => Promise<void>
}

let _instance: UseCloudSyncReturn | null = null

/**
 * 单例 cloud sync,在 app.vue 调用一次即可。
 * 客户端逻辑:
 *  - session 变化 null→user:拉取云端 → 与本地合并 → 立即 push 一次
 *  - store.isDirty 变 true:debounce 2s 后 push
 *  - 冲突(server 返回 conflict=true):再 merge 远端,再 push
 */
export function useCloudSync(): UseCloudSyncReturn {
  if (_instance) return _instance

  const status = ref<SyncStatus>('idle')
  const lastSyncedAt = ref<number>(0)

  if (import.meta.server) {
    // SSR 阶段不挂任何 watcher,直接给个 stub
    _instance = {
      status,
      lastSyncedAt,
      syncNow: async () => {},
      pullFromCloud: async () => {},
    }
    return _instance
  }

  const store = useQuizStore()
  const session = authClient.useSession()

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function currentUserId(): string | null {
    const s = session.value as { data?: { user?: { id?: string } } } | null
    return s?.data?.user?.id ?? null
  }

  function scheduleSync() {
    if (!currentUserId()) return
    if (debounceTimer) clearTimeout(debounceTimer)
    status.value = 'pending'
    debounceTimer = setTimeout(() => {
      void pushToCloud()
    }, DEBOUNCE_MS)
  }

  async function pushToCloud() {
    if (!currentUserId()) return
    status.value = 'syncing'
    try {
      const ts = store.updatedAt || Date.now()
      const res = await $fetch<{
        ok: boolean
        conflict: boolean
        updatedAt?: number
        remote?: RemoteSnapshot
      }>('/api/sync/state', {
        method: 'POST',
        baseURL: apiBaseURL(),
        body: {
          history: store.history,
          wrong: store.wrong,
          mark: store.mark,
          updatedAt: ts,
        },
      })

      if (res.conflict && res.remote) {
        // 远端较新,合并后再 push 一次
        store.mergeFromCloud(res.remote)
        // 立刻再推,跳过 debounce
        await pushToCloud()
        return
      }

      const serverTs = res.updatedAt ?? ts
      store.markSynced(serverTs)
      lastSyncedAt.value = serverTs
      status.value = 'synced'
    } catch (err) {
      console.error('[useCloudSync] push failed:', err)
      status.value = 'error'
    }
  }

  async function pullFromCloud() {
    if (!currentUserId()) return
    status.value = 'syncing'
    try {
      const remote = await $fetch<RemoteSnapshot>('/api/sync/state', { baseURL: apiBaseURL() })
      const hasLocal =
        store.updatedAt > 0 ||
        Object.keys(store.history).length > 0 ||
        Object.keys(store.wrong).length > 0 ||
        Object.keys(store.mark).length > 0

      if (!hasLocal) {
        // 本地完全空白 → 全量覆盖
        store.applyFromCloud(remote)
      } else {
        // 本地有数据 → per-record 合并
        store.mergeFromCloud(remote)
      }
      // 把合并结果立即推回,统一两端
      await pushToCloud()
    } catch (err) {
      console.error('[useCloudSync] pull failed:', err)
      status.value = 'error'
    }
  }

  // session 从无到有(登录成功)→ 触发 pull + merge + push
  let prevUserId: string | null = null
  watch(
    () => currentUserId(),
    async (uid) => {
      if (uid && uid !== prevUserId) {
        prevUserId = uid
        await pullFromCloud()
      } else if (!uid && prevUserId) {
        // 退出登录:不删除本地数据(用户仍可匿名练习)
        prevUserId = null
        status.value = 'idle'
      }
    },
    { immediate: true }
  )

  // 本地数据变更 → debounce push
  watch(
    () => store.updatedAt,
    (now, prev) => {
      if (!currentUserId()) return
      if (now && now > (prev || 0) && now > store.cloudUpdatedAt) {
        scheduleSync()
      }
    }
  )

  // 离线 / 在线监听
  if (typeof window !== 'undefined') {
    window.addEventListener('offline', () => {
      if (status.value === 'syncing' || status.value === 'pending') {
        status.value = 'offline'
      }
    })
    window.addEventListener('online', () => {
      if (currentUserId() && store.isDirty) scheduleSync()
    })
  }

  _instance = {
    status,
    lastSyncedAt,
    syncNow: async () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      await pushToCloud()
    },
    pullFromCloud,
  }
  return _instance
}

