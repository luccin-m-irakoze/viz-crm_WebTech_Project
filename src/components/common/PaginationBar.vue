<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../../stores/theme';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages:  { type: Number, required: true },
  totalItems:  { type: Number, required: true },
  rangeStart:  { type: Number, required: true },
  rangeEnd:    { type: Number, required: true },
  pageSize:    { type: Number, required: true }
});

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'go-to-page', 'next', 'prev']);

const theme = useThemeStore();

const pages = computed(() => {
  const p   = props.totalPages;
  const cur = props.currentPage;
  if (p <= 7) return Array.from({ length: p }, (_, i) => i + 1);
  const arr = [1];
  if (cur > 3) arr.push('…');
  for (let i = Math.max(2, cur - 1); i <= Math.min(p - 1, cur + 1); i++) arr.push(i);
  if (cur < p - 2) arr.push('…');
  arr.push(p);
  return arr;
});

function changeSize(e) {
  emit('update:pageSize', Number(e.target.value));
}
</script>

<template>
  <div
    class="pag-bar"
    :class="theme.isDark ? 'pag-bar--dark' : 'pag-bar--light'"
  >
    <span class="pag-info">
      Showing {{ rangeStart }}–{{ rangeEnd }} of {{ totalItems }} records
    </span>

    <div class="pag-controls">
      <button
        class="pag-btn"
        :class="{ 'pag-btn--disabled': currentPage === 1 }"
        :disabled="currentPage === 1"
        aria-label="Previous page"
        @click="emit('prev')"
      >
        ← Prev
      </button>

      <template
        v-for="p in pages"
        :key="p"
      >
        <span
          v-if="p === '…'"
          class="pag-ellipsis"
        >…</span>
        <button
          v-else
          class="pag-btn pag-btn--num"
          :class="{ 'pag-btn--active': p === currentPage }"
          :aria-label="`Page ${p}`"
          :aria-current="p === currentPage ? 'page' : undefined"
          @click="emit('go-to-page', p)"
        >
          {{ p }}
        </button>
      </template>

      <button
        class="pag-btn"
        :class="{ 'pag-btn--disabled': currentPage === totalPages }"
        :disabled="currentPage === totalPages"
        aria-label="Next page"
        @click="emit('next')"
      >
        Next →
      </button>
    </div>

    <div class="pag-size">
      <select
        :value="pageSize"
        class="pag-select"
        :class="theme.isDark ? 'pag-select--dark' : 'pag-select--light'"
        aria-label="Rows per page"
        @change="changeSize"
      >
        <option :value="10">10 / page</option>
        <option :value="25">25 / page</option>
        <option :value="50">50 / page</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.pag-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  font-size: 13px;
  border-top: 1px solid rgba(16, 41, 64, 0.07);
  flex-wrap: wrap;
  gap: 8px;
}

.pag-bar--light { color: #4a5568; }
.pag-bar--dark  { color: rgba(255,255,255,0.55); border-top-color: rgba(255,255,255,0.06); }

.pag-info { min-width: 180px; }

.pag-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pag-btn {
  height: 30px;
  min-width: 30px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid rgba(16, 41, 64, 0.14);
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.12s;
  color: inherit;
}

:global([data-theme='dark']) .pag-btn {
  border-color: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.75);
}

.pag-btn:hover:not(:disabled) {
  background: rgba(4, 119, 191, 0.08);
  border-color: #0477bf;
  color: #0477bf;
}

.pag-btn--active {
  background: #0477bf;
  border-color: #0477bf;
  color: #fff;
  font-weight: 600;
}

.pag-btn--active:hover { background: #035e96; }

.pag-btn--disabled { opacity: 0.35; cursor: not-allowed; }

.pag-ellipsis {
  padding: 0 4px;
  color: inherit;
  opacity: 0.5;
}

.pag-size { display: flex; align-items: center; }

.pag-select {
  height: 30px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid rgba(16, 41, 64, 0.14);
  cursor: pointer;
  outline: none;
}

.pag-select--light { background: #fff; color: #102940; }
.pag-select--dark  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.12); }
</style>
