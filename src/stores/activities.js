import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { mockActivities } from '../utils/mockData';
import { useAuthStore } from './auth';

let nextId = mockActivities.length + 1;

export const useActivitiesStore = defineStore('activities', () => {
  const items = ref([...mockActivities]);

  const today = computed(() => new Date().toISOString().split('T')[0]);

  function myActivities() {
    const auth = useAuthStore();
    if (!auth.user) return [];
    if (auth.isAdmin) return items.value;
    return items.value.filter((a) => a.owner === auth.user.id);
  }

  const overdueActivities = computed(() => {
    const auth = useAuthStore();
    const t = today.value;
    const all = auth.isAdmin ? items.value : items.value.filter((a) => a.owner === auth.user?.id);
    return all.filter((a) => a.status === 'open' && a.dueDate < t);
  });

  const todayActivities = computed(() => {
    const t = today.value;
    return items.value.filter((a) => a.dueDate === t && a.status !== 'done');
  });

  function activitiesForRecord(type, id) {
    return items.value.filter((a) => a.relatedTo.type === type && a.relatedTo.id === id);
  }

  function addActivity(payload) {
    const auth = useAuthStore();
    const activity = {
      id:        nextId++,
      subject:   payload.subject,
      type:      payload.type,
      relatedTo: payload.relatedTo,
      dueDate:   payload.dueDate,
      owner:     payload.owner || auth.user?.id,
      status:    'open',
      notes:     payload.notes || ''
    };
    items.value.push(activity);
    return activity;
  }

  function updateActivity(id, updates) {
    const idx = items.value.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    items.value[idx] = { ...items.value[idx], ...updates };
    return items.value[idx];
  }

  function deleteActivity(id) {
    const idx = items.value.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    items.value.splice(idx, 1);
    return true;
  }

  function toggleDone(id) {
    const activity = items.value.find((a) => a.id === id);
    if (!activity) return null;
    activity.status = activity.status === 'done' ? 'open' : 'done';
    return activity;
  }

  return {
    items,
    today,
    myActivities,
    overdueActivities,
    todayActivities,
    activitiesForRecord,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleDone
  };
});
