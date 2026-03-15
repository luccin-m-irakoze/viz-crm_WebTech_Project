<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import { useThemeStore } from '../../stores/theme';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps({
  statusCounts: {
    type: Object,
    required: true
  }
});

const labels = ['new', 'contacted', 'qualified', 'lost', 'won'];
const canvasRef = ref(null);
let chartInstance = null;

const theme = useThemeStore();

function buildConfig() {
  const isDark = theme.isDark;

  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Leads',
          data: labels.map((key) => props.statusCounts[key] || 0),
          backgroundColor: 'rgba(4,119,191,0.75)',
          hoverBackgroundColor: 'rgba(4,119,191,1)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDark ? 'rgba(255,255,255,0.85)' : '#102940',
            font: {
              size: 13,
              family: "'Inter', system-ui, sans-serif"
            }
          }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(12,28,46,0.95)' : 'rgba(255,255,255,0.95)',
          titleColor: isDark ? 'rgba(255,255,255,0.9)' : '#102940',
          bodyColor: isDark ? 'rgba(255,255,255,0.6)' : '#555555',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,41,64,0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10
        }
      },
      scales: {
        x: {
          ticks: {
            color: isDark ? 'rgba(255,255,255,0.68)' : 'rgba(16,41,64,0.6)',
            font: { size: 12, family: "'Inter', system-ui, sans-serif" }
          },
          grid: {
            color: 'transparent'
          },
          border: {
            color: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(16,41,64,0.08)'
          }
        },
        y: {
          ticks: {
            color: isDark ? 'rgba(255,255,255,0.68)' : 'rgba(16,41,64,0.6)',
            precision: 0,
            font: { size: 12, family: "'Inter', system-ui, sans-serif" }
          },
          grid: {
            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,41,64,0.08)'
          },
          border: {
            color: 'transparent'
          }
        }
      }
    }
  };
}

function renderChart() {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, buildConfig());
}

onMounted(() => {
  renderChart();
});

watch(
  () => ({ ...props.statusCounts }),
  () => {
    if (chartInstance) {
      chartInstance.data.datasets[0].data = labels.map((key) => props.statusCounts[key] || 0);
      chartInstance.update();
    }
  }
);

watch(
  () => theme.isDark,
  () => {
    renderChart();
  }
);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<template>
  <section
    class="chart-card"
    :class="theme.isDark ? 'd-stat' : 'l-stat'"
    aria-label="Lead status overview"
  >
    <header class="chart__header">
      <h2>Lead status</h2>
      <p class="chart__subtitle">
        Distribution across your pipeline.
      </p>
    </header>
    <div class="chart__body">
      <canvas ref="canvasRef" />
    </div>
  </section>
</template>

<style scoped>
.chart-card {
  /* Background/border come from l-stat / d-stat (main.css) */
  height: 260px;
}

.chart__header h2 {
  font-size: 15px;
  font-weight: 600;
}

:global([data-theme='dark']) .chart__header h2 {
  color: rgba(255, 255, 255, 0.95);
}

.chart__subtitle {
  font-size: 13px;
  opacity: 0.75;
}

:global([data-theme='light']) .chart__subtitle {
  color: rgba(16, 41, 64, 0.7);
}

:global([data-theme='dark']) .chart__subtitle {
  color: rgba(255, 255, 255, 0.78);
  opacity: 1;
}

.chart__body {
  margin-top: 12px;
  height: 200px;
}
</style>


