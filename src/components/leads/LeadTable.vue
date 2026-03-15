<script setup>
import { useThemeStore } from '../../stores/theme';
import { useContactsStore } from '../../stores/contacts';
import { mockUsers } from '../../utils/mockData';
import EmptyState from '../common/EmptyState.vue';
import SvgIcon from '../common/SvgIcon.vue';
import { formatRwf } from '../../utils/currency';

defineProps({
  leads: { type: Array, required: true }
});

const emit = defineEmits(['edit', 'delete', 'create', 'row-click']);

const theme = useThemeStore();
const contactsStore = useContactsStore();

const statusLabel = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  lost: 'Lost',
  won: 'Won'
};

function getContactName(contactId) {
  const c = contactsStore.items.find((x) => x.id === contactId);
  return c?.name || '—';
}

function getAssigneeName(userId) {
  const u = mockUsers.find((x) => x.id === userId);
  return u?.name || '—';
}

function onRowClick(e, lead) {
  if (e.target.closest('.act-btn')) return;
  emit('row-click', lead);
}
</script>

<template>
  <div
    class="tbl-wrap"
    :class="theme.isDark ? 'tbl-wrap--dark' : 'tbl-wrap--light'"
  >
    <div class="tbl-scroll">
      <table class="tbl">
        <thead>
          <tr class="tbl-head-row">
            <th
              :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']"
            >
              Title
            </th>
            <th
              :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']"
            >
              Contact
            </th>
            <th
              :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-right']"
            >
              Value
            </th>
            <th
              :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-center']"
            >
              Status
            </th>
            <th
              :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']"
            >
              Assigned to
            </th>
            <th
              :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']"
            >
              Date
            </th>
            <th
              :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-center']"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody v-if="leads.length > 0">
          <tr
            v-for="lead in leads"
            :key="lead.id"
            class="tbl-row"
            :class="theme.isDark ? 'tbl-row--dark' : 'tbl-row--light'"
            style="cursor: pointer"
            @click="onRowClick($event, lead)"
          >
            <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
              <span class="lead-title" :class="theme.isDark ? 'text--dark' : 'text--light'">
                {{ lead.title }}
              </span>
            </td>
            <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
              {{ getContactName(lead.contactId) }}
            </td>
            <td class="cell cell--value">
              {{ formatRwf(lead.value) }}
            </td>
            <td class="cell cell--status">
              <span class="badge" :class="`badge-${lead.status}`">
                {{ statusLabel[lead.status] || lead.status }}
              </span>
            </td>
            <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
              {{ getAssigneeName(lead.assignedTo) }}
            </td>
            <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
              {{ new Date(lead.createdAt).toLocaleDateString() }}
            </td>
            <td class="cell cell--actions">
              <div class="row-actions">
                <button
                  type="button"
                  class="act-btn act-btn--edit"
                  :class="theme.isDark ? 'act-btn--edit-dark' : ''"
                  aria-label="Edit lead"
                  @click.stop="$emit('edit', lead)"
                >
                  <SvgIcon
                    name="edit"
                    :size="14"
                  />
                </button>
                <button
                  type="button"
                  class="act-btn act-btn--del"
                  :class="theme.isDark ? 'act-btn--del-dark' : ''"
                  aria-label="Delete lead"
                  @click.stop="$emit('delete', lead)"
                >
                  <SvgIcon
                    name="trash"
                    :size="14"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="7" class="empty-cell">
              <EmptyState
                icon="📋"
                heading="No leads found"
                sub="Use the New lead button above or adjust filters."
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tbl-wrap {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.tbl-wrap--light {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 41, 64, 0.07);
}

.tbl-wrap--dark {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tbl-scroll {
  width: 100%;
  overflow-x: auto;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.tbl-head-row th {
  white-space: nowrap;
}

.th-left {
  text-align: left;
}

.th-right {
  text-align: right;
}

.th-center {
  text-align: center;
}

.tbl-row { transition: background 0.12s; }
.tbl-row--light:hover { background: rgba(4, 119, 191, 0.03); }
.tbl-row--dark:hover  { background: rgba(255, 255, 255, 0.03); }

.cell {
  padding: 12px 16px;
  font-size: 14px;
  text-align: left;
  border-bottom: 1px solid rgba(16, 41, 64, 0.05);
}

:global([data-theme='dark']) .cell {
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.cell--light { color: #2c2c2c; }
.cell--dark  { color: rgba(255, 255, 255, 0.78); }

.cell--value {
  font-weight: 600;
  color: #0477bf;
  text-align: right;
}

.cell--status {
  text-align: center;
}

.cell--actions {
  text-align: center;
}

.lead-title { font-weight: 500; }
.text--light { color: #102940; }
.text--dark  { color: rgba(255, 255, 255, 0.9); }

.empty-cell { padding: 0; }

.row-actions {
  display: flex;
  gap: 6px;
}

.act-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: background 0.12s;
}

.act-btn--edit             { background: rgba(4, 119, 191, 0.1);  color: #0477bf; }
.act-btn--edit:hover       { background: rgba(4, 119, 191, 0.18); }
.act-btn--edit-dark        { background: rgba(4, 119, 191, 0.15) !important; }
.act-btn--edit-dark:hover  { background: rgba(4, 119, 191, 0.25) !important; }

.act-btn--del              { background: rgba(217, 61, 4, 0.08); color: #d93d04; }
.act-btn--del:hover        { background: rgba(217, 61, 4, 0.15); }
.act-btn--del-dark         { background: rgba(217, 61, 4, 0.15) !important; }
.act-btn--del-dark:hover   { background: rgba(217, 61, 4, 0.25) !important; }
</style>
