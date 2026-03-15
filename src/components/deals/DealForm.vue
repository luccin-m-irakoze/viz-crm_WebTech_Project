<script setup>
import { reactive, computed, watch } from 'vue';
import { useThemeStore } from '../../stores/theme';
import { useContactsStore } from '../../stores/contacts';
import { useAuthStore } from '../../stores/auth';
import { mockUsers } from '../../utils/mockData';

const props = defineProps({
  modelValue: {
    type:    Object,
    default: () => ({ title: '', contactId: '', value: '', stage: 'qualified', expectedCloseDate: '', notes: '' })
  },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const theme    = useThemeStore();
const contacts = useContactsStore();
const auth     = useAuthStore();

const form = reactive({
  title:             props.modelValue?.title             || '',
  contactId:         props.modelValue?.contactId         || '',
  value:             props.modelValue?.value             || '',
  stage:             props.modelValue?.stage             || 'qualified',
  assignedTo:        props.modelValue?.assignedTo        || auth.user?.id || '',
  expectedCloseDate: props.modelValue?.expectedCloseDate || '',
  notes:             props.modelValue?.notes             || ''
});

const errors = reactive({});

watch(() => props.modelValue, (v) => {
  if (!v) return;
  form.title             = v.title || '';
  form.contactId         = v.contactId || '';
  form.value             = v.value || '';
  form.stage             = v.stage || 'qualified';
  form.assignedTo        = v.assignedTo || auth.user?.id || '';
  form.expectedCloseDate = v.expectedCloseDate || '';
  form.notes             = v.notes || '';
});

const isDisabled = computed(() => props.loading);

const agents = computed(() =>
  auth.isAdmin ? mockUsers : mockUsers.filter((u) => u.id === auth.user?.id)
);

function validate() {
  const errs = {};
  if (!form.title.trim()) errs.title = 'Title is required';
  if (!form.contactId) errs.contactId = 'Contact is required';
  if (!form.value || isNaN(Number(form.value))) errs.value = 'Valid value is required';
  return errs;
}

function handleSubmit(e) {
  e.preventDefault();
  const errs = validate();
  Object.assign(errors, errs);
  Object.keys(errors).forEach((k) => { if (!errs[k]) delete errors[k]; });
  if (Object.keys(errs).length) return;

  emit('submit', {
    title:             form.title.trim(),
    contactId:         Number(form.contactId),
    value:             Number(form.value),
    stage:             form.stage,
    assignedTo:        Number(form.assignedTo) || auth.user?.id,
    expectedCloseDate: form.expectedCloseDate,
    notes:             form.notes.trim()
  });
}
</script>

<template>
  <form class="deal-form" novalidate @submit="handleSubmit">
    <!-- Title -->
    <div class="field span-2">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Title</label>
      <input
        v-model="form.title"
        type="text"
        :class="[theme.isDark ? 'input-dark' : 'input-light', errors.title ? 'input-err' : '']"
        placeholder="Deal title"
        aria-label="Title"
      />
      <p v-if="errors.title" class="err-msg">{{ errors.title }}</p>
    </div>

    <!-- Contact -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Contact</label>
      <select
        v-model="form.contactId"
        :class="[theme.isDark ? 'input-dark' : 'input-light', errors.contactId ? 'input-err' : '']"
        aria-label="Contact"
      >
        <option value="">Select contact…</option>
        <option v-for="c in contacts.items" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <p v-if="errors.contactId" class="err-msg">{{ errors.contactId }}</p>
    </div>

    <!-- Value -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Value (RWF)</label>
      <input
        v-model="form.value"
        type="number"
        min="0"
        step="500"
        :class="[theme.isDark ? 'input-dark' : 'input-light', errors.value ? 'input-err' : '']"
        placeholder="0"
        aria-label="Value"
      />
      <p v-if="errors.value" class="err-msg">{{ errors.value }}</p>
    </div>

    <!-- Stage -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Stage</label>
      <select v-model="form.stage" :class="theme.isDark ? 'input-dark' : 'input-light'" aria-label="Stage">
        <option value="qualified">Qualified</option>
        <option value="proposal">Proposal</option>
        <option value="negotiation">Negotiation</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>
    </div>

    <!-- Expected close -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Expected close</label>
      <input
        v-model="form.expectedCloseDate"
        type="date"
        :class="theme.isDark ? 'input-dark' : 'input-light'"
        aria-label="Expected close date"
      />
    </div>

    <!-- Assigned to (admin only) -->
    <div v-if="auth.isAdmin" class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Assigned to</label>
      <select v-model="form.assignedTo" :class="theme.isDark ? 'input-dark' : 'input-light'" aria-label="Assigned to">
        <option v-for="u in agents" :key="u.id" :value="u.id">{{ u.name }}</option>
      </select>
    </div>

    <!-- Notes -->
    <div class="field span-2">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Notes</label>
      <textarea
        v-model="form.notes"
        rows="3"
        :class="theme.isDark ? 'input-dark' : 'input-light'"
        placeholder="Optional notes…"
        aria-label="Notes"
      />
    </div>

    <!-- Footer -->
    <div class="form-footer span-2">
      <button type="button" class="cancel-btn" @click="emit('cancel')">Cancel</button>
      <button
        type="submit"
        class="save-btn"
        :class="theme.isDark ? 'save-btn--dark' : 'save-btn--light'"
        :disabled="isDisabled"
      >
        {{ loading ? 'Saving…' : 'Save deal' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.deal-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem 1rem;
}

.field { display: flex; flex-direction: column; gap: 0.3rem; }
.span-2 { grid-column: 1 / -1; }
textarea { resize: vertical; min-height: 70px; }

.err-msg  { font-size: 12px; color: #d93d04; margin: 0; }
.input-err { border-color: #d93d04 !important; }

.form-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

.cancel-btn {
  height: 38px; padding: 0 18px; border-radius: 7px;
  border: 1px solid rgba(16,41,64,0.18); background: transparent;
  font-size: 14px; cursor: pointer; color: inherit;
}

.save-btn {
  height: 38px; padding: 0 24px; border-radius: 7px;
  border: none; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.15s;
}

.save-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.save-btn--light { background: #0477bf; color: #fff; }
.save-btn--light:hover:not(:disabled) { background: #0569a8; }
.save-btn--dark  { background: #0477bf; color: #fff; }

@media (max-width: 560px) { .deal-form { grid-template-columns: 1fr; } }
</style>
