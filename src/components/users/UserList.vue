<script setup>
import { useThemeStore } from '../../stores/theme';
import EmptyState from '../common/EmptyState.vue';

defineProps({
  users: { type: Array, required: true }
});

const emit = defineEmits(['toggle-status', 'edit', 'row-click']);

function onRowClick(e, user) {
  if (e.target.closest('.edit-btn') || e.target.closest('.toggle-btn')) return;
  emit('row-click', user);
}

const theme = useThemeStore();
</script>

<template>
  <div
    class="tbl-wrap"
    :class="theme.isDark ? 'tbl-wrap--dark' : 'tbl-wrap--light'"
  >
    <table class="tbl">
      <thead>
        <tr class="tbl-head-row">
          <th
            :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']"
          >
            Name
          </th>
          <th
            :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']"
          >
            Email
          </th>
          <th
            :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-center']"
          >
            Role
          </th>
          <th
            :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-center']"
          >
            Status
          </th>
          <th
            :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-left']"
          >
            Joined
          </th>
          <th
            :class="[theme.isDark ? 'th-dark' : 'th-light', 'th-center']"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody v-if="users.length > 0">
        <tr
          v-for="user in users"
          :key="user.id"
          class="tbl-row"
          :class="[
            theme.isDark ? 'tbl-row--dark' : 'tbl-row--light',
            user.status === 'inactive' ? 'tbl-row--muted' : ''
          ]"
          style="cursor: pointer"
          @click="onRowClick($event, user)"
        >
          <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
            <div class="name-cell">
              <div class="row-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
              <span class="name-primary" :class="theme.isDark ? 'text--dark' : 'text--light'">
                {{ user.name }}
              </span>
            </div>
          </td>
          <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">{{ user.email }}</td>
          <td class="cell cell--role">
            <span
              class="badge role-badge"
              :class="user.role === 'admin' ? 'role-badge--admin' : 'role-badge--agent'"
            >
              {{ user.role }}
            </span>
          </td>
          <td class="cell cell--status">
            <span
              class="badge"
              :class="user.status === 'active' ? 'badge-active' : 'badge-inactive'"
            >
              {{ user.status }}
            </span>
          </td>
          <td class="cell" :class="theme.isDark ? 'cell--dark' : 'cell--light'">
            {{ new Date(user.createdAt).toLocaleDateString() }}
          </td>
          <td class="cell cell--actions">
            <div class="row-actions">
              <button
                type="button"
                class="edit-btn"
                :class="theme.isDark ? 'edit-btn--dark' : ''"
                aria-label="Edit user"
                @click.stop="$emit('edit', user)"
              >
                Edit
              </button>
              <button
                type="button"
                class="toggle-btn"
                :class="[
                  user.status === 'active'
                    ? (theme.isDark ? 'toggle-btn--deactivate-dark' : 'toggle-btn--deactivate')
                    : (theme.isDark ? 'toggle-btn--activate-dark'   : 'toggle-btn--activate')
                ]"
                @click.stop="$emit('toggle-status', user)"
              >
                {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="6" class="empty-cell">
            <EmptyState
              icon="👥"
              heading="No users found"
              sub="No CRM users are available yet."
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

.tbl {
  width: 100%;
  border-collapse: collapse;
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
.tbl-row--muted       { opacity: 0.55; }

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

.cell--role,
.cell--status,
.cell--actions {
  text-align: center;
}

.empty-cell { padding: 0; }

.row-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.edit-btn {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid rgba(4, 119, 191, 0.4);
  background: rgba(4, 119, 191, 0.06);
  color: #0477bf;
  transition: background 0.12s;
}

.edit-btn--dark {
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.edit-btn:hover {
  background: rgba(4, 119, 191, 0.12);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0477bf;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-primary { font-size: 14px; font-weight: 500; }
.text--light  { color: #102940; }
.text--dark   { color: rgba(255, 255, 255, 0.9); }

.role-badge { text-transform: capitalize; }
.role-badge--admin { background: rgba(217, 61, 4, 0.1);  color: #d93d04; }
.role-badge--agent { background: rgba(4, 119, 191, 0.1); color: #0477bf; }

.toggle-btn {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid;
  background: transparent;
  transition: background 0.12s;
}

.toggle-btn--deactivate        { color: #d93d04; border-color: rgba(217, 61, 4, 0.3); }
.toggle-btn--deactivate:hover  { background: rgba(217, 61, 4, 0.06); }
.toggle-btn--deactivate-dark   { color: rgba(217, 61, 4, 0.85); border-color: rgba(217, 61, 4, 0.3); }
.toggle-btn--deactivate-dark:hover { background: rgba(217, 61, 4, 0.12); }

.toggle-btn--activate       { color: #1a6b35; border-color: rgba(26, 107, 53, 0.3); }
.toggle-btn--activate:hover { background: rgba(26, 107, 53, 0.06); }
.toggle-btn--activate-dark       { color: rgba(100, 220, 140, 0.9); border-color: rgba(100, 220, 140, 0.3); }
.toggle-btn--activate-dark:hover { background: rgba(100, 220, 140, 0.1); }
</style>
