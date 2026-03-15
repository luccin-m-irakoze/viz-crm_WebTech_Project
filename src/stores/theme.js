import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('crm-theme') === 'dark');

  function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem('crm-theme', isDark.value ? 'dark' : 'light');
  }

  watch(
    isDark,
    (val) => {
      document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
    },
    { immediate: true }
  );

  return { isDark, toggle };
});


