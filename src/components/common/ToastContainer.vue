<script setup>
import { useToastStore } from '../../stores/toast';

const toast = useToastStore();
</script>

<template>
  <section
    class="toast-container"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup name="toast-slide">
      <article
        v-for="t in toast.toasts"
        :key="t.id"
        class="toast"
        :class="`toast--${t.type}`"
        role="status"
      >
        <span class="toast__message">{{ t.message }}</span>
        <div class="toast__actions">
          <button
            v-if="t.undoFn"
            type="button"
            class="toast__undo"
            @click="toast.undo(t.id)"
          >
            Undo
          </button>
          <button
            type="button"
            class="toast__close"
            aria-label="Dismiss notification"
            @click="toast.removeToast(t.id)"
          >
            ✕
          </button>
        </div>
      </article>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.toast-container {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 100;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 240px;
  max-width: 320px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13.5px;
  background: #0c1e32;
  color: #e8eef4;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  border-left: 4px solid transparent;
  pointer-events: all;
}

.toast--success { border-left-color: #3d9a4f; }
.toast--error   { border-left-color: #d93d04; }
.toast--info    { border-left-color: #0477bf; }

.toast__message {
  flex: 1;
  line-height: 1.4;
}

.toast__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.toast__undo {
  border: 1px solid rgba(255,255,255,0.25);
  background: transparent;
  color: rgba(255,255,255,0.8);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.12s;
}

.toast__undo:hover { background: rgba(255,255,255,0.1); }

.toast__close {
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
  border-radius: 4px;
  transition: color 0.12s;
}

.toast__close:hover { color: rgba(255,255,255,0.85); }

/* Slide-in animation */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.22s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
