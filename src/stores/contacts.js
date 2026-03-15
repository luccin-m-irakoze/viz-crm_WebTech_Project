// Contacts store for Viz CRM: manages mock contacts with CRUD and per-user filtering.

import { defineStore } from 'pinia';
import { mockContacts } from '../utils/mockData';
import { useAuthStore } from './auth';

let nextId = mockContacts.length + 1;

export const useContactsStore = defineStore('contacts', {
  state: () => ({
    items: [...mockContacts],
    loading: false
  }),
  getters: {
    contactsForCurrentUser(state) {
      const auth = useAuthStore();
      if (!auth.user) return [];
      if (auth.isAdmin) {
        return state.items;
      }
      return state.items.filter((c) => c.assignedTo === auth.user.id);
    }
  },
  actions: {
    async createContact(payload) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const auth = useAuthStore();
        const now = new Date().toISOString();
        const contact = {
          id:         nextId++,
          name:       payload.name,
          email:      payload.email,
          phone:      payload.phone,
          company:    payload.company,
          status:     payload.status || 'active',
          assignedTo: payload.assignedTo || auth.user?.id || null,
          createdAt:  now
        };
        this.items.push(contact);
        return contact;
      } finally {
        this.loading = false;
      }
    },
    async updateContact(id, updates) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.items.findIndex((c) => c.id === id);
        if (index === -1) return null;
        this.items[index] = { ...this.items[index], ...updates };
        return this.items[index];
      } finally {
        this.loading = false;
      }
    },
    async deleteContact(id) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.items.findIndex((c) => c.id === id);
        if (index === -1) return false;
        this.items.splice(index, 1);
        return true;
      } finally {
        this.loading = false;
      }
    }
  }
});

