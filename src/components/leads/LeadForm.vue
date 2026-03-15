<script setup>
import { computed } from 'vue';
import { useForm } from '../../composables/useForm';
import { validateLead, sanitizeString } from '../../utils/validators';
import { useContactsStore } from '../../stores/contacts';
import { useThemeStore } from '../../stores/theme';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ title: '', value: '', status: 'new', contactId: '' })
  },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const { form, errors, setErrors, reset } = useForm(props.modelValue);
const contactsStore = useContactsStore();
const theme = useThemeStore();

const isDisabled = computed(() => props.loading);

function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    title:     sanitizeString(form.title),
    value:     form.value,
    status:    form.status,
    contactId: Number(form.contactId)
  };
  const validationErrors = validateLead(payload);
  setErrors(validationErrors);
  if (Object.keys(validationErrors).length) return;
  emit('submit', payload);
  reset();
}

function updateField(field, value) {
  form[field] = value;
  emit('update:modelValue', { ...form });
}
</script>

<template>
  <form class="lead-form" novalidate @submit="handleSubmit">
    <div class="field">
      <label
        for="lead-title"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Title
      </label>
      <input
        id="lead-title"
        v-model="form.title"
        type="text"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.title ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        required
        aria-required="true"
        :aria-invalid="!!errors.title"
        @input="updateField('title', form.title)"
      />
      <p v-if="errors.title" class="error-msg">{{ errors.title }}</p>
    </div>

    <div class="field">
      <label
        for="lead-value"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Value (RWF)
      </label>
      <input
        id="lead-value"
        v-model="form.value"
        type="number"
        min="0"
        step="100"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.value ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        required
        aria-required="true"
        :aria-invalid="!!errors.value"
        @input="updateField('value', form.value)"
      />
      <p v-if="errors.value" class="error-msg">{{ errors.value }}</p>
    </div>

    <div class="field">
      <label
        for="lead-status"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Status
      </label>
      <select
        id="lead-status"
        v-model="form.status"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.status ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        required
        aria-required="true"
        :aria-invalid="!!errors.status"
        @change="updateField('status', form.status)"
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="lost">Lost</option>
        <option value="won">Won</option>
      </select>
      <p v-if="errors.status" class="error-msg">{{ errors.status }}</p>
    </div>

    <div class="field">
      <label
        for="lead-contact"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Related contact
      </label>
      <select
        id="lead-contact"
        v-model="form.contactId"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.contactId ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        required
        aria-required="true"
        :aria-invalid="!!errors.contactId"
        @change="updateField('contactId', form.contactId)"
      >
        <option value="">Select a contact</option>
        <option
          v-for="contact in contactsStore.items"
          :key="contact.id"
          :value="contact.id"
        >
          {{ contact.name }} — {{ contact.company }}
        </option>
      </select>
      <p v-if="errors.contactId" class="error-msg">{{ errors.contactId }}</p>
    </div>

    <div class="form-footer">
      <button
        type="submit"
        class="save-btn"
        :class="theme.isDark ? 'save-btn--dark' : 'save-btn--light'"
        :disabled="isDisabled"
      >
        <span v-if="!loading">Save lead</span>
        <span v-else>Saving…</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.lead-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1rem;
  align-items: flex-start;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.save-btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 7px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.save-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.save-btn--light { background: #0477bf; color: #ffffff; }
.save-btn--light:hover:not(:disabled) { background: #0569a8; }
.save-btn--dark  { background: #0477bf; color: #ffffff; }
.save-btn--dark:hover:not(:disabled)  { background: #0569a8; }

@media (max-width: 600px) {
  .lead-form { grid-template-columns: 1fr; }
}
</style>
