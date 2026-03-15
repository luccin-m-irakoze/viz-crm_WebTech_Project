<script setup>
import { computed, ref, watch } from 'vue';
import { useActivitiesStore } from '../stores/activities';
import { useUIStore } from '../stores/ui';
import { useContactsStore } from '../stores/contacts';
import { useLeadsStore } from '../stores/leads';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useThemeStore } from '../stores/theme';
import { usePagination } from '../composables/usePagination';
import { mockUsers } from '../utils/mockData';
import ActivityForm from '../components/activities/ActivityForm.vue';
import BaseModal from '../components/common/BaseModal.vue';
import PaginationBar from '../components/common/PaginationBar.vue';
import SvgIcon from '../components/common/SvgIcon.vue';

const actStore  = useActivitiesStore();
const ui        = useUIStore();
const contacts  = useContactsStore();
const leadsStore = useLeadsStore();
const auth      = useAuthStore();
const toast     = useToastStore();
const theme     = useThemeStore();

const typeFilter   = ref('');
const myTasksOnly  = ref(false);
const ownerFilter  = ref('');

const today = computed(() => new Date().toISOString().split('T')[0]);

const visibleActivities = computed(() => {
  let list = auth.isAdmin ? actStore.items : actStore.myActivities();
  if (myTasksOnly.value) list = list.filter((a) => a.owner === auth.user?.id);
  if (typeFilter.value)  list = list.filter((a) => a.type === typeFilter.value);
  if (ownerFilter.value && auth.isAdmin) list = list.filter((a) => a.owner === Number(ownerFilter.value));
  return list;
});

const { currentPage, pageSize, totalPages, totalItems, rangeStart, rangeEnd, paginatedData, goToPage, nextPage, prevPage } =
  usePagination(visibleActivities);

// ── Helpers ───────────────────────────────────────────────────
function getRelatedName(activity) {
  const { type, id } = activity.relatedTo;
  if (type === 'contact') return contacts.items.find((c) => c.id === id)?.name ?? '—';
  const lead = leadsStore.items.find((l) => l.id === id);
  return lead ? lead.title : '—';
}

function getOwnerName(ownerId) {
  return mockUsers.find((u) => u.id === ownerId)?.name ?? '—';
}

function isOverdue(a) {
  return a.status === 'open' && a.dueDate < today.value;
}

const typeBadge = { call: 'badge-call', email: 'badge-email', visit: 'badge-visit' };
const typeLabel = { call: 'Call', email: 'Email', visit: 'Visit' };

// ── Modal ─────────────────────────────────────────────────────
const modalOpen     = ref(false);
const editingActivity = ref(null);

function openCreate() { editingActivity.value = null; modalOpen.value = true; }

watch(() => ui.pendingCreate, (val) => {
  if (val === 'activity') { openCreate(); ui.clearCreate(); }
});
function openEdit(a)  { editingActivity.value = { ...a }; modalOpen.value = true; }

function handleSubmit(payload) {
  if (editingActivity.value) {
    actStore.updateActivity(editingActivity.value.id, payload);
    toast.addToast({ message: 'Activity updated', type: 'success' });
  } else {
    actStore.addActivity(payload);
    toast.addToast({ message: 'Activity added', type: 'success' });
  }
  modalOpen.value = false;
}

function markDone(a) {
  actStore.toggleDone(a.id);
  toast.addToast({ message: a.status === 'open' ? 'Activity marked done' : 'Activity reopened', type: 'success' });
}

function deleteActivity(a) {
  const deleted = { ...a };
  actStore.deleteActivity(a.id);
  toast.addToast({
    message: 'Activity deleted',
    type:    'success',
    undoFn:  () => { actStore.items.push(deleted); }
  });
}
</script>

<template>
  <section class="page">
    <!-- Header bar -->
    <div class="act-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">Activities</h2>
        <span class="count-badge">{{ totalItems }}</span>
      </div>
      <div class="toolbar-right">
        <!-- Type filter -->
        <select
          v-model="typeFilter"
          class="tb-select"
          :class="theme.isDark ? 'tb-select--dark' : 'tb-select--light'"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="visit">Visit</option>
        </select>

        <!-- Owner filter (admin only) -->
        <select
          v-if="auth.isAdmin"
          v-model="ownerFilter"
          class="tb-select"
          :class="theme.isDark ? 'tb-select--dark' : 'tb-select--light'"
          aria-label="Filter by owner"
        >
          <option value="">All agents</option>
          <option v-for="u in [{ id: 1, name: 'Alice Admin' }, { id: 2, name: 'Bob Agent' }]" :key="u.id" :value="u.id">
            {{ u.name }}
          </option>
        </select>

        <!-- My tasks toggle -->
        <button
          class="toggle-btn"
          :class="myTasksOnly
            ? 'toggle-btn--active'
            : (theme.isDark ? 'toggle-btn--dark' : 'toggle-btn--light')"
          @click="myTasksOnly = !myTasksOnly"
        >
          My tasks
        </button>

        <button class="add-btn" aria-label="Add activity" @click="openCreate">
          <SvgIcon name="plus" :size="14" />
          Add activity
        </button>
      </div>
    </div>

    <!-- Table -->
    <div
      class="tbl-wrap"
      :class="theme.isDark ? 'tbl-wrap--dark' : 'tbl-wrap--light'"
    >
      <table class="tbl">
        <thead>
          <tr>
            <th :class="theme.isDark ? 'th-dark' : 'th-light'" class="th-left">Subject</th>
            <th :class="theme.isDark ? 'th-dark' : 'th-light'" class="th-center">Type</th>
            <th :class="theme.isDark ? 'th-dark' : 'th-light'" class="th-left">Related to</th>
            <th :class="theme.isDark ? 'th-dark' : 'th-light'" class="th-left">Due date</th>
            <th :class="theme.isDark ? 'th-dark' : 'th-light'" class="th-left">Owner</th>
            <th :class="theme.isDark ? 'th-dark' : 'th-light'" class="th-center">Status</th>
            <th :class="theme.isDark ? 'th-dark' : 'th-light'" class="th-center">Actions</th>
          </tr>
        </thead>
        <tbody v-if="paginatedData.length">
          <tr
            v-for="a in paginatedData"
            :key="a.id"
            class="tbl-row"
            :class="[
              theme.isDark ? 'tbl-row--dark' : 'tbl-row--light',
              a.status === 'done' ? 'row-done' : ''
            ]"
            style="cursor: pointer"
            @click="openEdit(a)"
          >
            <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
              {{ a.subject }}
            </td>
            <td class="cell cell--center">
              <span class="type-badge" :class="typeBadge[a.type]">{{ typeLabel[a.type] }}</span>
            </td>
            <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
              {{ getRelatedName(a) }}
            </td>
            <td
              class="cell"
              :class="[
                isOverdue(a) ? 'cell-overdue' : (theme.isDark ? 'cell--dark' : 'cell--light')
              ]"
            >
              {{ a.dueDate }}
            </td>
            <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
              {{ getOwnerName(a.owner) }}
            </td>
            <td class="cell cell--center">
              <span
                class="status-badge"
                :class="a.status === 'done' ? 'badge-done' : 'badge-open'"
              >
                {{ a.status }}
              </span>
            </td>
            <td class="cell cell--center">
              <div class="row-actions">
                <button
                  type="button"
                  class="act-btn"
                  :class="a.status === 'done' ? 'act-btn--reopen' : 'act-btn--done'"
                  :aria-label="a.status === 'done' ? 'Reopen' : 'Mark done'"
                  @click.stop="markDone(a)"
                >
                  <SvgIcon name="check" :size="13" />
                </button>
                <button
                  type="button"
                  class="act-btn act-btn--edit"
                  aria-label="Edit"
                  @click.stop="openEdit(a)"
                >
                  <SvgIcon name="edit" :size="13" />
                </button>
                <button
                  type="button"
                  class="act-btn act-btn--del"
                  aria-label="Delete"
                  @click.stop="deleteActivity(a)"
                >
                  <SvgIcon name="trash" :size="13" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="7" class="empty-cell">
              <div class="empty-state">
                <SvgIcon name="clipboard" :size="32" />
                <p>No activities found. Use the Add activity button above.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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

    <!-- Form modal -->
    <BaseModal
      v-model="modalOpen"
      :title="editingActivity ? 'Edit activity' : 'New activity'"
      :hide-footer="true"
    >
      <ActivityForm
        :model-value="editingActivity || undefined"
        @submit="handleSubmit"
        @cancel="modalOpen = false"
      />
    </BaseModal>
  </section>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 0; }

.act-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.toolbar-left { display: flex; align-items: center; gap: 10px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.page-title { font-size: 18px; font-weight: 600; margin: 0; }

.count-badge {
  background: rgba(4,119,191,0.12);
  color: #0477bf;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 13px;
  font-weight: 600;
}

.tb-select {
  height: 34px; padding: 0 10px; border-radius: 7px;
  font-size: 13px; border: 1px solid rgba(16,41,64,0.18); outline: none; cursor: pointer;
}

.tb-select--light { background: #fff; color: #102940; }
.tb-select--dark  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.15); }

.toggle-btn {
  height: 34px; padding: 0 14px; border-radius: 7px;
  font-size: 13px; cursor: pointer; border: 1px solid rgba(16,41,64,0.18);
  transition: background 0.12s;
}

.toggle-btn--light { background: transparent; color: inherit; }
.toggle-btn--dark  { background: transparent; color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); }
.toggle-btn--active { background: #0477bf; color: #fff; border-color: #0477bf; }

/* Table */
.tbl-wrap {
  border-radius: 8px; overflow: hidden; width: 100%;
}
.tbl-wrap--light { background: rgba(255,255,255,0.82); backdrop-filter: blur(12px); border: 1px solid rgba(16,41,64,0.07); }
.tbl-wrap--dark  { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }

.tbl { width: 100%; border-collapse: collapse; }
.th-left   { text-align: left; }
.th-center { text-align: center; }

.tbl-row { transition: background 0.12s; }
.tbl-row--light:hover { background: rgba(4,119,191,0.04); }
.tbl-row--dark:hover  { background: rgba(255,255,255,0.04); }
.row-done { opacity: 0.5; }

.cell {
  padding: 11px 16px; font-size: 13.5px; text-align: left;
  border-bottom: 1px solid rgba(16,41,64,0.05);
}
:global([data-theme='dark']) .cell { border-bottom-color: rgba(255,255,255,0.04); }
.cell--light { color: #2c2c2c; }
.cell--dark  { color: rgba(255,255,255,0.78); }
.cell--center { text-align: center; }
.cell-overdue { color: #A32D2D; font-weight: 500; }
.empty-cell { padding: 0; }

.type-badge {
  display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 500;
}
.badge-call  { background: #E6F1FB; color: #0C447C; }
.badge-email { background: #FEF3E2; color: #7A4500; }
.badge-visit { background: #EAF3DE; color: #27500A; }

.status-badge {
  display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 500; text-transform: capitalize;
}
.badge-open { background: rgba(4,119,191,0.1); color: #0477bf; }
.badge-done { background: rgba(60,160,80,0.1); color: #2a7a3b; }

.row-actions { display: flex; gap: 5px; justify-content: center; }

.act-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s;
}
.act-btn--done   { background: rgba(60,160,80,0.1);  color: #2a7a3b; }
.act-btn--done:hover { background: rgba(60,160,80,0.2); }
.act-btn--reopen { background: rgba(4,119,191,0.1);  color: #0477bf; }
.act-btn--edit   { background: rgba(4,119,191,0.1);  color: #0477bf; }
.act-btn--edit:hover { background: rgba(4,119,191,0.18); }
.act-btn--del    { background: rgba(217,61,4,0.08);  color: #d93d04; }
.act-btn--del:hover  { background: rgba(217,61,4,0.15); }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 40px 16px; opacity: 0.45; font-size: 14px;
}
</style>
