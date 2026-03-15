<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useContactsStore } from '../../stores/contacts';
import { useLeadsStore } from '../../stores/leads';
import { useUsersStore } from '../../stores/users';
import { useThemeStore } from '../../stores/theme';
import { useUIStore } from '../../stores/ui';
import SvgIcon from './SvgIcon.vue';

const auth = useAuthStore();
const contactsStore = useContactsStore();
const leadsStore = useLeadsStore();
const usersStore = useUsersStore();
const theme = useThemeStore();
const ui = useUIStore();
const route = useRoute();
const router = useRouter();

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  statusFilter: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:search', 'update:status-filter']);

const userName = computed(() => auth.user?.name || '');
const userRole = computed(() => auth.user?.role || '');

const search = computed({
  get: () => props.search || '',
  set: (value) => emit('update:search', value)
});

const statusFilter = computed({
  get: () => props.statusFilter || '',
  set: (value) => emit('update:status-filter', value)
});

const showAvatarMenu = ref(false);
const avatarWrapperRef = ref(null);

function handleClickOutside(e) {
  if (avatarWrapperRef.value && !avatarWrapperRef.value.contains(e.target)) {
    showAvatarMenu.value = false;
  }
}

watch(showAvatarMenu, (open) => {
  if (open) {
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const title = computed(() => {
  const map = {
    dashboard: 'Dashboard',
    contacts: 'Contacts',
    leads: 'Leads',
    deals: 'Deals',
    activities: 'Activities',
    users: 'Users',
    reports: 'Reports',
    performance: 'My Performance'
  };
  return map[route.name] || 'Viz CRM';
});

const subtitle = computed(() => {
  if (route.name === 'dashboard') return `Good morning, ${userName.value || 'there'}`;
  if (route.name === 'contacts') return `${contactsStore.contactsForCurrentUser.length} contacts`;
  if (route.name === 'leads') {
    const active = leadsStore.leadsForCurrentUser.filter(
      (l) => l.status !== 'lost' && l.status !== 'won'
    ).length;
    return `${active} active leads`;
  }
  if (route.name === 'users') return `${usersStore.items.length} users`;
  if (route.name === 'deals') return 'Pipeline';
  if (route.name === 'activities') return 'Tasks';
  if (route.name === 'reports') return 'Insights';
  if (route.name === 'performance') return 'Your metrics';
  return '';
});

const showSearch = computed(() => route.name === 'contacts' || route.name === 'leads');
const showStatusFilter = computed(() => route.name === 'leads');

function handleLogout() {
  auth.logout();
  router.push({ name: 'login' });
}

function toggleAvatarMenu() {
  showAvatarMenu.value = !showAvatarMenu.value;
}

</script>

<template>
  <header :class="theme.isDark ? 'dark-topbar' : 'light-topbar'">
    <div class="tp-actions tp-actions-left">
      <div class="title-block">
        <span :class="theme.isDark ? 'tp-title-dark' : 'tp-title-light'">
          {{ title }}
        </span>
        <p
          v-if="subtitle"
          class="tp-subtitle"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>

    <div class="tp-actions tp-actions-right">
      <div
        v-if="showSearch"
        class="topbar-search"
        :class="theme.isDark ? 'topbar-search--dark' : 'topbar-search--light'"
      >
        <span class="search-icon">
          <SvgIcon
            name="search"
            :size="16"
          />
        </span>
        <input
          v-model="search"
          type="search"
          class="topbar-search-input"
          :class="theme.isDark ? 'topbar-search-input--dark' : 'topbar-search-input--light'"
          placeholder="Search…"
          :aria-label="'Search'"
        />
      </div>

      <select
        v-if="showStatusFilter"
        v-model="statusFilter"
        class="topbar-select"
        :class="theme.isDark ? 'topbar-select--dark' : 'topbar-select--light'"
      >
        <option value="">All statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>

      <div
        v-if="auth.isAuthenticated"
        ref="avatarWrapperRef"
        class="avatar-wrapper"
      >
        <button
          type="button"
          class="avatar-button"
          @click="toggleAvatarMenu"
        >
          <span class="avatar-initials">
            {{ userName.charAt(0) }}
          </span>
        </button>
        <div
          v-if="showAvatarMenu"
          class="avatar-menu"
          :class="theme.isDark ? 'avatar-menu--dark' : 'avatar-menu--light'"
        >
          <button
            type="button"
            class="avatar-menu-item"
            @click="() => { showAvatarMenu = false; ui.openProfile(); }"
          >
            Profile
          </button>
          <div
            class="avatar-menu-theme"
            :class="theme.isDark ? 'theme-row--dark' : 'theme-row--light'"
          >
            <span class="theme-label">Theme</span>
            <span class="toggle-icon" :class="theme.isDark ? 'ti-dark-muted' : 'ti-light-active'" aria-hidden="true">
              <SvgIcon name="sun" :size="14" />
            </span>
            <div
              class="toggle-track"
              :class="theme.isDark ? 'on' : 'off'"
              @click="theme.toggle()"
              role="switch"
              :aria-checked="theme.isDark"
              aria-label="Toggle dark mode"
            >
              <div class="toggle-thumb" :class="{ on: theme.isDark }" />
            </div>
            <span class="toggle-icon" :class="theme.isDark ? 'ti-dark-active' : 'ti-light-muted'" aria-hidden="true">
              <SvgIcon name="moon" :size="14" />
            </span>
          </div>
          <button
            type="button"
            class="avatar-menu-item"
            @click="() => { showAvatarMenu = false; ui.openProfile('accessibility'); }"
          >
            Accessibility settings
          </button>
          <button
            type="button"
            class="avatar-menu-item"
            @click="() => { showAvatarMenu = false; handleLogout(); }"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.tp-actions-left {
  display: flex;
  align-items: center;
}

.title-block {
  display: flex;
  flex-direction: column;
}

.tp-subtitle {
  font-size: 13px;
  margin-top: 2px;
}

:global(.light-topbar) .tp-subtitle {
  color: rgba(16, 41, 64, 0.65);
}

:global(.dark-topbar) .tp-subtitle {
  color: rgba(255, 255, 255, 0.62);
}

.tp-actions-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-search {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: inherit;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.topbar-search--light .search-icon { color: rgba(16, 41, 64, 0.5); }
.topbar-search--dark .search-icon  { color: rgba(255, 255, 255, 0.5); }

.topbar-search-input {
  width: 100%;
  height: 38px;
  border-radius: 10px;
  padding: 0 14px 0 38px;
  border: 1px solid;
  font-size: 14px;
  transition: background 0.15s, border-color 0.15s;
}

.topbar-search-input--light {
  background: rgba(16, 41, 64, 0.04);
  border-color: rgba(16, 41, 64, 0.12);
  color: #102940;
}

.topbar-search-input--light::placeholder {
  color: rgba(16, 41, 64, 0.45);
}

.topbar-search-input--light:focus {
  outline: none;
  background: rgba(16, 41, 64, 0.06);
  border-color: rgba(4, 119, 191, 0.35);
  box-shadow: 0 0 0 2px rgba(4, 119, 191, 0.1);
}

.topbar-search-input--dark {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
}

.topbar-search-input--dark::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.topbar-search-input--dark:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(4, 119, 191, 0.5);
  box-shadow: 0 0 0 2px rgba(4, 119, 191, 0.15);
}

.topbar-select {
  height: 38px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 14px;
  border: 1px solid;
  transition: background 0.15s, border-color 0.15s;
}

.topbar-select--light {
  background: rgba(16, 41, 64, 0.04);
  border-color: rgba(16, 41, 64, 0.12);
  color: #102940;
}

.topbar-select--dark {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Light mode */
.ti-light-active { color: rgba(16, 41, 64, 0.75); }
.ti-light-muted  { color: rgba(16, 41, 64, 0.32); }

/* Dark mode */
.ti-dark-active  { color: rgba(255, 255, 255, 0.88); }
.ti-dark-muted   { color: rgba(255, 255, 255, 0.38); }

.avatar-wrapper {
  position: relative;
}

.avatar-button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: var(--crm-blue);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.avatar-initials {
  font-size: 13px;
  font-weight: 600;
}

.avatar-menu {
  position: absolute;
  right: 0;
  margin-top: 6px;
  min-width: 200px;
  border-radius: 8px;
  padding: 6px 0;
  z-index: 10;
}

.avatar-menu-theme {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 10px;
  margin: 4px 0;
  border-top: 1px solid rgba(16, 41, 64, 0.06);
  border-bottom: 1px solid rgba(16, 41, 64, 0.06);
}

.avatar-menu--dark .avatar-menu-theme {
  border-top-color: rgba(255, 255, 255, 0.08);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.theme-label {
  font-size: 12px;
  font-weight: 500;
  min-width: 44px;
}

.theme-row--light .theme-label { color: rgba(16, 41, 64, 0.6); }
.theme-row--dark .theme-label  { color: rgba(255, 255, 255, 0.6); }

.avatar-menu-theme .toggle-track {
  width: 28px;
  height: 16px;
  border-radius: 8px;
}

.avatar-menu-theme .toggle-thumb {
  width: 12px;
  height: 12px;
  top: 2px;
  left: 2px;
}

.avatar-menu-theme .toggle-thumb.on {
  transform: translateX(12px);
}

.avatar-menu-theme .toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-menu--light {
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(16, 41, 64, 0.06);
}

.avatar-menu--dark {
  background: rgba(16, 41, 64, 0.96);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-menu-item {
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.12s;
}

.avatar-menu--light .avatar-menu-item {
  color: #102940;
}

.avatar-menu--light .avatar-menu-item:hover {
  background: rgba(16, 41, 64, 0.05);
}

.avatar-menu--dark .avatar-menu-item {
  color: rgba(255, 255, 255, 0.9);
}

.avatar-menu--dark .avatar-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

