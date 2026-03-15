<script setup>
import { computed } from 'vue';
import { useLeadsStore } from '../stores/leads';
import { useDealsStore } from '../stores/deals';
import { useActivitiesStore } from '../stores/activities';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import ReportChart from '../components/dashboard/ReportChart.vue';
import SvgIcon from '../components/common/SvgIcon.vue';
import { formatRwf } from '../utils/currency';

const leadsStore = useLeadsStore();
const dealsStore = useDealsStore();
const actStore   = useActivitiesStore();
const auth       = useAuthStore();
const theme      = useThemeStore();

const userId = computed(() => auth.user?.id);

// ── Stat cards ────────────────────────────────────────────────
const myOpenLeads = computed(() =>
  leadsStore.items.filter((l) => l.assignedTo === userId.value && l.status !== 'won' && l.status !== 'lost').length
);

const myDealsInPipeline = computed(() =>
  dealsStore.items.filter((d) => d.assignedTo === userId.value && d.stage !== 'won' && d.stage !== 'lost').length
);

const myTasksDueThisWeek = computed(() => {
  const today = new Date();
  const week  = new Date(); week.setDate(today.getDate() + 7);
  const todayStr = today.toISOString().split('T')[0];
  const weekStr  = week.toISOString().split('T')[0];
  return actStore.items.filter((a) =>
    a.owner === userId.value && a.status === 'open' && a.dueDate >= todayStr && a.dueDate <= weekStr
  ).length;
});

const myWinRate = computed(() => {
  const myDeals  = dealsStore.items.filter((d) => d.assignedTo === userId.value);
  const closed   = myDeals.filter((d) => d.stage === 'won' || d.stage === 'lost');
  if (!closed.length) return 0;
  const won = closed.filter((d) => d.stage === 'won').length;
  return Math.round((won / closed.length) * 100);
});

// ── Doughnut chart: my lead status breakdown ──────────────────
const leadStatusData = computed(() => {
  const myLeads = leadsStore.items.filter((l) => l.assignedTo === userId.value);
  const statuses = ['new', 'contacted', 'qualified', 'won', 'lost'];
  return {
    labels:   ['New', 'Contacted', 'Qualified', 'Won', 'Lost'],
    datasets: [{
      data:            statuses.map((s) => myLeads.filter((l) => l.status === s).length),
      backgroundColor: ['#0477BF', '#F2A83E', '#13987F', '#3d9a4f', '#9ca3af'],
      borderWidth:     0
    }]
  };
});

const doughnutOptions = { plugins: { legend: { display: true, position: 'right' } }, cutout: '60%' };

// ── Bar chart: activity this month by week ────────────────────
const activityByWeekData = computed(() => {
  const today = new Date();
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const counts = [0, 0, 0, 0];

  const year = today.getFullYear();
  const month = today.getMonth();

  actStore.items
    .filter((a) => a.owner === userId.value && a.status === 'done')
    .forEach((a) => {
      const d = new Date(a.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const week = Math.min(Math.floor((d.getDate() - 1) / 7), 3);
        counts[week]++;
      }
    });

  return {
    labels:   weekLabels,
    datasets: [{
      label:           'Activities done',
      data:            counts,
      backgroundColor: '#0477BF',
      borderRadius:    4,
      borderWidth:     0
    }]
  };
});

// ── Recent deals table ────────────────────────────────────────
const todayStr = new Date().toISOString().split('T')[0];

const myRecentDeals = computed(() =>
  dealsStore.items
    .filter((d) => d.assignedTo === userId.value)
    .sort((a, b) => (a.expectedCloseDate || '').localeCompare(b.expectedCloseDate || ''))
    .slice(0, 8)
    .map((d) => {
      const days = d.expectedCloseDate
        ? Math.ceil((new Date(d.expectedCloseDate) - new Date(todayStr)) / 86400000)
        : null;
      return { ...d, daysUntilClose: days };
    })
);

const stageLabel = {
  qualified:   'Qualified',
  proposal:    'Proposal',
  negotiation: 'Negotiation',
  won:         'Won',
  lost:        'Lost'
};

function fmtValue(v) { return formatRwf(v); }
</script>

<template>
  <section class="page">
    <h2 class="page-title">My Performance</h2>

    <!-- Row 1: Stat cards -->
    <section class="stat-grid">
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="inbox" :size="16" /></div>
        <div class="stat-main">{{ myOpenLeads }}</div>
        <div class="stat-label">My open leads</div>
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="kanban" :size="16" /></div>
        <div class="stat-main">{{ myDealsInPipeline }}</div>
        <div class="stat-label">Deals in pipeline</div>
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="calendar" :size="16" /></div>
        <div class="stat-main">{{ myTasksDueThisWeek }}</div>
        <div class="stat-label">Tasks due this week</div>
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="check-circle" :size="16" /></div>
        <div class="stat-main">{{ myWinRate }}%</div>
        <div class="stat-label">My win rate</div>
      </article>
    </section>

    <!-- Row 2: Charts -->
    <section class="charts-row">
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="chart-card">
        <ReportChart
          type="doughnut"
          :data="leadStatusData"
          :options="doughnutOptions"
          title="My lead status breakdown"
        />
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="chart-card">
        <ReportChart
          type="bar"
          :data="activityByWeekData"
          title="My activity this month"
        />
      </article>
    </section>

    <!-- Row 3: Recent deals -->
    <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="deals-table-card">
      <h3 class="card-title">My recent deals</h3>
      <table class="perf-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Stage</th>
            <th class="num-col">Value</th>
            <th class="num-col">Expected close</th>
            <th class="num-col">Days until close</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in myRecentDeals"
            :key="d.id"
          >
            <td>{{ d.title }}</td>
            <td>
              <span
                class="stage-badge"
                :class="`stage-${d.stage}`"
              >
                {{ stageLabel[d.stage] }}
              </span>
            </td>
            <td class="num-col blue">{{ fmtValue(d.value) }}</td>
            <td class="num-col">{{ d.expectedCloseDate || '—' }}</td>
            <td
              class="num-col"
              :class="d.daysUntilClose !== null && d.daysUntilClose < 7 ? 'red' : ''"
            >
              {{ d.daysUntilClose !== null ? d.daysUntilClose : '—' }}
            </td>
          </tr>
          <tr v-if="myRecentDeals.length === 0">
            <td colspan="5" class="empty-row">No deals assigned yet.</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-title { font-size: 18px; font-weight: 600; margin: 0 0 4px; }

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card { padding: 14px 16px; }
.stat-icon { color: #0477bf; margin-bottom: 6px; }
.stat-main { font-size: 22px; font-weight: 600; }
.stat-label { font-size: 12px; opacity: 0.55; margin-top: 2px; }

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card { padding: 16px; }

.deals-table-card { padding: 16px; overflow: hidden; }

.card-title { font-size: 14px; font-weight: 600; margin: 0 0 12px; }

.perf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.perf-table th {
  font-size: 11.5px;
  font-weight: 600;
  opacity: 0.5;
  text-align: left;
  padding: 4px 8px 8px;
  border-bottom: 1px solid rgba(16,41,64,0.08);
}

:global([data-theme='dark']) .perf-table th {
  border-bottom-color: rgba(255,255,255,0.08);
}

.perf-table td {
  padding: 8px;
  border-bottom: 1px solid rgba(16,41,64,0.04);
}

:global([data-theme='dark']) .perf-table td {
  border-bottom-color: rgba(255,255,255,0.04);
}

.perf-table tr:last-child td { border-bottom: none; }

.num-col { text-align: right; }
.blue { color: #0477bf; font-weight: 600; }
.red  { color: #d93d04; font-weight: 600; }
.empty-row { text-align: center; padding: 24px; opacity: 0.45; }

.stage-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.stage-qualified   { background: #E6F1FB; color: #0C447C; }
.stage-proposal    { background: #FEF3E2; color: #7A4500; }
.stage-negotiation { background: #F0EAF8; color: #4B1D7A; }
.stage-won         { background: #EAF3DE; color: #27500A; }
.stage-lost        { background: #F1EFE8; color: #5F5E5A; }

@media (max-width: 900px) {
  .stat-grid, .charts-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .stat-grid, .charts-row { grid-template-columns: 1fr; }
}
</style>
