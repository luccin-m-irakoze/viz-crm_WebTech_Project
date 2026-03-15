<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import {
  validateLogin,
  validateSignup,
  validateForgotPassword
} from '../utils/validators';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const theme = useThemeStore();

const authMode = ref('login'); // 'login' | 'signup' | 'forgot' | 'reset-sent'

const loginForm = reactive({
  email: '',
  password: '',
  remember: true
});
const loginErrors = reactive({
  email: '',
  password: ''
});
const loginPasswordVisible = ref(false);

const signupForm = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const signupErrors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const signupPasswordVisible = ref(false);
const signupConfirmVisible = ref(false);

const forgotForm = reactive({
  email: ''
});
const forgotErrors = reactive({
  email: ''
});

const submitting = ref(false);

const authSubtitle = computed(() => {
  if (authMode.value === 'login') {
    return 'Welcome back. Sign in to continue.';
  }
  if (authMode.value === 'signup') {
    return 'Create your Viz CRM account.';
  }
  if (authMode.value === 'forgot') {
    return 'Enter your email to reset your password.';
  }
  if (authMode.value === 'reset-sent') {
    return 'Check your inbox.';
  }
  return '';
});

const passwordStrength = computed(() => {
  const value = signupForm.password || '';
  if (value.length >= 10 && /[0-9]/.test(value) && /[A-Za-z]/.test(value)) {
    return 'strong';
  }
  if (value.length >= 8) {
    return 'fair';
  }
  if (value.length > 0) {
    return 'weak';
  }
  return null;
});

function switchMode(mode) {
  authMode.value = mode;
}

function clearObject(obj) {
  Object.keys(obj).forEach((key) => {
    // eslint-disable-next-line no-param-reassign
    obj[key] = '';
  });
}

async function submitLogin() {
  clearObject(loginErrors);
  const errors = validateLogin(loginForm);
  Object.assign(loginErrors, errors);
  if (Object.keys(errors).length > 0) return;

  submitting.value = true;
  try {
    const success = await auth.login(loginForm.email, loginForm.password);
    if (success) {
      const redirect =
        typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
      router.push(redirect);
    }
  } finally {
    submitting.value = false;
  }
}

function submitSignup() {
  clearObject(signupErrors);
  const errors = validateSignup(signupForm);
  Object.assign(signupErrors, errors);
  if (Object.keys(errors).length > 0) return;

  const success = auth.register({
    name:     signupForm.fullName,
    email:    signupForm.email,
    password: signupForm.password,
  });

  if (!success) {
    signupErrors.email = auth.error || 'Registration failed. Please try again.';
    return;
  }

  router.push('/dashboard');
}

function submitForgot() {
  clearObject(forgotErrors);
  const errors = validateForgotPassword(forgotForm);
  Object.assign(forgotErrors, errors);
  if (Object.keys(errors).length > 0) return;

  authMode.value = 'reset-sent';
}
</script>

<template>
  <div :class="theme.isDark ? 'login-page-dark' : 'login-page-light'">
    <!-- Decorative hexagons (azure, blurred, scattered) with entrance + hover -->
    <div
      class="hex-wrap hex-wrap-1"
      style="--hex-delay: 0s"
    >
      <svg
        class="hex-deco hex-deco-1"
        width="140"
        height="160"
        viewBox="0 0 140 160"
      >
        <polygon
          points="70,5 135,37.5 135,122.5 70,155 5,122.5 5,37.5"
          fill="none"
          stroke="rgba(4,119,191,0.45)"
          stroke-width="0.5"
        />
      </svg>
    </div>
    <div
      class="hex-wrap hex-wrap-2"
      style="--hex-delay: 0.08s"
    >
      <svg
        class="hex-deco hex-deco-2"
        width="200"
        height="224"
        viewBox="0 0 200 224"
      >
        <polygon
          points="100,5 195,57 195,167 100,219 5,167 5,57"
          fill="none"
          stroke="rgba(4,119,191,0.4)"
          stroke-width="0.5"
        />
      </svg>
    </div>
    <div
      class="hex-wrap hex-wrap-3"
      style="--hex-delay: 0.16s"
    >
      <svg
        class="hex-deco hex-deco-3"
        width="100"
        height="120"
        viewBox="0 0 100 120"
      >
        <polygon
          points="50,5 95,32.5 95,87.5 50,115 5,87.5 5,32.5"
          fill="none"
          stroke="rgba(4,119,191,0.42)"
          stroke-width="0.5"
        />
      </svg>
    </div>
    <div
      class="hex-wrap hex-wrap-4"
      style="--hex-delay: 0.24s"
    >
      <svg
        class="hex-deco hex-deco-4"
        width="80"
        height="92"
        viewBox="0 0 80 92"
      >
        <polygon
          points="40,4 76,26 76,66 40,88 4,66 4,26"
          fill="none"
          stroke="rgba(4,119,191,0.38)"
          stroke-width="0.5"
        />
      </svg>
    </div>
    <div
      class="hex-wrap hex-wrap-5"
      style="--hex-delay: 0.32s"
    >
      <svg
        class="hex-deco hex-deco-5"
        width="160"
        height="184"
        viewBox="0 0 160 184"
      >
        <polygon
          points="80,4 156,50 156,134 80,180 4,134 4,50"
          fill="none"
          stroke="rgba(4,119,191,0.35)"
          stroke-width="0.5"
        />
      </svg>
    </div>

    <!-- Additional CRM-themed decorative shapes -->
    <div
      class="bg-shape bg-shape-circle bg-shape-1"
      aria-hidden="true"
    />
    <div
      class="bg-shape bg-shape-circle bg-shape-2"
      aria-hidden="true"
    />
    <div
      class="bg-shape bg-shape-ring bg-shape-3"
      aria-hidden="true"
    />
    <div
      class="bg-shape bg-shape-ring bg-shape-4"
      aria-hidden="true"
    />
    <div
      class="bg-shape bg-shape-square bg-shape-5"
      aria-hidden="true"
    />
    <div
      class="bg-shape bg-shape-square bg-shape-6"
      aria-hidden="true"
    />
    <svg
      class="bg-shape bg-shape-icon bg-shape-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="0.8"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
    <svg
      class="bg-shape bg-shape-icon bg-shape-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="0.8"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
    <svg
      class="bg-shape bg-shape-icon bg-shape-9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="0.8"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 21l-5.2-5.2M11 18a7 7 0 100-14 7 7 0 000 14z"
      />
    </svg>

    <section
      :class="theme.isDark ? 'login-card-dark' : 'login-card-light'"
      aria-labelledby="login-title"
    >
      <header class="auth-header">
        <h1
          id="login-title"
          :class="theme.isDark ? 'login-brand-dark' : 'login-brand-light'"
        >
          Viz CRM
        </h1>
        <div class="login-accent-bar" />
        <p class="auth-subtitle">
          {{ authSubtitle }}
        </p>
      </header>

      <!-- LOGIN -->
      <form
        v-if="authMode === 'login'"
        class="auth-form"
        @submit.prevent="submitLogin"
      >
        <div class="field">
          <label
            for="login-email"
            :class="theme.isDark ? 'label-dark' : 'label-light'"
          >
            Email
          </label>
          <div class="input-wrapper">
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              :class="[
                theme.isDark ? 'input-dark' : 'input-light',
                loginErrors.email ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
              ]"
              autocomplete="email"
            />
          </div>
          <p
            v-if="loginErrors.email"
            class="error-msg"
          >
            {{ loginErrors.email }}
          </p>
        </div>

        <div class="field">
          <label
            for="login-password"
            :class="theme.isDark ? 'label-dark' : 'label-light'"
          >
            Password
          </label>
          <div class="input-wrapper">
            <input
              id="login-password"
              v-model="loginForm.password"
              :type="loginPasswordVisible ? 'text' : 'password'"
              :class="[
                theme.isDark ? 'input-dark' : 'input-light',
                loginErrors.password ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
              ]"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="eye-toggle"
              @click="loginPasswordVisible = !loginPasswordVisible"
            >
              {{ loginPasswordVisible ? '🙈' : '👁' }}
            </button>
          </div>
          <p
            v-if="loginErrors.password"
            class="error-msg"
          >
            {{ loginErrors.password }}
          </p>
        </div>

        <div class="row-between">
          <label class="checkbox-row">
            <input
              v-model="loginForm.remember"
              type="checkbox"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            class="link-button"
            @click="switchMode('forgot')"
          >
            Forgot password?
          </button>
        </div>

        <button
          class="primary-auth-btn"
          type="submit"
          :disabled="submitting"
        >
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>

        <div class="divider">
          <span />
          <span>or</span>
          <span />
        </div>

        <button
          type="button"
          class="link-button center"
          @click="switchMode('signup')"
        >
          Don’t have an account? Sign up
        </button>
      </form>

      <!-- SIGNUP -->
      <form
        v-else-if="authMode === 'signup'"
        class="auth-form"
        @submit.prevent="submitSignup"
      >
        <div class="field">
          <label
            for="signup-name"
            :class="theme.isDark ? 'label-dark' : 'label-light'"
          >
            Full name
          </label>
          <input
            id="signup-name"
            v-model="signupForm.fullName"
            :class="[
              theme.isDark ? 'input-dark' : 'input-light',
              signupErrors.fullName ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
            ]"
          />
          <p
            v-if="signupErrors.fullName"
            class="error-msg"
          >
            {{ signupErrors.fullName }}
          </p>
        </div>

        <div class="field">
          <label
            for="signup-email"
            :class="theme.isDark ? 'label-dark' : 'label-light'"
          >
            Email
          </label>
          <input
            id="signup-email"
            v-model="signupForm.email"
            type="email"
            :class="[
              theme.isDark ? 'input-dark' : 'input-light',
              signupErrors.email ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
            ]"
          />
          <p
            v-if="signupErrors.email"
            class="error-msg"
          >
            {{ signupErrors.email }}
          </p>
        </div>

        <div class="field">
          <label
            for="signup-password"
            :class="theme.isDark ? 'label-dark' : 'label-light'"
          >
            Password
          </label>
          <div class="input-wrapper">
            <input
              id="signup-password"
              v-model="signupForm.password"
              :type="signupPasswordVisible ? 'text' : 'password'"
              :class="[
                theme.isDark ? 'input-dark' : 'input-light',
                signupErrors.password ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
              ]"
            />
            <button
              type="button"
              class="eye-toggle"
              @click="signupPasswordVisible = !signupPasswordVisible"
            >
              {{ signupPasswordVisible ? '🙈' : '👁' }}
            </button>
          </div>
          <p
            v-if="signupErrors.password"
            class="error-msg"
          >
            {{ signupErrors.password }}
          </p>
        </div>

        <div class="field">
          <label
            for="signup-confirm"
            :class="theme.isDark ? 'label-dark' : 'label-light'"
          >
            Confirm password
          </label>
          <div class="input-wrapper">
            <input
              id="signup-confirm"
              v-model="signupForm.confirmPassword"
              :type="signupConfirmVisible ? 'text' : 'password'"
              :class="[
                theme.isDark ? 'input-dark' : 'input-light',
                signupErrors.confirmPassword
                  ? (theme.isDark ? 'input-error-dark' : 'input-error-light')
                  : ''
              ]"
            />
            <button
              type="button"
              class="eye-toggle"
              @click="signupConfirmVisible = !signupConfirmVisible"
            >
              {{ signupConfirmVisible ? '🙈' : '👁' }}
            </button>
          </div>
          <p
            v-if="signupErrors.confirmPassword"
            class="error-msg"
          >
            {{ signupErrors.confirmPassword }}
          </p>
        </div>

        <div class="password-strength">
          <div
            class="bar"
            :class="{ active: passwordStrength === 'weak' || passwordStrength === 'fair' || passwordStrength === 'strong', weak: passwordStrength === 'weak' }"
          />
          <div
            class="bar"
            :class="{ active: passwordStrength === 'fair' || passwordStrength === 'strong', fair: passwordStrength === 'fair' }"
          />
          <div
            class="bar"
            :class="{ active: passwordStrength === 'strong', strong: passwordStrength === 'strong' }"
          />
        </div>
        <p class="strength-hint">
          Use 8+ characters with letters and numbers
        </p>

        <button
          class="primary-auth-btn"
          type="submit"
        >
          Create account
        </button>

        <button
          type="button"
          class="link-button center"
          @click="switchMode('login')"
        >
          Already have an account? Sign in
        </button>
      </form>

      <!-- FORGOT PASSWORD -->
      <form
        v-else-if="authMode === 'forgot'"
        class="auth-form"
        @submit.prevent="submitForgot"
      >
        <div class="field">
          <label
            for="forgot-email"
            :class="theme.isDark ? 'label-dark' : 'label-light'"
          >
            Email
          </label>
          <input
            id="forgot-email"
            v-model="forgotForm.email"
            type="email"
            :class="[
              theme.isDark ? 'input-dark' : 'input-light',
              forgotErrors.email ? (theme.isDark ? 'input-error-dark' : 'input-error-light') : ''
            ]"
          />
          <p
            v-if="forgotErrors.email"
            class="error-msg"
          >
            {{ forgotErrors.email }}
          </p>
        </div>

        <button
          class="primary-auth-btn"
          type="submit"
        >
          Send reset link
        </button>

        <button
          type="button"
          class="link-button center"
          @click="switchMode('login')"
        >
          Back to sign in
        </button>
      </form>

      <!-- RESET SENT -->
      <div
        v-else
        class="reset-sent"
      >
        <div class="check-icon">
          ✓
        </div>
        <h2>Reset link sent!</h2>
        <p>
          If this email is registered, you'll receive a link shortly.
        </p>
        <button
          class="primary-auth-btn"
          type="button"
          @click="switchMode('login')"
        >
          Back to sign in
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.auth-header {
  margin-bottom: 1.75rem;
}

.auth-subtitle {
  font-size: 13px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.input-wrapper {
  position: relative;
}

.eye-toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.primary-auth-btn {
  width: 100%;
  height: 42px;
  border-radius: 7px;
  border: none;
  background: #0477BF;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  font-size: 12px;
}

.divider span:first-child,
.divider span:last-child {
  flex: 1;
  height: 1px;
  background: rgba(16, 41, 64, 0.15);
}

:global(.login-card-dark) .divider span:first-child,
:global(.login-card-dark) .divider span:last-child {
  background: rgba(255, 255, 255, 0.15);
}

.link-button {
  border: none;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}

.link-button.center {
  align-self: center;
}

.password-strength {
  display: flex;
  gap: 4px;
  margin-top: 2px;
}

.password-strength .bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.06);
}

.password-strength .bar.active.weak {
  background: #D93D04;
}

.password-strength .bar.active.fair {
  background: #A6775B;
}

.password-strength .bar.active.strong {
  background: #22863a;
}

.strength-hint {
  font-size: 12px;
  margin-top: 4px;
}

.reset-sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.check-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(4, 119, 191, 0.12);
  color: #0477BF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
</style>

