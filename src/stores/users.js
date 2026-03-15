// Users store for Viz CRM: manages admin-visible list of CRM users.

import { defineStore } from 'pinia';
import { mockUsersAdminView } from '../utils/mockData';

let nextId = mockUsersAdminView.length + 1;

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [...mockUsersAdminView],
    loading: false
  }),
  getters: {
    activeUsers(state) {
      return state.items.filter((u) => u.status === 'active');
    }
  },
  actions: {
    async createUser(payload) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const now = new Date().toISOString();
        const user = {
          id: nextId++,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          status: payload.status || 'active',
          createdAt: now
        };
        this.items.push(user);
        return user;
      } finally {
        this.loading = false;
      }
    },
    async updateUser(id, payload) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const index = this.items.findIndex((u) => u.id === id);
        if (index === -1) return null;
        this.items[index] = {
          ...this.items[index],
          name: payload.name,
          email: payload.email,
          role: payload.role,
          status: payload.status
        };
        return this.items[index];
      } finally {
        this.loading = false;
      }
    },
    async updateUserStatus(id, status) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.items.findIndex((u) => u.id === id);
        if (index === -1) return null;
        this.items[index] = { ...this.items[index], status };
        return this.items[index];
      } finally {
        this.loading = false;
      }
    }
  }
});

