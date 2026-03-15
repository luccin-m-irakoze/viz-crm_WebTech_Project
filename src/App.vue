<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useThemeStore } from './stores/theme';
import { useAccessibilityStore } from './stores/accessibility';
import Navbar from './components/common/Navbar.vue';
import Sidebar from './components/common/Sidebar.vue';
import AppFooter from './components/common/AppFooter.vue';
import ToastContainer from './components/common/ToastContainer.vue';
import ProfileModal from './components/common/ProfileModal.vue';
import LoginView from './views/LoginView.vue';

const route = useRoute();
const theme = useThemeStore();
useAccessibilityStore(); /* init so data-* attrs apply on load */

const topbarSearch       = ref('');
const topbarStatusFilter = ref('');
</script>

<template>
  <ToastContainer />
  <ProfileModal />

  <!-- Skip to main content - visible on keyboard focus for accessibility -->
  <a
    v-if="route.name !== 'login'"
    href="#main-content"
    class="skip-link"
  >
    Skip to main content
  </a>

  <!-- Login uses its own full-screen shell -->
  <LoginView v-if="route.name === 'login'" />

  <!-- Main application shell -->
  <div
    v-else
    :class="theme.isDark ? 'dark-shell' : 'light-shell'"
  >
    <Sidebar />

    <main
      id="main-content"
      tabindex="-1"
      :class="theme.isDark ? 'dark-main' : 'light-main'"
    >
      <Navbar
        :search="topbarSearch"
        :status-filter="topbarStatusFilter"
        @update:search="(v) => (topbarSearch = v)"
        @update:status-filter="(v) => (topbarStatusFilter = v)"
      />
      <section :class="theme.isDark ? 'd-content' : 'l-content'">
        <router-view
          :search="topbarSearch"
          :status-filter="topbarStatusFilter"
        />
      </section>
      <AppFooter />
    </main>
  </div>
</template>
