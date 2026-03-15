<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useThemeStore } from '../../stores/theme';
import Chart from 'chart.js/auto';

const props = defineProps({
  type:    { type: String, required: true },
  data:    { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
  title:   { type: String, default: '' }
});

const theme  = useThemeStore();
const canvas = ref(null);
let chart    = null;

function getThemeColors() {
  return {
    tick:    theme.isDark ? '#9ca3af' : '#6b7280',
    grid:    theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    tooltipBg:   theme.isDark ? '#1e3a5f' : '#ffffff',
    tooltipText: theme.isDark ? '#f3f4f6' : '#111827'
  };
}

function buildOptions() {
  const colors = getThemeColors();
  return {
    responsive:          true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor:      colors.tooltipText,
        bodyColor:       colors.tooltipText,
        borderColor:     'rgba(4,119,191,0.2)',
        borderWidth:     1
      }
    },
    scales: {
      x: {
        ticks: { color: colors.tick },
        grid:  { color: colors.grid }
      },
      y: {
        ticks: { color: colors.tick },
        grid:  { color: colors.grid }
      }
    },
    ...props.options
  };
}

function initChart() {
  if (chart) { chart.destroy(); chart = null; }
  if (!canvas.value) return;
  chart = new Chart(canvas.value, {
    type:    props.type,
    data:    props.data,
    options: buildOptions()
  });
}

watch(() => props.data, () => {
  if (!chart) { initChart(); return; }
  chart.data = props.data;
  chart.update();
}, { deep: true });

watch(() => theme.isDark, () => {
  if (!chart) return;
  chart.options = buildOptions();
  chart.update();
});

onMounted(initChart);
onBeforeUnmount(() => { if (chart) chart.destroy(); });
</script>

<template>
  <div class="chart-container">
    <p v-if="title" class="chart-title">{{ title }}</p>
    <div class="chart-wrap">
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<style scoped>
.chart-container { display: flex; flex-direction: column; gap: 8px; }
.chart-title { font-size: 13px; font-weight: 600; margin: 0; opacity: 0.7; }
.chart-wrap  { position: relative; height: 220px; }
</style>
