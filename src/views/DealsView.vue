<script setup>
import { computed, ref, watch } from 'vue';
import { useDealsStore } from '../stores/deals';
import { useToastStore } from '../stores/toast';
import { useThemeStore } from '../stores/theme';
import { useUIStore } from '../stores/ui';
import DealCard from '../components/deals/DealCard.vue';
import DealForm from '../components/deals/DealForm.vue';
import BaseModal from '../components/common/BaseModal.vue';
import SvgIcon from '../components/common/SvgIcon.vue';
import { formatRwf } from '../utils/currency';

const dealsStore = useDealsStore();
const toast      = useToastStore();
const theme      = useThemeStore();
const ui         = useUIStore();

watch(() => ui.pendingCreate, (val) => {
  if (val === 'deal') { openCreate(); ui.clearCreate(); }
});

const stages = ['qualified', 'proposal', 'negotiation', 'won', 'lost'];

const stageLabel = {
  qualified:   'Qualified',
  proposal:    'Proposal',
  negotiation: 'Negotiation',
  won:         'Won',
  lost:        'Lost'
};

function dealsForStage(stage) {
  return dealsStore.dealsByStage(stage);
}

function totalForStage(stage) {
  return dealsForStage(stage).reduce((s, d) => s + d.value, 0);
}

// ── Drag and drop ─────────────────────────────────────────────
const draggedDeal = ref(null);
const dropTarget  = ref(null);

function onDragStart(deal) { draggedDeal.value = deal; }
function onDragOver(e, stage) { e.preventDefault(); dropTarget.value = stage; }
function onDragLeave()        { dropTarget.value = null; }

function onDrop(e, stage) {
  e.preventDefault();
  dropTarget.value = null;
  if (!draggedDeal.value || draggedDeal.value.stage === stage) return;
  const label = stageLabel[stage];
  dealsStore.moveDeal(draggedDeal.value.id, stage);
  toast.addToast({ message: `Deal moved to ${label}`, type: 'success' });
  draggedDeal.value = null;
}

// ── Modal ─────────────────────────────────────────────────────
const modalOpen  = ref(false);
const editingDeal = ref(null);

function openCreate() { editingDeal.value = null; modalOpen.value = true; }
function openEdit(deal) { editingDeal.value = { ...deal }; modalOpen.value = true; }

function handleSubmit(payload) {
  if (editingDeal.value) {
    dealsStore.updateDeal(editingDeal.value.id, payload);
    toast.addToast({ message: 'Deal updated', type: 'success' });
  } else {
    dealsStore.addDeal(payload);
    toast.addToast({ message: 'New deal added', type: 'success' });
  }
  modalOpen.value = false;
}

function fmtValue(v) { return formatRwf(v); }

const totalPipeline   = computed(() => dealsStore.totalPipelineValue);
const weightedValue   = computed(() => dealsStore.weightedPipelineValue);
</script>

<template>
  <section class="page">
    <!-- Header -->
    <div class="deals-header">
      <div class="header-left">
        <h2 class="page-title">Deals</h2>
        <div class="header-stats">
          <span class="stat-chip">
            Pipeline: <strong>{{ fmtValue(totalPipeline) }}</strong>
          </span>
          <span class="stat-chip">
            Weighted: <strong>{{ fmtValue(Math.round(weightedValue)) }}</strong>
          </span>
        </div>
      </div>
      <button class="add-btn" aria-label="New deal" @click="openCreate">
        <SvgIcon name="plus" :size="14" />
        New deal
      </button>
    </div>

    <!-- Kanban board -->
    <div class="kanban-board">
      <div
        v-for="stage in stages"
        :key="stage"
        class="kanban-col"
        :class="[
          `kanban-col--${stage}`,
          dropTarget === stage ? 'kanban-col--over' : ''
        ]"
        @dragover="onDragOver($event, stage)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, stage)"
      >
        <!-- Column header -->
        <header
          class="col-header"
          :class="[
            theme.isDark ? 'col-header--dark' : 'col-header--light',
            stage === 'won'  ? 'col-header--won'  : '',
            stage === 'lost' ? 'col-header--lost' : ''
          ]"
        >
          <span class="col-title">{{ stageLabel[stage] }}</span>
          <div class="col-meta">
            <span class="col-count">{{ dealsForStage(stage).length }}</span>
            <span class="col-value">{{ fmtValue(totalForStage(stage)) }}</span>
          </div>
        </header>

        <!-- Cards -->
        <div class="col-cards">
          <DealCard
            v-for="deal in dealsForStage(stage)"
            :key="deal.id"
            :deal="deal"
            @click="openEdit"
            @drag-start="onDragStart"
          />

          <div
            v-if="dealsForStage(stage).length === 0"
            class="col-empty"
          >
            Drop here
          </div>
        </div>
      </div>
    </div>

    <!-- Form modal -->
    <BaseModal
      v-model="modalOpen"
      :title="editingDeal ? 'Edit deal' : 'New deal'"
      :hide-footer="true"
    >
      <DealForm
        :model-value="editingDeal || undefined"
        @submit="handleSubmit"
        @cancel="modalOpen = false"
      />
    </BaseModal>
  </section>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; min-height: 0; }

.deals-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.header-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.page-title  { font-size: 18px; font-weight: 600; margin: 0; }

.header-stats { display: flex; gap: 10px; }

.stat-chip {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(4,119,191,0.08);
  color: #0477bf;
}

:global([data-theme='dark']) .stat-chip {
  background: rgba(4,119,191,0.15);
  color: #85b7eb;
}

/* Board */
.kanban-board {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  align-items: flex-start;
}

.kanban-col {
  min-width: 240px;
  max-width: 280px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  transition: outline 0.12s;
}

.kanban-col--over {
  outline: 2px dashed #0477bf;
  outline-offset: 2px;
}

/* Column header */
.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
}

.col-header--light { background: rgba(16,41,64,0.04); }
.col-header--dark  { background: rgba(255,255,255,0.06); }
.col-header--won   { background: rgba(99,153,34,0.10); }
.col-header--lost  { background: rgba(226,75,74,0.08); }

.col-title { font-size: 13px; font-weight: 600; }

.col-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }

.col-count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(4,119,191,0.12);
  color: #0477bf;
  padding: 1px 7px;
  border-radius: 999px;
}

.col-value { font-size: 11px; opacity: 0.55; }

/* Cards container */
.col-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  min-height: 80px;
}

:global([data-theme='dark']) .kanban-col {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
}

:global([data-theme='light']) .kanban-col {
  background: rgba(16,41,64,0.02);
  border: 1px solid rgba(16,41,64,0.07);
}

.col-empty {
  text-align: center;
  font-size: 12px;
  opacity: 0.3;
  padding: 20px 0;
}
</style>
