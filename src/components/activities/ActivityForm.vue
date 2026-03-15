<script setup>
import { reactive, computed, watch } from 'vue';
import { useThemeStore } from '../../stores/theme';
import { useContactsStore } from '../../stores/contacts';
import { useLeadsStore } from '../../stores/leads';
import { useAuthStore } from '../../stores/auth';
import { mockUsers } from '../../utils/mockData';

const props = defineProps({
  modelValue: {
    type:    Object,
    default: () => ({ subject: '', type: 'call', relatedTo: { type: 'contact', id: '' }, dueDate: '', owner: '', notes: '' })
  },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const theme    = useThemeStore();
const contacts = useContactsStore();
const leads    = useLeadsStore();
const auth     = useAuthStore();

const form = reactive({
  subject:     props.modelValue?.subject   || '',
  type:        props.modelValue?.type      || 'call',
  relatedType: props.modelValue?.relatedTo?.type || 'contact',
  relatedId:   props.modelValue?.relatedTo?.id  || '',
  dueDate:     props.modelValue?.dueDate   || '',
  owner:       props.modelValue?.owner     || auth.user?.id || '',
  notes:       props.modelValue?.notes     || ''
});

const errors = reactive({});

watch(() => props.modelValue, (v) => {
  if (v) {
    form.subject   = v.subject || '';
    form.type      = v.type || 'call';
    form.relatedType = v.relatedTo?.type || 'contact';
    form.relatedId   = v.relatedTo?.id  || '';
    form.dueDate   = v.dueDate || '';
    form.owner     = v.owner || auth.user?.id || '';
    form.notes     = v.notes || '';
  }
});

const isDisabled = computed(() => props.loading);

const agents = computed(() =>
  auth.isAdmin ? mockUsers : mockUsers.filter((u) => u.id === auth.user?.id)
);

function validate() {
  const errs = {};
  if (!form.subject.trim()) errs.subject = 'Subject is required';
  if (!form.dueDate) errs.dueDate = 'Due date is required';
  if (!form.relatedId) errs.relatedId = 'Related record is required';
  return errs;
}

function handleSubmit(e) {
  e.preventDefault();
  const errs = validate();
  Object.assign(errors, errs);
  Object.keys(errors).forEach((k) => { if (!errs[k]) delete errors[k]; });
  if (Object.keys(errs).length) return;

  emit('submit', {
    subject:   form.subject.trim(),
    type:      form.type,
    relatedTo: { type: form.relatedType, id: Number(form.relatedId) },
    dueDate:   form.dueDate,
    owner:     Number(form.owner) || auth.user?.id,
    notes:     form.notes.trim()
  });
}
</script>

<template>
  <form class="act-form" novalidate @submit="handleSubmit">
    <!-- Subject -->
    <div class="field span-2">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Subject</label>
      <input
        v-model="form.subject"
        type="text"
        :class="[theme.isDark ? 'input-dark' : 'input-light', errors.subject ? 'input-err' : '']"
        placeholder="Activity subject"
        aria-label="Subject"
      />
      <p v-if="errors.subject" class="err-msg">{{ errors.subject }}</p>
    </div>

    <!-- Type -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Type</label>
      <select v-model="form.type" :class="theme.isDark ? 'input-dark' : 'input-light'">
        <option value="call">Call</option>
        <option value="email">Email</option>
        <option value="visit">Visit</option>
      </select>
    </div>

    <!-- Due Date -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Due Date</label>
      <input
        v-model="form.dueDate"
        type="date"
        :class="[theme.isDark ? 'input-dark' : 'input-light', errors.dueDate ? 'input-err' : '']"
        aria-label="Due date"
      />
      <p v-if="errors.dueDate" class="err-msg">{{ errors.dueDate }}</p>
    </div>

    <!-- Related to type -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Linked to</label>
      <select v-model="form.relatedType" :class="theme.isDark ? 'input-dark' : 'input-light'">
        <option value="contact">Contact</option>
        <option value="lead">Lead</option>
      </select>
    </div>

    <!-- Related record -->
    <div class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Record</label>
      <select
        v-model="form.relatedId"
        :class="[theme.isDark ? 'input-dark' : 'input-light', errors.relatedId ? 'input-err' : '']"
        aria-label="Related record"
      >
        <option value="">Select…</option>
        <template v-if="form.relatedType === 'contact'">
          <option
            v-for="c in contacts.items"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </option>
        </template>
        <template v-else>
          <option
            v-for="l in leads.items"
            :key="l.id"
            :value="l.id"
          >
            {{ l.title }}
          </option>
        </template>
      </select>
      <p v-if="errors.relatedId" class="err-msg">{{ errors.relatedId }}</p>
    </div>

    <!-- Owner (admin only sees all agents) -->
    <div v-if="auth.isAdmin" class="field">
      <label :class="theme.isDark ? 'label-dark' : 'label-light'">Owner</label>
      <select v-model="form.owner" :class="theme.isDark ? 'input-dark' : 'input-light'">
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
      <button
        type="button"
        class="cancel-btn"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="save-btn"
        :class="theme.isDark ? 'save-btn--dark' : 'save-btn--light'"
        :disabled="isDisabled"
      >
        {{ loading ? 'Saving…' : 'Save activity' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.act-form {
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
.save-btn--dark:hover:not(:disabled)  { background: #0569a8; }

@media (max-width: 560px) { .act-form { grid-template-columns: 1fr; } }
</style>
