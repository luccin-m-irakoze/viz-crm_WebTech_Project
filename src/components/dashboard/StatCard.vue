<script setup>
import { useThemeStore } from '../../stores/theme';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  description: {
    type: String,
    default: ''
  }
});

const theme = useThemeStore();
</script>

<template>
  <article :class="theme.isDark ? 'd-stat' : 'l-stat'">
    <div :class="theme.isDark ? 'd-stat-lbl' : 'l-stat-lbl'">
      {{ label }}
    </div>
    <div :class="theme.isDark ? 'd-stat-val' : 'l-stat-val'">
      {{ value }}
    </div>
    <p
      v-if="description"
      :class="theme.isDark ? 'd-sub' : 'l-sub'"
    >
      {{ description }}
    </p>
  </article>
</template>


