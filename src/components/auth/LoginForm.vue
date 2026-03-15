<script setup>
import { reactive, computed } from 'vue';
import { useThemeStore } from '../../stores/theme';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['submit-login']);
const theme = useThemeStore();

const form = reactive({
  email: '',
  password: ''
});

const localErrors = reactive({
  email: '',
  password: ''
});

const isDisabled = computed(() => props.loading);

function validate() {
  localErrors.email = '';
  localErrors.password = '';

  if (!form.email.trim()) {
    localErrors.email = 'Email is required.';
  }
  if (!form.password.trim()) {
    localErrors.password = 'Password is required.';
  }

  return !localErrors.email && !localErrors.password;
}

function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;
  emit('submit-login', { email: form.email.trim(), password: form.password });
}
</script>

<template>
  <form
    class="login-form"
    novalidate
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label
        for="email"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Email
      </label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :class="theme.isDark ? 'input-dark' : 'input-light'"
        autocomplete="email"
        required
        aria-required="true"
        :aria-invalid="!!localErrors.email || !!error"
      />
      <p
        v-if="localErrors.email"
        class="error-msg"
      >
        {{ localErrors.email }}
      </p>
    </div>

    <div class="form-group">
      <label
        for="password"
        :class="theme.isDark ? 'label-dark' : 'label-light'"
      >
        Password
      </label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        :class="theme.isDark ? 'input-dark' : 'input-light'"
        autocomplete="current-password"
        required
        aria-required="true"
        :aria-invalid="!!localErrors.password || !!error"
      />
      <p
        v-if="localErrors.password"
        class="error-msg"
      >
        {{ localErrors.password }}
      </p>
    </div>

    <p
      v-if="error"
      class="error-msg"
      role="alert"
    >
      {{ error }}
    </p>

    <button
      class="btn-primary"
      type="submit"
      :disabled="isDisabled"
    >
      <span v-if="!loading">Sign in</span>
      <span v-else>Signing in…</span>
    </button>

    <p class="hint">
      Use <strong>admin@vizcrm.com / Admin@123</strong> or
      <strong>agent@vizcrm.com / Agent@123</strong>
    </p>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}
</style>

