import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { mockDeals } from '../utils/mockData';
import { useAuthStore } from './auth';

let nextId = mockDeals.length + 1;

const stageProbabilities = {
  qualified:   25,
  proposal:    50,
  negotiation: 75,
  won:         100,
  lost:        0
};

export const useDealsStore = defineStore('deals', () => {
  const items = ref([...mockDeals]);

  const dealsForCurrentUser = computed(() => {
    const auth = useAuthStore();
    if (!auth.user) return [];
    if (auth.isAdmin) return items.value;
    return items.value.filter((d) => d.assignedTo === auth.user.id);
  });

  const weightedPipelineValue = computed(() => {
    return dealsForCurrentUser.value
      .filter((d) => d.stage !== 'won' && d.stage !== 'lost')
      .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
  });

  const totalPipelineValue = computed(() => {
    return dealsForCurrentUser.value
      .filter((d) => d.stage !== 'lost')
      .reduce((sum, d) => sum + d.value, 0);
  });

  const winRate = computed(() => {
    const closed = dealsForCurrentUser.value.filter((d) => d.stage === 'won' || d.stage === 'lost');
    if (!closed.length) return 0;
    const won = closed.filter((d) => d.stage === 'won').length;
    return Math.round((won / closed.length) * 100);
  });

  function dealsByStage(stage) {
    return dealsForCurrentUser.value.filter((d) => d.stage === stage);
  }

  function addDeal(payload) {
    const auth = useAuthStore();
    const stage = payload.stage || 'qualified';
    const deal = {
      id:                nextId++,
      title:             payload.title,
      contactId:         payload.contactId,
      value:             Number(payload.value) || 0,
      stage,
      probability:       stageProbabilities[stage] ?? 25,
      assignedTo:        payload.assignedTo || auth.user?.id,
      expectedCloseDate: payload.expectedCloseDate || '',
      notes:             payload.notes || ''
    };
    items.value.push(deal);
    return deal;
  }

  function updateDeal(id, updates) {
    const idx = items.value.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    items.value[idx] = { ...items.value[idx], ...updates };
    return items.value[idx];
  }

  function moveDeal(id, newStage) {
    const idx = items.value.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    items.value[idx] = {
      ...items.value[idx],
      stage:       newStage,
      probability: stageProbabilities[newStage] ?? 0
    };
    return items.value[idx];
  }

  function deleteDeal(id) {
    const idx = items.value.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    items.value.splice(idx, 1);
    return true;
  }

  return {
    items,
    dealsForCurrentUser,
    weightedPipelineValue,
    totalPipelineValue,
    winRate,
    dealsByStage,
    stageProbabilities,
    addDeal,
    updateDeal,
    moveDeal,
    deleteDeal
  };
});
