// Leads store for Viz CRM: manages sales leads with statuses and per-user access.

import { defineStore } from 'pinia';
import { mockLeads } from '../utils/mockData';
import { useAuthStore } from './auth';

let nextId = mockLeads.length + 1;

export const useLeadsStore = defineStore('leads', {
  state: () => ({
    items:   [...mockLeads],
    loading: false
  }),
  getters: {
    leadsForCurrentUser(state) {
      const auth = useAuthStore();
      if (!auth.user) return [];
      if (auth.isAdmin) return state.items;
      return state.items.filter((l) => l.assignedTo === auth.user.id);
    },
    newLeadsThisWeek() {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      return this.leadsForCurrentUser.filter((l) => new Date(l.createdAt) >= cutoff).length;
    },
    winRate() {
      const leads = this.leadsForCurrentUser;
      if (!leads.length) return 0;
      const won = leads.filter((l) => l.status === 'won').length;
      return Math.round((won / leads.length) * 100);
    },
    totalPipelineValue() {
      return this.leadsForCurrentUser.reduce((sum, l) => sum + (Number.isFinite(l.value) ? l.value : 0), 0);
    }
  },
  actions: {
    async createLead(payload) {
      this.loading = true;
      try {
        await new Promise((r) => setTimeout(r, 400));
        const auth = useAuthStore();
        const lead = {
          id:         nextId++,
          title:      payload.title,
          value:      Number(payload.value) || 0,
          status:     payload.status,
          contactId:  payload.contactId,
          assignedTo: payload.assignedTo || auth.user?.id || null,
          createdAt:  new Date().toISOString()
        };
        this.items.push(lead);
        return lead;
      } finally {
        this.loading = false;
      }
    },
    async updateLead(id, updates) {
      this.loading = true;
      try {
        await new Promise((r) => setTimeout(r, 300));
        const idx = this.items.findIndex((l) => l.id === id);
        if (idx === -1) return null;
        this.items[idx] = { ...this.items[idx], ...updates };
        return this.items[idx];
      } finally {
        this.loading = false;
      }
    },
    async deleteLead(id) {
      this.loading = true;
      try {
        await new Promise((r) => setTimeout(r, 300));
        const idx = this.items.findIndex((l) => l.id === id);
        if (idx === -1) return false;
        this.items.splice(idx, 1);
        return true;
      } finally {
        this.loading = false;
      }
    }
  }
});
