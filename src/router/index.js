import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const LoginView      = () => import('../views/LoginView.vue');
const DashboardView  = () => import('../views/DashboardView.vue');
const ContactsView   = () => import('../views/ContactsView.vue');
const LeadsView      = () => import('../views/LeadsView.vue');
const UsersView      = () => import('../views/UsersView.vue');
const ActivitiesView = () => import('../views/ActivitiesView.vue');
const DealsView      = () => import('../views/DealsView.vue');
const ReportsView    = () => import('../views/ReportsView.vue');
const PerformanceView = () => import('../views/PerformanceView.vue');
const NotFoundView   = () => import('../views/NotFoundView.vue');

const routes = [
  {
    path:  '/login',
    name:  'login',
    component: LoginView,
    meta:  { public: true }
  },
  {
    path:     '/',
    redirect: '/dashboard'
  },
  {
    path:      '/dashboard',
    name:      'dashboard',
    component: DashboardView,
    meta:      { requiresAuth: true }
  },
  {
    path:      '/contacts',
    name:      'contacts',
    component: ContactsView,
    meta:      { requiresAuth: true }
  },
  {
    path:      '/leads',
    name:      'leads',
    component: LeadsView,
    meta:      { requiresAuth: true }
  },
  {
    path:      '/deals',
    name:      'deals',
    component: DealsView,
    meta:      { requiresAuth: true }
  },
  {
    path:      '/activities',
    name:      'activities',
    component: ActivitiesView,
    meta:      { requiresAuth: true }
  },
  {
    path:      '/users',
    name:      'users',
    component: UsersView,
    meta:      { requiresAuth: true, roles: ['admin'] }
  },
  {
    path:      '/reports',
    name:      'reports',
    component: ReportsView,
    meta:      { requiresAuth: true, requiresAdmin: true }
  },
  {
    path:      '/performance',
    name:      'performance',
    component: PerformanceView,
    meta:      { requiresAuth: true, requiresRole: 'agent' }
  },
  {
    path:      '/:pathMatch(.*)*',
    name:      'not-found',
    component: NotFoundView,
    meta:      { public: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth      = useAuthStore();
  const isPublic  = to.meta.public;

  // Let public routes through; redirect authenticated users away from login
  if (isPublic) {
    if (auth.isAuthenticated && to.name === 'login') return { name: 'dashboard' };
    return true;
  }

  // Auth check
  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Admin-only routes
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' };
  }

  // Agent-only routes
  if (to.meta.requiresRole === 'agent') {
    if (!auth.isAgent) return { name: 'reports' };
  }

  // Role-array guard (legacy)
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const role = auth.user?.role;
    if (!role || !to.meta.roles.includes(role)) return { name: 'dashboard' };
  }

  return true;
});

export default router;
