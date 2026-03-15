// Auth store for Viz CRM: handles mock login, logout, and session persistence.

import { defineStore } from 'pinia';
import { mockUsers, registerMockUser } from '../utils/mockData';

const STORAGE_KEY = 'viz-crm-auth';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.id !== 'number' || !parsed.role) return null;
    const user = mockUsers.find((u) => u.id === parsed.id && u.role === parsed.role);
    if (!user) return null;
    return {
      id:    user.id,
      name:  parsed.name || user.name,
      email: user.email,
      role:  user.role
    };
  } catch {
    return null;
  }
}

function saveSession(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id, role: user.role, name: user.name }));
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadSession(),
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated(state) {
      return !!state.user;
    },
    isAdmin(state) {
      return state.user?.role === 'admin';
    },
    isAgent(state) {
      return state.user?.role === 'agent';
    }
  },
  actions: {
    async login(email, password) {
      this.error = null;
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const user = mockUsers.find((u) => u.email === email && u.password === password);
        if (!user) {
          this.error = 'Invalid credentials.';
          return false;
        }

        this.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
        saveSession(this.user);
        return true;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      this.error = null;
      saveSession(null);
    },
    register({ name, email, password }) {
      this.error = null;
      const newUser = registerMockUser({ name, email, password });
      if (!newUser) {
        this.error = 'An account with this email already exists.';
        return false;
      }
      this.user = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
      saveSession(this.user);
      return true;
    },
    updateProfile(payload) {
      if (!this.user) return;
      if (payload.name?.trim()) this.user.name = payload.name.trim();
      saveSession(this.user);
    }
  }
});

