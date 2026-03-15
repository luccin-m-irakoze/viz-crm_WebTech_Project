<script setup>
import { computed } from 'vue';
import { useForm } from '../../composables/useForm';
import { validateContact, sanitizeString } from '../../utils/validators';
import { useThemeStore } from '../../stores/theme';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ name: '', email: '', phone: '', company: '', status: 'active' })
  },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const { form, errors, setErrors, reset } = useForm(props.modelValue);
const theme = useThemeStore();

const isDisabled = computed(() => props.loading);

function handleSubmit(e) {
  e.preventDefault();
  const payload = {
    name:    sanitizeString(form.name),
    email:   sanitizeString(form.email),
    phone:   sanitizeString(form.phone),
    company: sanitizeString(form.company),
    status:  form.status || 'active'
  };
  const validationErrors = validateContact(payload);
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
  <form class="contact-form" novalidate @submit="handleSubmit">
    <div class="field">
      <label
        for="contact-name"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Name
      </label>
      <input
        id="contact-name"
        v-model="form.name"
        type="text"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.name ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        required
        aria-required="true"
        :aria-invalid="!!errors.name"
        @input="updateField('name', form.name)"
      />
      <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
    </div>

    <div class="field">
      <label
        for="contact-email"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Email
      </label>
      <input
        id="contact-email"
        v-model="form.email"
        type="email"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.email ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        required
        aria-required="true"
        :aria-invalid="!!errors.email"
        @input="updateField('email', form.email)"
      />
      <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
    </div>

    <div class="field">
      <label
        for="contact-phone"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Phone
      </label>
      <input
        id="contact-phone"
        v-model="form.phone"
        type="tel"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.phone ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        :aria-invalid="!!errors.phone"
        @input="updateField('phone', form.phone)"
      />
      <p v-if="errors.phone" class="error-msg">{{ errors.phone }}</p>
    </div>

    <div class="field">
      <label
        for="contact-company"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Company
      </label>
      <input
        id="contact-company"
        v-model="form.company"
        type="text"
        :class="[
          theme.isDark ? 'input-dark' : 'input-light',
          errors.company ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
        ]"
        required
        aria-required="true"
        :aria-invalid="!!errors.company"
        @input="updateField('company', form.company)"
      />
      <p v-if="errors.company" class="error-msg">{{ errors.company }}</p>
    </div>

    <div class="field">
      <label
        for="contact-status"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Status
      </label>
      <select
        id="contact-status"
        v-model="form.status"
        :class="theme.isDark ? 'input-dark' : 'input-light'"
        @change="updateField('status', form.status)"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="lead">Lead</option>
      </select>
    </div>

    <div class="form-footer">
      <button
        type="submit"
        class="save-btn"
        :class="theme.isDark ? 'save-btn--dark' : 'save-btn--light'"
        :disabled="isDisabled"
      >
        <span v-if="!loading">Save contact</span>
        <span v-else>Saving…</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.contact-form {
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
  .contact-form { grid-template-columns: 1fr; }
}
</style>
