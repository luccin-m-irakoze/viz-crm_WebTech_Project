<script setup>
import { useRouter } from 'vue-router';
import { useThemeStore } from '../stores/theme';
import BaseButton from '../components/common/BaseButton.vue';

const router = useRouter();
const theme = useThemeStore();

function goHome() {
  router.push({ name: 'dashboard' });
}
</script>

<template>
  <main :class="theme.isDark ? 'not-found-dark' : 'not-found-light'">
    <section
      aria-labelledby="not-found-title"
      style="min-height: calc(100vh - 4rem); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;"
    >
      <div :class="theme.isDark ? 'not-found-num-dark' : 'not-found-num-light'">
        404
      </div>
      <p>
        The page you’re looking for does not exist.
      </p>
      <BaseButton
        variant="primary"
        @click="goHome"
      >
        Go to dashboard
      </BaseButton>
    </section>
  </main>
</template>


