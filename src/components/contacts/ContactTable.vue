<script setup>
import { useThemeStore } from '../../stores/theme';
import EmptyState from '../common/EmptyState.vue';
import SvgIcon from '../common/SvgIcon.vue';

defineProps({
  contacts: { type: Array, required: true }
});

const emit = defineEmits(['edit', 'delete', 'create', 'row-click']);

const theme = useThemeStore();

const statusBadgeClass = {
  active:   'badge-status-active',
  inactive: 'badge-status-inactive',
  lead:     'badge-status-lead'
};

function onRowClick(e, contact) {
  if (e.target.closest('.act-btn')) return;
  emit('row-click', contact);
}
</script>

<template>
  <div
    class="tbl-wrap"
    :class="theme.isDark ? 'tbl-wrap--dark' : 'tbl-wrap--light'"
  >
    <table class="tbl">
      <thead>
        <tr class="tbl-head-row">
          <th :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']">Name</th>
          <th :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']">Email</th>
          <th :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']">Phone</th>
          <th :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']">Company</th>
          <th :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-center']">Status</th>
          <th :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-center']">Actions</th>
        </tr>
      </thead>

      <tbody v-if="contacts.length > 0">
        <tr
          v-for="contact in contacts"
          :key="contact.id"
          class="tbl-row"
          :class="theme.isDark ? 'tbl-row--dark' : 'tbl-row--light'"
          style="cursor: pointer"
          @click="onRowClick($event, contact)"
        >
          <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
            <div class="name-cell">
              <div class="row-avatar">{{ contact.name.charAt(0).toUpperCase() }}</div>
              <span class="name-primary" :class="theme.isDark ? 'text--dark' : 'text--light'">
                {{ contact.name }}
              </span>
            </div>
          </td>
          <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">{{ contact.email }}</td>
          <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">{{ contact.phone || '—' }}</td>
          <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">{{ contact.company }}</td>
          <td class="cell cell--center">
            <span
              class="status-badge"
              :class="statusBadgeClass[contact.status] || 'badge-status-active'"
            >
              {{ contact.status || 'active' }}
            </span>
          </td>
          <td class="cell cell--actions">
            <div class="row-actions">
              <button
                type="button"
                class="act-btn act-btn--edit"
                :class="theme.isDark ? 'act-btn--dark' : ''"
                aria-label="Edit contact"
                @click.stop="$emit('edit', contact)"
              >
                <SvgIcon name="edit" :size="14" />
              </button>
              <button
                type="button"
                class="act-btn act-btn--del"
                :class="theme.isDark ? 'act-btn--del-dark' : ''"
                aria-label="Delete contact"
                @click.stop="$emit('delete', contact)"
              >
                <SvgIcon name="trash" :size="14" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td colspan="6" class="empty-cell">
            <EmptyState
              icon="👤"
              heading="No contacts yet"
              sub="Use the Add contact button above to get started."
            />
          </td>
        </tr>
      </tbody>
    </table>
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

.tbl { width: 100%; border-collapse: collapse; }
.tbl-head-row th { white-space: nowrap; }
.th-left   { text-align: left; }
.th-right  { text-align: right; }
.th-center { text-align: center; }

.tbl-row { transition: background 0.12s; }
.tbl-row--light:hover { background: rgba(4, 119, 191, 0.04); }
.tbl-row--dark:hover  { background: rgba(255, 255, 255, 0.04); }

.cell {
  padding: 12px 16px;
  font-size: 14px;
  text-align: left;
  border-bottom: 1px solid rgba(16, 41, 64, 0.05);
}

:global([data-theme='dark']) .cell { border-bottom-color: rgba(255,255,255,0.04); }

.cell--light { color: #2c2c2c; }
.cell--dark  { color: rgba(255,255,255,0.78); }
.cell--actions, .cell--center { text-align: center; }
.empty-cell { padding: 0; }

.name-cell { display: flex; align-items: center; gap: 10px; }

.row-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #0477bf; color: #fff;
  font-size: 12px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.name-primary { font-size: 14px; font-weight: 500; }
.text--light  { color: #102940; }
.text--dark   { color: rgba(255,255,255,0.9); }

.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-status-active   { background: #EAF3DE; color: #27500A; }
.badge-status-inactive { background: #F1EFE8; color: #5F5E5A; }
.badge-status-lead     { background: #E6F1FB; color: #0C447C; }

.row-actions { display: flex; gap: 6px; justify-content: center; }

.act-btn {
  width: 30px; height: 30px; border-radius: 50%;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; transition: background 0.12s;
}

.act-btn--edit             { background: rgba(4,119,191,0.10); color: #0477bf; }
.act-btn--edit:hover       { background: rgba(4,119,191,0.18); }
.act-btn--edit.act-btn--dark { background: rgba(4,119,191,0.15); }
.act-btn--edit.act-btn--dark:hover { background: rgba(4,119,191,0.25); }

.act-btn--del              { background: rgba(217,61,4,0.08); color: #d93d04; }
.act-btn--del:hover        { background: rgba(217,61,4,0.15); }
.act-btn--del.act-btn--del-dark { background: rgba(217,61,4,0.15); }
.act-btn--del.act-btn--del-dark:hover { background: rgba(217,61,4,0.25); }
</style>
