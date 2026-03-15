<script setup>
import { reactive, computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useUsersStore } from '../../stores/users';
import { useToastStore } from '../../stores/toast';
import { useUIStore } from '../../stores/ui';
import { useThemeStore } from '../../stores/theme';
import { useAccessibilityStore } from '../../stores/accessibility';
import SvgIcon from './SvgIcon.vue';

const auth  = useAuthStore();
const users = useUsersStore();
const toast = useToastStore();
const ui    = useUIStore();
const theme = useThemeStore();
const a11y = useAccessibilityStore();

// ── Profile edit ──────────────────────────────────────────────
const form = reactive({ name: auth.user?.name || '' });
const nameError = ref('');

watch(() => auth.user?.name, (v) => { form.name = v || ''; });

function saveProfile() {
  if (!form.name.trim()) { nameError.value = 'Name cannot be empty'; return; }
  nameError.value = '';
  auth.updateProfile({ name: form.name });
  toast.addToast({ message: 'Profile updated', type: 'success' });
}

// ── Password change (mock) ────────────────────────────────────
const pwForm   = reactive({ current: '', next: '', confirm: '' });
const pwErrors = reactive({ current: '', next: '', confirm: '' });
const pwSuccess = ref(false);

function savePassword() {
  pwErrors.current = '';
  pwErrors.next    = '';
  pwErrors.confirm = '';
  pwSuccess.value  = false;

  // Mock validation — we don't actually check the current password value
  if (!pwForm.current) { pwErrors.current = 'Required'; return; }
  if (pwForm.next.length < 8) { pwErrors.next = 'Minimum 8 characters'; return; }
  if (pwForm.next !== pwForm.confirm) { pwErrors.confirm = 'Passwords do not match'; return; }

  pwForm.current = '';
  pwForm.next    = '';
  pwForm.confirm = '';
  pwSuccess.value = true;
  toast.addToast({ message: 'Password changed successfully', type: 'success' });
}

// ── Metadata ──────────────────────────────────────────────────
const joinedDate = computed(() => {
  const record = users.items.find((u) => u.id === auth.user?.id);
  if (!record?.createdAt) return '—';
  return new Date(record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

const initial = computed(() => auth.user?.name?.charAt(0)?.toUpperCase() || 'U');

// ── Keyboard close ────────────────────────────────────────────
function onKey(e) { if (e.key === 'Escape') ui.closeProfile(); }
onMounted(()  => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));

function onBackdrop(e) { if (e.target === e.currentTarget) ui.closeProfile(); }

// ── Tab & scroll ───────────────────────────────────────────────
const dialogRef = ref(null);
const accelRef = ref(null);

watch(() => ui.profileOpen, (open) => {
  if (open) {
    setTimeout(() => {
      dialogRef.value?.focus();
      if (ui.profileSection === 'accessibility' && accelRef.value) {
        accelRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="ui.profileOpen"
      class="profile-backdrop"
      :class="theme.isDark ? 'backdrop--dark' : 'backdrop--light'"
      role="dialog"
      aria-modal="true"
      aria-label="Profile"
      @click="onBackdrop"
    >
      <div
        ref="dialogRef"
        class="profile-modal"
        :class="theme.isDark ? 'modal--dark' : 'modal--light'"
        tabindex="-1"
      >
        <!-- Header -->
        <header
          class="modal-header"
          :class="theme.isDark ? 'modal-header--dark' : 'modal-header--light'"
        >
          <h2 class="modal-title" :class="theme.isDark ? 'title--dark' : 'title--light'">
            My Profile
          </h2>
          <button
            type="button"
            class="close-btn"
            :class="theme.isDark ? 'close-btn--dark' : 'close-btn--light'"
            aria-label="Close profile"
            @click="ui.closeProfile()"
          >
            ×
          </button>
        </header>

        <!-- Body -->
        <div class="modal-body">
          <!-- Avatar row -->
          <div class="avatar-row">
            <div class="profile-avatar">{{ initial }}</div>
            <div class="avatar-info">
              <p
                class="avatar-name"
                :class="theme.isDark ? 'text--dark' : 'text--light'"
              >
                {{ auth.user?.name }}
              </p>
              <span
                class="role-badge"
                :class="auth.user?.role === 'admin' ? 'badge-admin' : 'badge-agent'"
              >
                {{ auth.user?.role === 'admin' ? 'Administrator' : 'Sales Agent' }}
              </span>
              <p class="joined-text">Member since {{ joinedDate }}</p>
            </div>
          </div>

          <div class="divider" :class="theme.isDark ? 'divider--dark' : 'divider--light'" />

          <!-- Edit name -->
          <section class="section">
            <h3 class="section-title" :class="theme.isDark ? 'text--dark' : 'text--light'">
              Account details
            </h3>

            <div class="field-row">
              <!-- Name field (editable) -->
              <div class="field">
                <label
                  class="field-label"
                  :class="theme.isDark ? 'label-dark' : 'label-light'"
                >
                  Display name
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="field-input"
                  :class="[
                    theme.isDark ? 'input-dark' : 'input-light',
                    nameError ? 'input-err' : ''
                  ]"
                  aria-label="Display name"
                  @keydown.enter="saveProfile"
                />
                <p v-if="nameError" class="err-msg">{{ nameError }}</p>
              </div>

              <!-- Email (read-only) -->
              <div class="field">
                <label
                  class="field-label"
                  :class="theme.isDark ? 'label-dark' : 'label-light'"
                >
                  Email
                </label>
                <input
                  :value="auth.user?.email"
                  type="email"
                  class="field-input field-input--readonly"
                  :class="theme.isDark ? 'input-dark' : 'input-light'"
                  readonly
                  aria-label="Email address"
                />
                <p class="field-hint">Email cannot be changed</p>
              </div>
            </div>

            <div class="section-footer">
              <button
                type="button"
                class="save-btn"
                :class="theme.isDark ? 'save-btn--dark' : 'save-btn--light'"
                @click="saveProfile"
              >
                Save changes
              </button>
            </div>
          </section>

          <div class="divider" :class="theme.isDark ? 'divider--dark' : 'divider--light'" />

          <!-- Theme & accessibility -->
          <section
            ref="accelRef"
            class="section"
          >
            <h3 class="section-title" :class="theme.isDark ? 'text--dark' : 'text--light'">
              Theme & accessibility
            </h3>

            <div class="accel-row">
              <span class="accel-label" :class="theme.isDark ? 'label-dark' : 'label-light'">Appearance</span>
              <div class="accel-theme">
                <span class="accel-icon" :class="theme.isDark ? 'icon-muted' : 'icon-active'">
                  <SvgIcon name="sun" :size="16" />
                </span>
                <div
                  class="accel-toggle"
                  :class="theme.isDark ? 'on' : 'off'"
                  role="switch"
                  :aria-checked="theme.isDark"
                  aria-label="Toggle dark mode"
                  @click="theme.toggle()"
                >
                  <div class="accel-thumb" :class="{ on: theme.isDark }" />
                </div>
                <span class="accel-icon" :class="theme.isDark ? 'icon-active' : 'icon-muted'">
                  <SvgIcon name="moon" :size="16" />
                </span>
              </div>
            </div>

            <div class="accel-row accel-row-font">
              <div class="accel-font-block">
                <span class="accel-label" :class="theme.isDark ? 'label-dark' : 'label-light'">
                  Text size
                </span>
                <span
                  class="accel-font-value"
                  :class="theme.isDark ? 'text--dark' : 'text--light'"
                  aria-live="polite"
                >
                  {{ a11y.fontScale }}%
                </span>
              </div>
              <div class="accel-slider-wrap">
                <input
                  type="range"
                  min="100"
                  max="200"
                  step="5"
                  :value="a11y.fontScale"
                  class="accel-slider"
                  :class="theme.isDark ? 'accel-slider--dark' : 'accel-slider--light'"
                  aria-label="Text size (100% to 200%)"
                  aria-valuemin="100"
                  :aria-valuenow="a11y.fontScale"
                  aria-valuemax="200"
                  @input="(e) => a11y.setFontScale(Number(e.target.value))"
                />
              </div>
            </div>

            <div class="accel-row accel-row-col">
              <span class="accel-label" :class="theme.isDark ? 'label-dark' : 'label-light'">Color & contrast</span>
              <div class="accel-options accel-color-options">
                <button
                  type="button"
                  class="accel-opt"
                  :class="[theme.isDark ? 'opt-dark' : 'opt-light', a11y.colorMode === 'default' ? 'opt-active' : '']"
                  @click="a11y.setColorMode('default')"
                >
                  Default
                </button>
                <button
                  type="button"
                  class="accel-opt"
                  :class="[theme.isDark ? 'opt-dark' : 'opt-light', a11y.colorMode === 'grayscale' ? 'opt-active' : '']"
                  @click="a11y.setColorMode('grayscale')"
                >
                  Grayscale
                </button>
                <button
                  type="button"
                  class="accel-opt"
                  :class="[theme.isDark ? 'opt-dark' : 'opt-light', a11y.colorMode === 'high-contrast' ? 'opt-active' : '']"
                  @click="a11y.setColorMode('high-contrast')"
                >
                  High contrast
                </button>
              </div>
            </div>

            <div class="accel-row">
              <span class="accel-label" :class="theme.isDark ? 'label-dark' : 'label-light'">Reduce motion</span>
              <div
                class="accel-toggle"
                :class="a11y.reduceMotion ? 'on' : 'off'"
                role="switch"
                :aria-checked="a11y.reduceMotion"
                aria-label="Toggle reduce motion"
                @click="a11y.setReduceMotion(!a11y.reduceMotion)"
              >
                <div class="accel-thumb" :class="{ on: a11y.reduceMotion }" />
              </div>
            </div>
          </section>

          <div class="divider" :class="theme.isDark ? 'divider--dark' : 'divider--light'" />

          <!-- Change password -->
          <section class="section">
            <h3 class="section-title" :class="theme.isDark ? 'text--dark' : 'text--light'">
              Change password
            </h3>

            <div class="field-row">
              <div class="field">
                <label
                  class="field-label"
                  :class="theme.isDark ? 'label-dark' : 'label-light'"
                >
                  Current password
                </label>
                <input
                  v-model="pwForm.current"
                  type="password"
                  class="field-input"
                  :class="[
                    theme.isDark ? 'input-dark' : 'input-light',
                    pwErrors.current ? 'input-err' : ''
                  ]"
                  placeholder="••••••••"
                  aria-label="Current password"
                />
                <p v-if="pwErrors.current" class="err-msg">{{ pwErrors.current }}</p>
              </div>

              <div class="field">
                <label
                  class="field-label"
                  :class="theme.isDark ? 'label-dark' : 'label-light'"
                >
                  New password
                </label>
                <input
                  v-model="pwForm.next"
                  type="password"
                  class="field-input"
                  :class="[
                    theme.isDark ? 'input-dark' : 'input-light',
                    pwErrors.next ? 'input-err' : ''
                  ]"
                  placeholder="Min 8 characters"
                  aria-label="New password"
                />
                <p v-if="pwErrors.next" class="err-msg">{{ pwErrors.next }}</p>
              </div>

              <div class="field">
                <label
                  class="field-label"
                  :class="theme.isDark ? 'label-dark' : 'label-light'"
                >
                  Confirm password
                </label>
                <input
                  v-model="pwForm.confirm"
                  type="password"
                  class="field-input"
                  :class="[
                    theme.isDark ? 'input-dark' : 'input-light',
                    pwErrors.confirm ? 'input-err' : ''
                  ]"
                  placeholder="Repeat new password"
                  aria-label="Confirm password"
                />
                <p v-if="pwErrors.confirm" class="err-msg">{{ pwErrors.confirm }}</p>
              </div>
            </div>

            <div class="section-footer">
              <button
                type="button"
                class="save-btn"
                :class="theme.isDark ? 'save-btn--dark' : 'save-btn--light'"
                @click="savePassword"
              >
                Update password
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Backdrop */
.profile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
}

.backdrop--light { background: rgba(0, 0, 0, 0.30); }
.backdrop--dark  { background: rgba(0, 0, 0, 0.55); }

/* Modal */
.profile-modal {
  width: 100%;
  max-width: 560px;
  border-radius: 14px;
  overflow: hidden;
  outline: none;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal--light {
  background: #ffffff;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(16, 41, 64, 0.08);
}

.modal--dark {
  background: #0d1f35;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 16px;
  flex-shrink: 0;
}

.modal-header--light { border-bottom: 1px solid rgba(16, 41, 64, 0.07); }
.modal-header--dark  { border-bottom: 1px solid rgba(255, 255, 255, 0.07); }

.modal-title { font-size: 16px; font-weight: 600; margin: 0; }
.title--light { color: #102940; }
.title--dark  { color: rgba(255, 255, 255, 0.92); }

.close-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: transparent;
  font-size: 22px; line-height: 1; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s;
}

.close-btn--light       { color: rgba(16, 41, 64, 0.45); }
.close-btn--light:hover { background: rgba(16, 41, 64, 0.06); color: #102940; }
.close-btn--dark        { color: rgba(255, 255, 255, 0.4); }
.close-btn--dark:hover  { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.9); }

/* Body */
.modal-body {
  padding: 0 24px 24px;
  overflow-y: auto;
  flex: 1;
}

/* Avatar row */
.avatar-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 0 16px;
}

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--crm-blue), var(--crm-blue-mid));
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(4, 119, 191, 0.3);
}

.avatar-info { display: flex; flex-direction: column; gap: 5px; }
.avatar-name { font-size: 17px; font-weight: 600; margin: 0; }
.text--light { color: #102940; }
.text--dark  { color: rgba(255, 255, 255, 0.9); }

.role-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.badge-admin { background: rgba(217, 61, 4, 0.10); color: #d93d04; }
.badge-agent { background: rgba(4, 119, 191, 0.10); color: #0477bf; }

.joined-text { font-size: 12px; opacity: 0.45; margin: 0; }

/* Divider */
.divider { height: 1px; margin: 4px 0; }
.divider--light { background: rgba(16, 41, 64, 0.07); }
.divider--dark  { background: rgba(255, 255, 255, 0.07); }

/* Sections */
.section { padding: 16px 0; }
.section-title { font-size: 13px; font-weight: 600; margin: 0 0 14px; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.04em; }

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.field { display: flex; flex-direction: column; gap: 5px; }

.field-label { font-size: 13px; font-weight: 500; }

.field-input {
  height: 38px;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field-input--readonly { opacity: 0.55; cursor: not-allowed; }

.field-input:focus:not(.field-input--readonly) {
  border-color: rgba(4, 119, 191, 0.45);
  box-shadow: 0 0 0 2px rgba(4, 119, 191, 0.12);
}

.input-err { border-color: #d93d04 !important; }

.label-light { color: rgba(16, 41, 64, 0.75); }
.label-dark  { color: rgba(255, 255, 255, 0.65); }

.input-light {
  background: rgba(16, 41, 64, 0.03);
  border-color: rgba(16, 41, 64, 0.14);
  color: #102940;
}
.input-dark {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
}

.field-hint { font-size: 11.5px; opacity: 0.4; margin: 0; }

.err-msg { font-size: 12px; color: #d93d04; margin: 0; }

.section-footer { margin-top: 16px; display: flex; justify-content: flex-end; }

.save-btn {
  height: 36px; padding: 0 22px; border-radius: 8px;
  border: none; font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: background 0.15s;
}

.save-btn--light { background: var(--crm-blue); color: #fff; }
.save-btn--light:hover { background: var(--crm-blue-mid); }
.save-btn--dark  { background: var(--crm-blue); color: #fff; }
.save-btn--dark:hover  { background: var(--crm-blue-mid); }

/* Accessibility section */
.accel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  gap: 16px;
}

.accel-row-col {
  flex-direction: column;
  align-items: flex-start;
}

.accel-row-font {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.accel-font-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.accel-font-value {
  font-size: 14px;
  font-weight: 600;
}

.accel-slider-wrap {
  width: 100%;
}

.accel-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  cursor: pointer;
}

.accel-slider::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 4px;
}

.accel-slider--light::-webkit-slider-runnable-track {
  background: rgba(16, 41, 64, 0.12);
}

.accel-slider--dark::-webkit-slider-runnable-track {
  background: rgba(255, 255, 255, 0.15);
}

.accel-slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
}

.accel-slider--light::-moz-range-track {
  background: rgba(16, 41, 64, 0.12);
}

.accel-slider--dark::-moz-range-track {
  background: rgba(255, 255, 255, 0.15);
}

.accel-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-top: -6px;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.accel-slider--light::-webkit-slider-thumb {
  background: var(--crm-blue);
}

.accel-slider--dark::-webkit-slider-thumb {
  background: #85b7eb;
}

.accel-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.accel-slider--light::-moz-range-thumb {
  background: var(--crm-blue);
}

.accel-slider--dark::-moz-range-thumb {
  background: #85b7eb;
}

.accel-slider:focus {
  outline: none;
}

.accel-slider:focus-visible::-webkit-slider-thumb {
  outline: 2px solid var(--crm-blue);
  outline-offset: 2px;
}

.accel-slider:focus-visible::-moz-range-thumb {
  outline: 2px solid var(--crm-blue);
  outline-offset: 2px;
}

.accel-color-options .accel-opt {
  width: auto;
  min-width: 88px;
  padding: 0 12px;
  font-size: 13px;
}

.accel-label { font-size: 14px; min-width: 100px; }

.accel-theme {
  display: flex;
  align-items: center;
  gap: 8px;
}

.accel-icon { display: flex; align-items: center; }
.accel-icon.icon-active { color: var(--crm-blue); }
.accel-icon.icon-muted  { color: rgba(16,41,64,0.35); }
.modal--dark .accel-icon.icon-muted { color: rgba(255,255,255,0.35); }
.modal--dark .accel-icon.icon-active { color: #85b7eb; }

.accel-toggle {
  width: 40px; height: 22px; border-radius: 11px;
  position: relative; cursor: pointer; transition: background 0.2s;
}
.accel-toggle.off { background: #d0cec8; }
.accel-toggle.on  { background: var(--crm-blue); }

.accel-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.accel-thumb.on { transform: translateX(18px); }

.accel-options { display: flex; gap: 6px; }
.accel-opt {
  width: 32px; height: 32px; border-radius: 6px;
  border: 1px solid; font-weight: 600; font-size: 14px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.accel-opt-lg { font-size: 18px; }
.accel-opt.opt-light {
  background: rgba(16,41,64,0.04);
  border-color: rgba(16,41,64,0.2);
  color: #102940;
}
.accel-opt.opt-light.opt-active {
  background: rgba(4,119,191,0.12);
  border-color: var(--crm-blue);
  color: var(--crm-blue);
}
.accel-opt.opt-dark {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.9);
}
.accel-opt.opt-dark.opt-active {
  background: rgba(4,119,191,0.25);
  border-color: var(--crm-blue);
  color: #85b7eb;
}

@media (max-width: 560px) {
  .profile-modal { max-width: 95vw; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
