<script setup>
import { useThemeStore } from '../../stores/theme';
const theme = useThemeStore();
</script>

<template>
  <footer
    class="app-footer"
    :class="theme.isDark ? 'app-footer--dark' : 'app-footer--light'"
  >
    <span class="footer-left">© 2026 Viz CRM · All rights reserved</span>
    <span class="footer-right">v1.0</span>
  </footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 36px;
  flex-shrink: 0;
  font-size: 11.5px;
  letter-spacing: 0.01em;
  position: relative;
  z-index: 1;
}

.app-footer--light {
  color: rgba(16, 41, 64, 0.35);
  border-top: 1px solid rgba(16, 41, 64, 0.06);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.app-footer--dark {
  color: rgba(255, 255, 255, 0.22);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.12);
}
</style>
