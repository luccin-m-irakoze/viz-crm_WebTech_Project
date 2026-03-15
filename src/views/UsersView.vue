<script setup>
import { computed, ref, watch } from 'vue';
import { useUsersStore } from '../stores/users';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';
import { useToastStore } from '../stores/toast';
import { useThemeStore } from '../stores/theme';
import { usePagination } from '../composables/usePagination';
import UserList from '../components/users/UserList.vue';
import SvgIcon from '../components/common/SvgIcon.vue';
import UserForm from '../components/users/UserForm.vue';
import BaseModal from '../components/common/BaseModal.vue';
import PaginationBar from '../components/common/PaginationBar.vue';

const usersStore = useUsersStore();
const auth       = useAuthStore();
const ui    = useUIStore();
const toast = useToastStore();
const theme = useThemeStore();

const users = computed(() => usersStore.items);

const { currentPage, pageSize, totalPages, totalItems, rangeStart, rangeEnd, paginatedData, goToPage, nextPage, prevPage } =
  usePagination(users);

// ── Create / Edit modal ──────────────────────────────────────
const modalOpen  = ref(false);
const editingUser = ref(null);

watch(() => ui.pendingCreate, (val) => {
  if (val === 'user') { openCreate(); ui.clearCreate(); }
});

function openCreate() { editingUser.value = null; modalOpen.value = true; }
function openEdit(user) { editingUser.value = { ...user }; modalOpen.value = true; }

// ── Toggle status ────────────────────────────────────────────
async function toggleStatus(user) {
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  const prev = user.status;
  await usersStore.updateUserStatus(user.id, newStatus);
  toast.addToast({
    message: newStatus === 'active' ? 'User activated' : 'User deactivated',
    type:    'info',
    undoFn:  () => { usersStore.updateUserStatus(user.id, prev); }
  });
}

// ── Submit ────────────────────────────────────────────────────
async function handleSubmit(payload) {
  if (editingUser.value?.id != null) {
    await usersStore.updateUser(editingUser.value.id, payload);
    toast.addToast({ message: 'User updated', type: 'success' });
  } else {
    await usersStore.createUser(payload);
    toast.addToast({ message: 'User added', type: 'success' });
  }
  modalOpen.value = false;
}

// ── Detail modal ─────────────────────────────────────────────
const detailUser = ref(null);
function openDetail(user) { detailUser.value = user; }

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}
</script>

<template>
  <section class="page">
    <div class="page-header">
      <h2 class="page-header-title">Users</h2>
      <button
        v-if="auth.isAdmin"
        type="button"
        class="add-btn"
        aria-label="Add user"
        @click="openCreate"
      >
        <SvgIcon name="plus" :size="14" />
        Add user
      </button>
    </div>
    <UserList
      :users="paginatedData"
      @toggle-status="toggleStatus"
      @edit="openEdit"
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

    <!-- Create / Edit -->
    <BaseModal
      v-model="modalOpen"
      :title="editingUser ? 'Edit user' : 'New user'"
      :hide-footer="true"
    >
      <UserForm
        :model-value="editingUser || undefined"
        :loading="usersStore.loading"
        @submit="handleSubmit"
      />
    </BaseModal>

    <!-- Detail view -->
    <BaseModal
      v-model="detailUser"
      :title="detailUser?.name || 'User details'"
      :hide-footer="true"
    >
      <dl
        v-if="detailUser"
        class="detail-grid"
        :class="theme.isDark ? 'detail-grid--dark' : 'detail-grid--light'"
      >
        <dt>Name</dt><dd>{{ detailUser.name }}</dd>
        <dt>Email</dt><dd>{{ detailUser.email }}</dd>
        <dt>Role</dt>
        <dd>
          <span
            class="detail-badge"
            :class="detailUser.role === 'admin' ? 'badge-admin' : 'badge-agent'"
          >
            {{ detailUser.role }}
          </span>
        </dd>
        <dt>Status</dt>
        <dd>
          <span
            class="detail-badge"
            :class="detailUser.status === 'active' ? 'badge-active' : 'badge-inactive'"
          >
            {{ detailUser.status }}
          </span>
        </dd>
        <dt>Joined</dt><dd>{{ fmtDate(detailUser.createdAt) }}</dd>
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

.detail-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-admin    { background: rgba(217,61,4,0.10);  color: #d93d04; }
.badge-agent    { background: rgba(4,119,191,0.10); color: #0477bf; }
.badge-active   { background: #EAF3DE; color: #27500A; }
.badge-inactive { background: #F1EFE8; color: #5F5E5A; }
</style>
