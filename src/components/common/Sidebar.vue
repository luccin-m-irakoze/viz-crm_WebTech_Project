<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import { useUIStore } from '../../stores/ui';
import SvgIcon from './SvgIcon.vue';

const auth  = useAuthStore();
const route = useRoute();
const router = useRouter();
const theme  = useThemeStore();
const ui     = useUIStore();

const showFooterMenu   = ref(false);
const footerWrapperRef = ref(null);

function onDocumentClick(e) {
  if (showFooterMenu.value && footerWrapperRef.value && !footerWrapperRef.value.contains(e.target)) {
    showFooterMenu.value = false;
  }
}

onMounted(()  => document.addEventListener('click', onDocumentClick));
onUnmounted(() => document.removeEventListener('click', onDocumentClick));

const navItems = computed(() => {
  const base = [
    { name: 'Dashboard',     routeName: 'dashboard' },
    { name: 'Contacts',      routeName: 'contacts'  },
    { name: 'Leads',         routeName: 'leads'     },
    { name: 'Deals',         routeName: 'deals'     },
    { name: 'Activities',    routeName: 'activities'},
  ];
  if (auth.isAdmin) {
    base.push({ name: 'Users',   routeName: 'users'   });
    base.push({ name: 'Reports', routeName: 'reports' });
  }
  if (auth.isAgent) {
    base.push({ name: 'My Performance', routeName: 'performance' });
  }
  return base;
});

const roleLabel = computed(() =>
  auth.user?.role === 'admin' ? 'Administrator' : 'Sales Agent'
);

function navigate(name) { router.push({ name }); }

function toggleFooterMenu() { showFooterMenu.value = !showFooterMenu.value; }

function handleLogout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside :class="theme.isDark ? 'dark-sidebar' : 'light-sidebar'">
    <!-- Glow blobs (behind content) -->
    <div
      class="sb-blob sb-blob--tl"
      :class="theme.isDark ? 'sb-blob--tl-dark' : 'sb-blob--tl-light'"
      aria-hidden="true"
    />
    <div
      class="sb-blob sb-blob--br"
      :class="theme.isDark ? 'sb-blob--br-dark' : 'sb-blob--br-light'"
      aria-hidden="true"
    />

    <!-- Branding -->
    <div class="sb-brand sb-z">
      <div class="sb-brand-name">Viz CRM</div>
      <span class="sidebar-role">{{ roleLabel }}</span>
    </div>

    <!-- Navigation -->
    <nav
      class="sb-nav sb-z"
      aria-label="Main navigation"
    >
      <div
        v-for="item in navItems"
        :key="item.routeName"
        class="sb-item"
        :class="[
          route.name === item.routeName
            ? (theme.isDark ? 'sb-item--active-dark' : 'sb-item--active-light')
            : (theme.isDark ? 'sb-item--dark' : 'sb-item--light')
        ]"
        role="button"
        :aria-current="route.name === item.routeName ? 'page' : undefined"
        :tabindex="0"
        @click="navigate(item.routeName)"
        @keydown.enter="navigate(item.routeName)"
      >
        <span>{{ item.name }}</span>
      </div>
    </nav>

    <!-- Footer user -->
    <div
      v-if="auth.isAuthenticated"
      class="sb-footer sb-z"
    >
      <div
        ref="footerWrapperRef"
        class="sb-footer-wrapper"
      >
        <button
          type="button"
          class="sb-footer-trigger"
          :class="theme.isDark ? 'sb-footer-trigger--dark' : 'sb-footer-trigger--light'"
          aria-haspopup="true"
          :aria-expanded="showFooterMenu"
          @click.stop="toggleFooterMenu"
        >
          <div class="sb-avatar">{{ auth.user?.name?.charAt(0) || 'U' }}</div>
          <div class="sb-user-text">
            <span class="sb-uname">{{ auth.user?.name || 'User' }}</span>
            <span class="sb-urole">{{ auth.user?.role || 'role' }}</span>
          </div>
        </button>

        <div
          v-if="showFooterMenu"
          class="sb-footer-menu"
          :class="theme.isDark ? 'sb-footer-menu--dark' : 'sb-footer-menu--light'"
          role="menu"
        >
          <button
            type="button"
            class="sb-footer-menu-item"
            role="menuitem"
            @click="() => { showFooterMenu = false; ui.openProfile(); }"
          >
            Profile
          </button>
          <div
            class="sb-footer-menu-theme"
            :class="theme.isDark ? 'sb-theme--dark' : 'sb-theme--light'"
          >
            <span class="sb-theme-label">Theme</span>
            <span class="sb-theme-icon" :class="theme.isDark ? 'sb-ti-muted' : 'sb-ti-active'">
              <SvgIcon name="sun" :size="14" />
            </span>
            <div
              class="sb-toggle-track"
              :class="theme.isDark ? 'on' : 'off'"
              @click="theme.toggle()"
              role="switch"
              :aria-checked="theme.isDark"
              aria-label="Toggle dark mode"
            >
              <div class="sb-toggle-thumb" :class="{ on: theme.isDark }" />
            </div>
            <span class="sb-theme-icon" :class="theme.isDark ? 'sb-ti-active' : 'sb-ti-muted'">
              <SvgIcon name="moon" :size="14" />
            </span>
          </div>
          <button
            type="button"
            class="sb-footer-menu-item"
            role="menuitem"
            @click="() => { showFooterMenu = false; ui.openProfile('accessibility'); }"
          >
            Accessibility settings
          </button>
          <button
            type="button"
            class="sb-footer-menu-item"
            role="menuitem"
            @click="() => { showFooterMenu = false; handleLogout(); }"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Glow blobs */
.sb-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.sb-blob--tl {
  width: 180px;
  height: 180px;
  top: -40px;
  left: -40px;
}

.sb-blob--br {
  width: 160px;
  height: 160px;
  bottom: -30px;
  right: -30px;
}

.sb-blob--tl-dark  { background: radial-gradient(circle, rgba(217,61,4,0.30) 0%, transparent 70%); }
.sb-blob--tl-light { background: radial-gradient(circle, rgba(217,61,4,0.12) 0%, transparent 70%); }
.sb-blob--br-dark  { background: radial-gradient(circle, rgba(4,119,191,0.25) 0%, transparent 70%); }
.sb-blob--br-light { background: radial-gradient(circle, rgba(4,119,191,0.10) 0%, transparent 70%); }

/* All sidebar content sits above blobs */
.sb-z { position: relative; z-index: 1; }

/* Role subtitle */
.sidebar-role {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.55;
}

/* Active nav items */
.sb-item--active-light {
  background: rgba(4, 119, 191, 0.10);
  color: #0477BF;
  font-weight: 500;
  border-left: 3px solid #0477BF;
}

.sb-item--active-dark {
  background: rgba(4, 119, 191, 0.18);
  color: #85B7EB;
  font-weight: 500;
  border-left: 3px solid #0477BF;
}

.sb-item--light { border-left: 3px solid transparent; }
.sb-item--dark  { border-left: 3px solid transparent; }

/* Footer */
.sb-footer-wrapper {
  position: relative;
}

.sb-footer-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  transition: background 0.12s;
}

.sb-footer-trigger--light:hover { background: rgba(16,41,64,0.05); }
.sb-footer-trigger--dark:hover  { background: rgba(255,255,255,0.06); }

.sb-user-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sb-footer-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  padding: 6px 0;
  border-radius: 8px;
  min-width: 160px;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.sb-footer-menu--light {
  background: rgba(255,255,255,0.98);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border: 1px solid rgba(16,41,64,0.08);
}

.sb-footer-menu--dark {
  background: rgba(16,41,64,0.95);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
}

.sb-footer-menu-item {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.sb-footer-menu--light .sb-footer-menu-item         { color: #102940; }
.sb-footer-menu--light .sb-footer-menu-item:hover   { background: rgba(16,41,64,0.06); }
.sb-footer-menu--dark  .sb-footer-menu-item         { color: rgba(255,255,255,0.9); }
.sb-footer-menu--dark  .sb-footer-menu-item:hover   { background: rgba(255,255,255,0.08); }

.sb-avatar {
  background: var(--crm-blue);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.sb-footer-menu-theme {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 10px;
  margin: 4px 0;
  border-top: 1px solid rgba(16,41,64,0.08);
  border-bottom: 1px solid rgba(16,41,64,0.08);
}

.sb-footer-menu--dark .sb-footer-menu-theme {
  border-top-color: rgba(255,255,255,0.08);
  border-bottom-color: rgba(255,255,255,0.08);
}

.sb-theme-label { font-size: 12px; font-weight: 500; min-width: 44px; }
.sb-theme--light .sb-theme-label { color: rgba(16,41,64,0.6); }
.sb-theme--dark .sb-theme-label  { color: rgba(255,255,255,0.6); }

.sb-theme-icon { display: flex; align-items: center; justify-content: center; }
.sb-theme--light .sb-ti-active { color: rgba(16,41,64,0.75); }
.sb-theme--light .sb-ti-muted  { color: rgba(16,41,64,0.32); }
.sb-theme--dark  .sb-ti-active { color: rgba(255,255,255,0.88); }
.sb-theme--dark  .sb-ti-muted  { color: rgba(255,255,255,0.38); }

.sb-toggle-track {
  width: 28px; height: 16px; border-radius: 8px;
  position: relative; cursor: pointer; transition: background 0.2s;
}
.sb-toggle-track.off { background: #D0CEC8; }
.sb-toggle-track.on  { background: #0477BF; }

.sb-toggle-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.sb-toggle-thumb.on { transform: translateX(12px); }
</style>
