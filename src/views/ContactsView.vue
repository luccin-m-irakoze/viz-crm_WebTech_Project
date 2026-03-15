<script setup>
import { computed, ref, watch } from 'vue';
import { useContactsStore } from '../stores/contacts';
import { useAuthStore } from '../stores/auth';
import { useUIStore } from '../stores/ui';
import { useToastStore } from '../stores/toast';
import { useThemeStore } from '../stores/theme';
import { usePagination } from '../composables/usePagination';
import ContactTable from '../components/contacts/ContactTable.vue';
import SvgIcon from '../components/common/SvgIcon.vue';
import ContactForm from '../components/contacts/ContactForm.vue';
import BaseModal from '../components/common/BaseModal.vue';
import PaginationBar from '../components/common/PaginationBar.vue';

const props = defineProps({
  search: { type: String, default: '' }
});

const contactsStore = useContactsStore();
const auth    = useAuthStore();
const ui      = useUIStore();
const toast   = useToastStore();
const theme   = useThemeStore();

const filtered = computed(() => {
  const list  = contactsStore.contactsForCurrentUser;
  const query = (props.search || '').toLowerCase().trim();
  if (!query) return list;
  return list.filter((c) =>
    c.name.toLowerCase().includes(query) ||
    c.company.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query)
  );
});

const { currentPage, pageSize, totalPages, totalItems, rangeStart, rangeEnd, paginatedData, goToPage, nextPage, prevPage } =
  usePagination(filtered);

// ── Create / Edit modal ──────────────────────────────────────
const modalOpen      = ref(false);
const editingContact = ref(null);

watch(() => ui.pendingCreate, (val) => {
  if (val === 'contact') { openCreate(); ui.clearCreate(); }
});

function openCreate() { editingContact.value = null; modalOpen.value = true; }
function openEdit(contact) { editingContact.value = { ...contact }; modalOpen.value = true; }

// ── Delete modal ─────────────────────────────────────────────
const deleteTarget = ref(null);
function askDelete(contact) { deleteTarget.value = contact; }

async function confirmDelete() {
  if (!deleteTarget.value) return;
  const deleted = { ...deleteTarget.value };
  const id = deleted.id;
  deleteTarget.value = null;
  await contactsStore.deleteContact(id);
  toast.addToast({
    message: 'Contact deleted',
    type:    'success',
    undoFn:  () => {
      contactsStore.items.push(deleted);
    }
  });
}

// ── Detail modal ─────────────────────────────────────────────
const detailContact = ref(null);
function openDetail(contact) { detailContact.value = contact; }

// ── Submit ────────────────────────────────────────────────────
async function handleSubmit(payload) {
  if (editingContact.value) {
    await contactsStore.updateContact(editingContact.value.id, payload);
    toast.addToast({ message: 'Contact updated', type: 'success' });
  } else {
    await contactsStore.createContact({ ...payload, assignedTo: auth.user?.id });
    toast.addToast({ message: 'Contact saved successfully', type: 'success' });
  }
  modalOpen.value = false;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}
</script>

<template>
  <section class="page">
    <div class="page-header">
      <h2 class="page-header-title">Contacts</h2>
      <button
        type="button"
        class="add-btn"
        aria-label="Add contact"
        @click="openCreate"
      >
        <SvgIcon name="plus" :size="14" />
        Add contact
      </button>
    </div>
    <ContactTable
      :contacts="paginatedData"
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
      title="Delete contact"
      @confirm="confirmDelete"
    >
      Are you sure you want to delete this contact? This action cannot be undone.
    </BaseModal>

    <!-- Create / Edit -->
    <BaseModal
      v-model="modalOpen"
      :title="editingContact ? 'Edit contact' : 'New contact'"
      :hide-footer="true"
    >
      <ContactForm
        :model-value="editingContact || undefined"
        :loading="contactsStore.loading"
        @submit="handleSubmit"
      />
    </BaseModal>

    <!-- Detail view -->
    <BaseModal
      v-model="detailContact"
      :title="detailContact?.name || 'Contact details'"
      :hide-footer="true"
    >
      <dl
        v-if="detailContact"
        class="detail-grid"
        :class="theme.isDark ? 'detail-grid--dark' : 'detail-grid--light'"
      >
        <dt>Name</dt><dd>{{ detailContact.name }}</dd>
        <dt>Email</dt><dd>{{ detailContact.email }}</dd>
        <dt>Phone</dt><dd>{{ detailContact.phone || '—' }}</dd>
        <dt>Company</dt><dd>{{ detailContact.company }}</dd>
        <dt>Status</dt>
        <dd>
          <span
            class="detail-badge"
            :class="`badge-st-${detailContact.status}`"
          >
            {{ detailContact.status }}
          </span>
        </dd>
        <dt>Created</dt><dd>{{ fmtDate(detailContact.createdAt) }}</dd>
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

.detail-grid dt {
  font-weight: 500;
  opacity: 0.55;
  align-self: center;
}

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

.badge-st-active   { background: #EAF3DE; color: #27500A; }
.badge-st-inactive { background: #F1EFE8; color: #5F5E5A; }
.badge-st-lead     { background: #E6F1FB; color: #0C447C; }
</style>
