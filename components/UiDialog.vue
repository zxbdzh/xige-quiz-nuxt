<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="dialog-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.self="onCancel"
      >
        <div
          ref="panel"
          class="dialog-panel"
          tabindex="-1"
          @keydown.esc="onCancel"
        >
          <h2 :id="titleId" class="text-[16px] font-bold m-0 mb-2">
            {{ title }}
          </h2>
          <p v-if="description" class="text-[14px] text-mute m-0 mb-5">{{ description }}</p>
          <div class="flex gap-2 justify-end">
            <button ref="cancelBtn" class="btn btn--ghost btn--sm" @click="onCancel">
              {{ cancelText }}
            </button>
            <button
              class="btn btn--sm"
              :class="danger ? 'btn--danger' : ''"
              @click="onConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  open: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  confirmText: '确认',
  cancelText: '取消',
  danger: false,
  open: false,
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const uid = useId()
const titleId = `dialog-title-${uid}`
const panel = ref<HTMLElement | null>(null)
const cancelBtn = ref<HTMLElement | null>(null)

// 首次 open 时聚焦确认按钮
watch(() => props.open, (val) => {
  if (val) {
    nextTick(() => cancelBtn.value?.focus())
  }
})

function onConfirm() { emit('confirm') }
function onCancel() { emit('cancel') }
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  background: rgba(26, 26, 26, .45);
  @apply grid place-items-center p-4;
}
.dialog-panel {
  background: var(--bg-elev);
  border: 1px solid var(--line-strong);
  @apply rounded-lg p-6 w-full max-w-sm;
}
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity .15s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
