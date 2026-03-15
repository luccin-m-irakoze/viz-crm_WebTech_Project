<script setup>
import { computed } from 'vue';
import { useThemeStore } from '../../stores/theme';
import { useContactsStore } from '../../stores/contacts';
import { mockUsers } from '../../utils/mockData';
import { formatRwf } from '../../utils/currency';

const props = defineProps({
  deal: { type: Object, required: true }
});

const emit = defineEmits(['click', 'drag-start']);

const theme    = useThemeStore();
const contacts = useContactsStore();

const contactName = computed(() =>
  contacts.items.find((c) => c.id === props.deal.contactId)?.name ?? '—'
);

const assigneeName = computed(() =>
  mockUsers.find((u) => u.id === props.deal.assignedTo)?.name ?? '—'
);

const assigneeInitial = computed(() =>
  assigneeName.value.charAt(0).toUpperCase()
);

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtValue(v) { return formatRwf(v); }
</script>

<template>
  <article
    class="deal-card"
    :class="theme.isDark ? 'deal-card--dark' : 'deal-card--light'"
    draggable="true"
    :aria-label="`Deal: ${deal.title}`"
    @click="emit('click', deal)"
    @dragstart="emit('drag-start', deal)"
  >
    <div class="card-top">
      <span class="card-title">{{ deal.title }}</span>
      <span class="prob-badge">{{ deal.probability }}%</span>
    </div>

    <p class="card-contact">{{ contactName }}</p>

    <div class="card-bottom">
      <span class="card-value">{{ fmtValue(deal.value) }}</span>
      <span class="card-date">{{ fmtDate(deal.expectedCloseDate) }}</span>
    </div>

    <div class="card-footer">
      <div class="assignee-avatar" :aria-label="assigneeName">
        {{ assigneeInitial }}
      </div>
    </div>
  </article>
</template>

<style scoped>
.deal-card {
  border-radius: 8px;
  padding: 12px;
  cursor: grab;
  transition: box-shadow 0.15s, transform 0.1s;
  user-select: none;
}

.deal-card:active { cursor: grabbing; transform: scale(0.98); }

.deal-card--light {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(16,41,64,0.08);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.deal-card--light:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.10);
}

.deal-card--dark {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255,255,255,0.1);
}

.deal-card--dark:hover {
  background: rgba(255, 255, 255, 0.09);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.card-title {
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.3;
  flex: 1;
}

.prob-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(4,119,191,0.12);
  color: #0477bf;
  flex-shrink: 0;
  white-space: nowrap;
}

.card-contact {
  font-size: 12px;
  opacity: 0.5;
  margin: 0 0 8px;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-value {
  font-size: 14px;
  font-weight: 600;
  color: #0477bf;
}

.card-date {
  font-size: 11.5px;
  opacity: 0.5;
}

.card-footer { display: flex; justify-content: flex-end; }

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #0477bf;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
