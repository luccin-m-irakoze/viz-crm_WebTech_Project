<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useContactsStore } from '../stores/contacts';
import { useLeadsStore } from '../stores/leads';
import { useActivitiesStore } from '../stores/activities';
import { useThemeStore } from '../stores/theme';
import ChartWidget from '../components/dashboard/ChartWidget.vue';
import SvgIcon from '../components/common/SvgIcon.vue';
import { formatRwf } from '../utils/currency';

const auth       = useAuthStore();
const contacts   = useContactsStore();
const leads      = useLeadsStore();
const activities = useActivitiesStore();
const theme      = useThemeStore();
const router     = useRouter();

// ─── Stat cards ───────────────────────────────────────────────
const totalContacts    = computed(() => contacts.contactsForCurrentUser.length);
const totalLeads       = computed(() => leads.leadsForCurrentUser.length);
const pipelineValue    = computed(() => leads.totalPipelineValue);
const newLeadsThisWeek = computed(() => leads.newLeadsThisWeek);
const winRate          = computed(() => leads.winRate);

// ─── Chart data ───────────────────────────────────────────────
const statusCounts = computed(() => {
  const base  = { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0 };
  leads.leadsForCurrentUser.forEach((l) => {
    if (l.status in base) base[l.status]++;
  });
  return base;
});

// ─── Recent leads (5 most recent) ────────────────────────────
const recentLeads = computed(() =>
  [...leads.leadsForCurrentUser]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((l) => ({
      ...l,
      contactName: contacts.items.find((c) => c.id === l.contactId)?.name ?? '—'
    }))
);

// ─── Open tasks today ─────────────────────────────────────────
const tasksToday = computed(() =>
  activities.todayActivities.map((a) => {
    let relName = '—';
    if (a.relatedTo.type === 'contact') {
      relName = contacts.items.find((c) => c.id === a.relatedTo.id)?.name ?? '—';
    } else {
      const lead = leads.items.find((l) => l.id === a.relatedTo.id);
      relName = lead
        ? contacts.items.find((c) => c.id === lead.contactId)?.name ?? lead.title
        : '—';
    }
    return { ...a, relatedName: relName };
  })
);

// ─── Top contacts by total lead value ────────────────────────
const topContacts = computed(() => {
  const map = {};
  leads.leadsForCurrentUser.forEach((l) => {
    if (!map[l.contactId]) {
      const contact = contacts.items.find((c) => c.id === l.contactId);
      map[l.contactId] = { id: l.contactId, name: contact?.name ?? '—', company: contact?.company ?? '—', total: 0 };
    }
    map[l.contactId].total += l.value;
  });
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
});

// ─── Helpers ──────────────────────────────────────────────────
const statusBadgeClass = {
  new:       'badge-new',
  contacted: 'badge-contacted',
  qualified: 'badge-qualified',
  won:       'badge-won',
  lost:      'badge-lost'
};

const typeLabel = { call: 'Call', email: 'Email', visit: 'Visit' };
const typeBadgeClass = { call: 'badge-type-call', email: 'badge-type-email', visit: 'badge-type-visit' };

function fmtValue(v) { return formatRwf(v); }
</script>

<template>
  <section class="page">
    <!-- Row 1 — Stat cards -->
    <section class="stat-grid">
      <!-- Contacts -->
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon-wrap">
          <SvgIcon name="users" :size="16" />
        </div>
        <div class="stat-main">{{ totalContacts }}</div>
        <div class="stat-label">Contacts</div>
        <div class="stat-trend muted">{{ auth.isAdmin ? 'All contacts' : 'Assigned to you' }}</div>
      </article>

      <!-- Leads -->
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon-wrap">
          <SvgIcon name="inbox" :size="16" />
        </div>
        <div class="stat-main">{{ totalLeads }}</div>
        <div class="stat-label">Leads</div>
        <div class="stat-trend muted">All statuses</div>
      </article>

      <!-- Pipeline Value -->
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon-wrap">
          <SvgIcon name="dollar" :size="16" />
        </div>
        <div class="stat-main">{{ formatRwf(pipelineValue, { compact: true }) }}</div>
        <div class="stat-label">Pipeline Value</div>
        <div class="stat-trend muted">Total lead value</div>
      </article>

      <!-- New This Week -->
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon-wrap">
          <SvgIcon name="trending-up" :size="16" />
        </div>
        <div class="stat-main">{{ newLeadsThisWeek }}</div>
        <div class="stat-label">New This Week</div>
        <div class="stat-trend positive">+{{ newLeadsThisWeek }} this week</div>
      </article>

      <!-- Win Rate -->
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon-wrap">
          <SvgIcon name="check-circle" :size="16" />
        </div>
        <div class="stat-main">{{ winRate }}%</div>
        <div class="stat-label">Win Rate</div>
        <div
          class="stat-trend"
          :class="winRate > 0 ? 'positive' : 'muted'"
        >
          {{ leads.leadsForCurrentUser.filter(l => l.status === 'won').length }} won
        </div>
      </article>
    </section>

    <!-- Row 2 — Chart + Open tasks -->
    <section class="row-two">
      <div class="chart-col">
        <ChartWidget :status-counts="statusCounts" />
      </div>
      <article
        :class="theme.isDark ? 'd-stat' : 'l-stat'"
        class="widget-card tasks-col"
      >
        <header class="widget-header">
          <h3 class="widget-title">Open tasks today</h3>
          <button
            class="widget-link"
            :class="theme.isDark ? 'widget-link--dark' : 'widget-link--light'"
            @click="router.push({ name: 'activities' })"
          >
            + Add task
          </button>
        </header>

        <div
          v-if="tasksToday.length === 0"
          class="empty-tasks"
        >
          <SvgIcon name="check-circle" :size="28" />
          <p>No tasks due today</p>
        </div>

        <ul
          v-else
          class="task-list"
        >
          <li
            v-for="task in tasksToday"
            :key="task.id"
            class="task-item"
          >
            <div class="task-info">
              <span class="task-subject">{{ task.subject }}</span>
              <span class="task-contact">{{ task.relatedName }}</span>
            </div>
            <span
              class="type-badge"
              :class="typeBadgeClass[task.type]"
            >
              {{ typeLabel[task.type] }}
            </span>
          </li>
        </ul>
      </article>
    </section>

    <!-- Row 3 — Recent leads + Top contacts -->
    <section class="row-three">
      <!-- Recent Leads -->
      <article
        :class="theme.isDark ? 'd-stat' : 'l-stat'"
        class="widget-card"
      >
        <header class="widget-header">
          <h3 class="widget-title">Recent leads</h3>
          <button
            class="widget-link"
            :class="theme.isDark ? 'widget-link--dark' : 'widget-link--light'"
            @click="router.push({ name: 'leads' })"
          >
            View all →
          </button>
        </header>

        <ul class="lead-list">
          <li
            v-for="lead in recentLeads"
            :key="lead.id"
            class="lead-item"
          >
            <div class="lead-info">
              <span class="lead-title">{{ lead.title }}</span>
              <span class="lead-contact">{{ lead.contactName }}</span>
            </div>
            <div class="lead-meta">
              <span class="lead-value">{{ fmtValue(lead.value) }}</span>
              <span
                class="status-badge"
                :class="statusBadgeClass[lead.status]"
              >
                {{ lead.status }}
              </span>
            </div>
          </li>
        </ul>
      </article>

      <!-- Top contacts -->
      <article
        :class="theme.isDark ? 'd-stat' : 'l-stat'"
        class="widget-card"
      >
        <header class="widget-header">
          <h3 class="widget-title">Top contacts by value</h3>
        </header>

        <ul class="contact-value-list">
          <li
            v-for="(c, i) in topContacts"
            :key="c.id"
            class="cv-item"
          >
            <span class="cv-rank">{{ i + 1 }}</span>
            <div class="cv-info">
              <span class="cv-name">{{ c.name }}</span>
              <span class="cv-company">{{ c.company }}</span>
            </div>
            <span class="cv-value">{{ fmtValue(c.total) }}</span>
          </li>
          <li
            v-if="topContacts.length === 0"
            class="cv-empty"
          >
            No data yet
          </li>
        </ul>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Stat grid (5 columns) ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
}

.stat-icon-wrap {
  color: #0477bf;
  margin-bottom: 4px;
}

.stat-main {
  font-size: 26px;
  font-weight: 500;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  opacity: 0.6;
}

.stat-trend {
  font-size: 12px;
  margin-top: 2px;
}

.stat-trend.positive { color: #3a8f2f; }
.stat-trend.muted    { opacity: 0.45; }

:global([data-theme='dark']) .stat-trend.positive { color: #6dbf5e; }

/* ── Row 2: chart + tasks ── */
.row-two {
  display: grid;
  grid-template-columns: 60fr 40fr;
  gap: 16px;
  align-items: start;
}

.chart-col { min-width: 0; }

.tasks-col { min-width: 0; }

/* ── Row 3: recent leads + top contacts ── */
.row-three {
  display: grid;
  grid-template-columns: 60fr 40fr;
  gap: 16px;
  align-items: start;
}

/* ── Widget card shared ── */
.widget-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(16, 41, 64, 0.06);
}

:global([data-theme='dark']) .widget-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.widget-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.widget-link {
  font-size: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.12s;
}

.widget-link:hover { opacity: 0.7; }
.widget-link--light { color: #0477bf; }
.widget-link--dark  { color: #85b7eb; }

/* ── Tasks ── */
.empty-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 16px;
  opacity: 0.4;
  font-size: 13px;
}

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(16, 41, 64, 0.04);
  font-size: 13px;
}

:global([data-theme='dark']) .task-item {
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.task-item:last-child { border-bottom: none; }

.task-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.task-subject { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.task-contact { font-size: 12px; opacity: 0.5; }

.type-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
}

.badge-type-call  { background: #E6F1FB; color: #0C447C; }
.badge-type-email { background: #FEF3E2; color: #7A4500; }
.badge-type-visit { background: #EAF3DE; color: #27500A; }

/* ── Recent leads ── */
.lead-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lead-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(16, 41, 64, 0.04);
  font-size: 13px;
}

:global([data-theme='dark']) .lead-item {
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.lead-item:last-child { border-bottom: none; }

.lead-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.lead-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lead-contact { font-size: 12px; opacity: 0.5; }

.lead-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.lead-value { color: #0477bf; font-weight: 500; font-size: 13px; }

/* ── Status badges ── */
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-new       { background: #E6F1FB; color: #0C447C; }
.badge-contacted { background: #FEF3E2; color: #7A4500; }
.badge-qualified { background: #E8F4F0; color: #0A4D3A; }
.badge-won       { background: #EAF3DE; color: #27500A; }
.badge-lost      { background: #F1EFE8; color: #5F5E5A; }

/* ── Top contacts ── */
.contact-value-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cv-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(16, 41, 64, 0.04);
  font-size: 13px;
}

:global([data-theme='dark']) .cv-item {
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.cv-item:last-child { border-bottom: none; }

.cv-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(4, 119, 191, 0.1);
  color: #0477bf;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cv-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.cv-name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cv-company { font-size: 12px; opacity: 0.5; }
.cv-value { color: #0477bf; font-weight: 600; flex-shrink: 0; }
.cv-empty { padding: 24px 16px; opacity: 0.45; font-size: 13px; text-align: center; }

@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(3, 1fr); }
  .row-two, .row-three { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
