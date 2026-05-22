interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

interface DialogState {
  title: string
  description: string
  confirmText: string
  cancelText: string
  danger: boolean
}

// 模块级单例状态
const state = reactive<DialogState>({
  title: '',
  description: '',
  confirmText: '确认',
  cancelText: '取消',
  danger: false,
})

const open = ref(false)
const resolveRef = ref<((value: boolean) => void) | null>(null)

export function useConfirm() {
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    Object.assign(state, {
      title: opts.title,
      description: opts.description ?? '',
      confirmText: opts.confirmText ?? '确认',
      cancelText: opts.cancelText ?? '取消',
      danger: opts.danger ?? false,
    })
    open.value = true
    return new Promise((res) => {
      resolveRef.value = res
    })
  }

  function resolveDialog(result: boolean) {
    open.value = false
    resolveRef.value?.(result)
    resolveRef.value = null
  }

  return { confirm, state, open, resolveDialog }
}
