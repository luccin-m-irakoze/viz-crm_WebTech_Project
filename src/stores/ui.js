import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const pendingCreate   = ref(null); // 'contact' | 'lead' | 'user' | null
  const profileOpen     = ref(false);
  const profileSection  = ref(null); // null | 'accessibility'

  function triggerCreate(type) { pendingCreate.value = type; }
  function clearCreate()       { pendingCreate.value = null; }
  function openProfile(section = null) {
    profileSection.value = section;
    profileOpen.value = true;
  }
  function closeProfile() {
    profileOpen.value = false;
    profileSection.value = null;
  }

  return { pendingCreate, triggerCreate, clearCreate, profileOpen, profileSection, openProfile, closeProfile };
});
