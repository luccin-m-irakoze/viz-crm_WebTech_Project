<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useThemeStore } from '../../stores/theme';

const props = defineProps({
  modelValue: { required: true },
  title:       { type: String,  default: '' },
  hideFooter:  { type: Boolean, default: false },
  confirmLabel:{ type: String,  default: 'Confirm' }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const theme = useThemeStore();
const dialogRef = ref(null);
let previouslyFocused = null;

function close() {
  emit('update:modelValue', false);
  emit('cancel');
}

function onBackdropClick(event) {
  if (event.target === event.currentTarget) close();
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation();
    close();
  }
  if (event.key === 'Tab' && dialogRef.value) {
    const focusable = dialogRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      previouslyFocused = document.activeElement;
      setTimeout(() => { if (dialogRef.value) dialogRef.value.focus(); }, 0);
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
      if (previouslyFocused?.focus) previouslyFocused.focus();
    }
  }
);

onMounted(() => { if (props.modelValue) document.addEventListener('keydown', onKeydown); });
onBeforeUnmount(() => { document.removeEventListener('keydown', onKeydown); });
</script>

<template>
  <div
    v-if="modelValue"
    class="modal-backdrop"
    :class="theme.isDark ? 'backdrop--dark' : 'backdrop--light'"
    role="dialog"
    aria-modal="true"
    :aria-label="title || 'Dialog'"
    @click="onBackdropClick"
  >
    <div
      ref="dialogRef"
      class="modal"
      :class="theme.isDark ? 'modal--dark' : 'modal--light'"
      tabindex="-1"
    >
      <!-- Header -->
      <header
        class="modal__header"
        :class="theme.isDark ? 'modal__header--dark' : 'modal__header--light'"
      >
        <h2
          v-if="title"
          class="modal__title"
          :class="theme.isDark ? 'modal__title--dark' : 'modal__title--light'"
        >
          {{ title }}
        </h2>
        <button
          type="button"
          class="modal__close"
          :class="theme.isDark ? 'modal__close--dark' : 'modal__close--light'"
          aria-label="Close"
          @click="close"
        >
          ×
        </button>
      </header>

      <!-- Body -->
      <section
        class="modal__body"
        :class="theme.isDark ? 'modal__body--dark' : 'modal__body--light'"
      >
        <slot />
      </section>

      <!-- Footer (confirmation modals only) -->
      <footer v-if="!hideFooter" class="modal__footer">
        <button
          type="button"
          class="modal__btn modal__btn--cancel"
          :class="theme.isDark ? 'modal__btn--cancel-dark' : 'modal__btn--cancel-light'"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          class="modal__btn modal__btn--confirm"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.backdrop--light { background-color: rgba(0, 0, 0, 0.35); }
.backdrop--dark  { background-color: rgba(0, 0, 0, 0.55); }

.modal {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  padding: 32px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  outline: none;
}

.modal--light {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.2);
}

.modal--dark {
  background: rgba(12, 28, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.modal__header--light { border-bottom: 1px solid rgba(16, 41, 64, 0.08); }
.modal__header--dark  { border-bottom: 1px solid rgba(255, 255, 255, 0.08); }

.modal__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.modal__title--light { color: #102940; }
.modal__title--dark  { color: rgba(255, 255, 255, 0.92); }

.modal__close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.12s;
}

.modal__close--light       { color: rgba(16, 41, 64, 0.45); }
.modal__close--light:hover { background: rgba(16, 41, 64, 0.06); color: #102940; }
.modal__close--dark        { color: rgba(255, 255, 255, 0.4); }
.modal__close--dark:hover  { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.9); }

.modal__body {
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal__body--light { color: #2c2c2c; }
.modal__body--dark  { color: rgba(255, 255, 255, 0.72); }

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal__btn {
  padding: 8px 18px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.12s;
}

.modal__btn--cancel { background: transparent; }
.modal__btn--cancel-light { color: #102940; border: 1px solid rgba(16, 41, 64, 0.18); }
.modal__btn--cancel-light:hover { background: rgba(16, 41, 64, 0.04); }
.modal__btn--cancel-dark  { color: rgba(255, 255, 255, 0.65); border: 1px solid rgba(255, 255, 255, 0.15); }
.modal__btn--cancel-dark:hover  { background: rgba(255, 255, 255, 0.06); }

.modal__btn--confirm       { background: #d93d04; color: #ffffff; }
.modal__btn--confirm:hover { background: #b83303; }
</style>
