import { defineStore } from 'pinia';
import { ref } from 'vue';

let nextId = 1;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);

  function addToast({ message, type = 'success', undoFn = null }) {
    const id = nextId++;
    const duration = undoFn ? 5000 : 3500;
    toasts.value.push({ id, message, type, undoFn });
    setTimeout(() => removeToast(id), duration);
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.value.splice(idx, 1);
  }

  function undo(id) {
    const toast = toasts.value.find((t) => t.id === id);
    if (toast?.undoFn) {
      toast.undoFn();
      removeToast(id);
    }
  }

  return { toasts, addToast, removeToast, undo };
});
