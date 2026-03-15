<script setup>
import { useThemeStore } from '../../stores/theme';

defineProps({
  icon:     { type: String, default: '📭' },
  heading:  { type: String, required: true },
  sub:      { type: String, default: 'Try adjusting your filters or add a new one.' },
  ctaLabel: { type: String, default: null }
});

defineEmits(['cta']);

const theme = useThemeStore();
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <h3 :class="theme.isDark ? 'heading--dark' : 'heading--light'">{{ heading }}</h3>
    <p :class="theme.isDark ? 'sub--dark' : 'sub--light'">{{ sub }}</p>
    <button
      v-if="ctaLabel"
      type="button"
      class="cta-btn"
      @click="$emit('cta')"
    >
      {{ ctaLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 8px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.4;
  margin-bottom: 4px;
  line-height: 1;
}

h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

p {
  font-size: 13px;
  margin: 0;
}

.heading--light { color: #102940; }
.heading--dark  { color: rgba(255, 255, 255, 0.85); }
.sub--light     { color: rgba(16, 41, 64, 0.5); }
.sub--dark      { color: rgba(255, 255, 255, 0.52); }

.cta-btn {
  margin-top: 16px;
  padding: 9px 22px;
  border-radius: 7px;
  border: none;
  background: #0477bf;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.cta-btn:hover {
  background: #0569a8;
}
</style>
