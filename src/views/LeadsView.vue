<script setup>
import { computed, ref, watch } from 'vue';
import { useLeadsStore } from '../stores/leads';
import { useContactsStore } from '../stores/contacts';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';
import { useToastStore } from '../stores/toast';
import { useThemeStore } from '../stores/theme';
import { usePagination } from '../composables/usePagination';
import { mockUsers } from '../utils/mockData';
import LeadForm from '../components/leads/LeadForm.vue';
import LeadTable from '../components/leads/LeadTable.vue';
import SvgIcon from '../components/common/SvgIcon.vue';
import BaseModal from '../components/common/BaseModal.vue';
import PaginationBar from '../components/common/PaginationBar.vue';
import { formatRwf } from '../utils/currency';

const props = defineProps({
  search:       { type: String, default: '' },
  statusFilter: { type: String, default: '' }
});

const leadsStore    = useLeadsStore();
const contactsStore = useContactsStore();
const auth          = useAuthStore();
const ui            = useUIStore();
const toast         = useToastStore();
const theme         = useThemeStore();

const filtered = computed(() => {
  const list   = leadsStore.leadsForCurrentUser;
  const q      = (props.search || '').toLowerCase().trim();
  const status = (props.statusFilter || '').toLowerCase().trim();

  return list.filter((l) => {
    if (status && l.status.toLowerCase() !== status) return false;
    if (!q) return true;
    return (
      l.title.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q) ||
      String(l.value).includes(q)
    );
  });
});

const { currentPage, pageSize, totalPages, totalItems, rangeStart, rangeEnd, paginatedData, goToPage, nextPage, prevPage } =
  usePagination(filtered);

// ── Create / Edit modal ──────────────────────────────────────
const modalOpen  = ref(false);
const editingLead = ref(null);

watch(() => ui.pendingCreate, (val) => {
  if (val === 'lead') { openCreate(); ui.clearCreate(); }
});

function openCreate() { editingLead.value = null; modalOpen.value = true; }
function openEdit(lead) { editingLead.value = { ...lead, contactId: lead.contactId }; modalOpen.value = true; }

// ── Delete modal ─────────────────────────────────────────────
const deleteTarget = ref(null);
function askDelete(lead) { deleteTarget.value = lead; }

async function confirmDelete() {
  if (!deleteTarget.value) return;
  const deleted = { ...deleteTarget.value };
  deleteTarget.value = null;
  await leadsStore.deleteLead(deleted.id);
  toast.addToast({
    message: 'Lead deleted',
    type:    'success',
    undoFn:  () => { leadsStore.items.push(deleted); }
  });
}

// ── Detail modal ─────────────────────────────────────────────
const detailLead = ref(null);
function openDetail(lead) { detailLead.value = lead; }

// ── Submit ────────────────────────────────────────────────────
async function handleSubmit(payload) {
  if (editingLead.value) {
    await leadsStore.updateLead(editingLead.value.id, payload);
    toast.addToast({ message: 'Lead updated', type: 'success' });
  } else {
    await leadsStore.createLead({ ...payload, assignedTo: auth.user?.id });
    toast.addToast({ message: 'New lead added', type: 'success' });
  }
  modalOpen.value = false;
}

function getContactName(id) {
  return contactsStore.items.find((c) => c.id === id)?.name ?? '—';
}

function getAssigneeName(id) {
  return mockUsers.find((u) => u.id === id)?.name ?? '—';
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

const statusBadgeClass = {
  new:       'badge-new',
  contacted: 'badge-contacted',
  qualified: 'badge-qualified',
  won:       'badge-won',
  lost:      'badge-lost'
};
</script>

<template>
  <section class="page">
    <div class="page-header">
      <h2 class="page-header-title">Leads</h2>
      <button
        type="button"
        class="add-btn"
        aria-label="New lead"
        @click="openCreate"
      >
        <SvgIcon name="plus" :size="14" />
        New lead
      </button>
    </div>
    <LeadTable
      :leads="paginatedData"
      @edit="openEdit"
      @delete="askDelete"
      @create="openCreate"
      @row-click="openDetail"
    />

    <PaginationBar
      v-if="totalItems > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      :range-start="rangeStart"
      :range-end="rangeEnd"
      :page-size="pageSize"
      @update:page-size="(v) => (pageSize.value = v)"
      @go-to-page="goToPage"
      @next="nextPage"
      @prev="prevPage"
    />

    <!-- Delete confirm -->
    <BaseModal
      v-model="deleteTarget"
      title="Delete lead"
      @confirm="confirmDelete"
    >
      Are you sure you want to delete this lead? This action cannot be undone.
    </BaseModal>

    <!-- Create / Edit -->
    <BaseModal
      v-model="modalOpen"
      :title="editingLead ? 'Edit lead' : 'New lead'"
      :hide-footer="true"
    >
      <LeadForm
        :model-value="editingLead || undefined"
        :loading="leadsStore.loading"
        @submit="handleSubmit"
      />
    </BaseModal>

    <!-- Detail view -->
    <BaseModal
      v-model="detailLead"
      :title="detailLead?.title || 'Lead details'"
      :hide-footer="true"
    >
      <dl
        v-if="detailLead"
        class="detail-grid"
        :class="theme.isDark ? 'detail-grid--dark' : 'detail-grid--light'"
      >
        <dt>Title</dt><dd>{{ detailLead.title }}</dd>
        <dt>Contact</dt><dd>{{ getContactName(detailLead.contactId) }}</dd>
        <dt>Value</dt><dd class="val-blue">{{ formatRwf(detailLead.value) }}</dd>
        <dt>Status</dt>
        <dd>
          <span
            class="detail-badge"
            :class="statusBadgeClass[detailLead.status]"
          >
            {{ detailLead.status }}
          </span>
        </dd>
        <dt>Assigned To</dt><dd>{{ getAssigneeName(detailLead.assignedTo) }}</dd>
        <dt>Created</dt><dd>{{ fmtDate(detailLead.createdAt) }}</dd>
        <dt>Notes</dt><dd class="notes-cell">{{ detailLead.notes || 'No notes.' }}</dd>
      </dl>
    </BaseModal>
  </section>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }

.detail-grid {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px 16px;
  font-size: 14px;
}

.detail-grid dt { font-weight: 500; opacity: 0.55; align-self: center; }
.detail-grid--light dd { color: #102940; }
.detail-grid--dark  dd { color: rgba(255,255,255,0.85); }

.val-blue { color: #0477bf; font-weight: 600; }

.notes-cell { grid-column: 1 / -1; opacity: 0.6; font-style: italic; }

.detail-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-new       { background: #E6F1FB; color: #0C447C; }
.badge-contacted { background: #FEF3E2; color: #7A4500; }
.badge-qualified { background: #E8F4F0; color: #0A4D3A; }
.badge-won       { background: #EAF3DE; color: #27500A; }
.badge-lost      { background: #F1EFE8; color: #5F5E5A; }
</style>
