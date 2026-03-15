import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

const KEY_FONT = 'crm-font-scale';
const KEY_COLOR = 'crm-color-mode';
const KEY_MOTION = 'crm-reduce-motion';

const DEFAULT_FONT_SCALE = 100;
const MIN_FONT_SCALE = 100;
const MAX_FONT_SCALE = 200; // WCAG 2.2 SC 1.4.4: text resizable up to 200%

function parseFontScale(val) {
  if (!val || val === 'normal') return DEFAULT_FONT_SCALE;
  if (val === 'large') return 112;
  if (val === 'xlarge') return 125;
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n >= MIN_FONT_SCALE && n <= MAX_FONT_SCALE
    ? n
    : DEFAULT_FONT_SCALE;
}

export const useAccessibilityStore = defineStore('accessibility', () => {
  const fontScale = ref(parseFontScale(localStorage.getItem(KEY_FONT)) || DEFAULT_FONT_SCALE); // 100–200
  const colorMode = ref(
    localStorage.getItem(KEY_COLOR) || (localStorage.getItem('crm-high-contrast') === 'true' ? 'high-contrast' : 'default')
  ); // default | grayscale | high-contrast
  const reduceMotion = ref(localStorage.getItem(KEY_MOTION) === 'true');

  const highContrast = computed(() => colorMode.value === 'high-contrast');

  function setFontScale(value) {
    const n = typeof value === 'number' ? value : parseFontScale(value);
    fontScale.value = Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, n));
    localStorage.setItem(KEY_FONT, String(fontScale.value));
  }

  function setColorMode(value) {
    if (!['default', 'grayscale', 'high-contrast'].includes(value)) return;
    colorMode.value = value;
    localStorage.setItem(KEY_COLOR, value);
  }

  function setReduceMotion(value) {
    reduceMotion.value = !!value;
    localStorage.setItem(KEY_MOTION, value ? 'true' : 'false');
  }

  watch(
    [fontScale, colorMode, reduceMotion],
    ([fs, cm, rm]) => {
      const el = document.documentElement;
      el.style.zoom = fs === 100 ? '' : String(fs / 100);
      el.setAttribute('data-font-scale', String(fs));
      el.setAttribute('data-color-mode', cm);
      el.setAttribute('data-high-contrast', cm === 'high-contrast' ? 'true' : 'false');
      el.setAttribute('data-reduce-motion', rm ? 'true' : 'false');
    },
    { immediate: true }
  );

  return {
    fontScale,
    colorMode,
    highContrast,
    reduceMotion,
    setFontScale,
    setColorMode,
    setReduceMotion,
    fontScaleMin: MIN_FONT_SCALE,
    fontScaleMax: MAX_FONT_SCALE
  };
});
