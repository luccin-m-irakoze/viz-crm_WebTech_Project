<script setup>
import { computed } from 'vue';
import { useLeadsStore } from '../stores/leads';
import { useDealsStore } from '../stores/deals';
import { useContactsStore } from '../stores/contacts';
import { useThemeStore } from '../stores/theme';
import { mockUsers } from '../utils/mockData';
import ReportChart from '../components/dashboard/ReportChart.vue';
import SvgIcon from '../components/common/SvgIcon.vue';
import { formatRwf } from '../utils/currency';

const leads    = useLeadsStore();
const deals    = useDealsStore();
const contacts = useContactsStore();
const theme    = useThemeStore();

// ── Pipeline stats ────────────────────────────────────────────
const allDeals = computed(() => deals.items);

const totalPipelineValue = computed(() =>
  allDeals.value.filter((d) => d.stage !== 'lost').reduce((s, d) => s + d.value, 0)
);

const weightedPipeline = computed(() =>
  allDeals.value
    .filter((d) => d.stage !== 'won' && d.stage !== 'lost')
    .reduce((s, d) => s + d.value * (d.probability / 100), 0)
);

const winRatePct = computed(() => {
  const closed = allDeals.value.filter((d) => d.stage === 'won' || d.stage === 'lost');
  if (!closed.length) return 0;
  return Math.round((allDeals.value.filter((d) => d.stage === 'won').length / closed.length) * 100);
});

const avgDealSize = computed(() => {
  const n = allDeals.value.length;
  if (!n) return 0;
  return Math.round(allDeals.value.reduce((s, d) => s + d.value, 0) / n);
});

// ── Lead funnel chart ─────────────────────────────────────────
const leadFunnelData = computed(() => {
  const statuses  = ['new', 'contacted', 'qualified', 'won', 'lost'];
  const counts    = statuses.map((s) => leads.items.filter((l) => l.status === s).length);
  const colors    = ['#0477BF', '#F2A83E', '#13987F', '#3d9a4f', '#9ca3af'];
  return {
    labels:   ['New', 'Contacted', 'Qualified', 'Won', 'Lost'],
    datasets: [{
      data:            counts,
      backgroundColor: colors,
      borderRadius:    4,
      borderWidth:     0
    }]
  };
});

const funnelOptions = {
  indexAxis: 'y',
  plugins: { legend: { display: false } }
};

// ── Monthly pipeline trend ─────────────────────────────────────
const monthlyTrendData = computed(() => {
  const now    = new Date();
  const labels = [];
  const values = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    const total = allDeals.value
      .filter((deal) => {
        const cd = new Date(deal.expectedCloseDate);
        return cd.getFullYear() === yr && cd.getMonth() === mo;
      })
      .reduce((s, deal) => s + deal.value, 0);
    values.push(total);
  }

  return {
    labels,
    datasets: [{
      data:            values,
      borderColor:     '#0477BF',
      backgroundColor: 'rgba(4,119,191,0.08)',
      fill:            true,
      tension:         0.4,
      pointRadius:     4,
      pointBackgroundColor: '#0477BF'
    }]
  };
});

// ── Top contacts by lead value ────────────────────────────────
const topContactsByValue = computed(() => {
  const map = {};
  leads.items.forEach((l) => {
    if (!map[l.contactId]) {
      const c = contacts.items.find((x) => x.id === l.contactId);
      map[l.contactId] = { name: c?.name ?? '—', company: c?.company ?? '—', total: 0, openLeads: 0 };
    }
    map[l.contactId].total += l.value;
    if (l.status !== 'won' && l.status !== 'lost') map[l.contactId].openLeads++;
  });
  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});

// ── Agent performance ─────────────────────────────────────────
const agentPerformance = computed(() =>
  mockUsers.map((u) => {
    const myLeads = leads.items.filter((l) => l.assignedTo === u.id);
    const myDeals = deals.items.filter((d) => d.assignedTo === u.id);
    const wonDeals = myDeals.filter((d) => d.stage === 'won');
    const closedDeals = myDeals.filter((d) => d.stage === 'won' || d.stage === 'lost');
    const wr = closedDeals.length ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
    return {
      name:          u.name,
      leadsAssigned: myLeads.length,
      dealsWon:      wonDeals.length,
      winRate:       wr,
      totalValue:    wonDeals.reduce((s, d) => s + d.value, 0)
    };
  })
);

function fmtValue(v) { return formatRwf(Math.round(v)); }
</script>

<template>
  <section class="page">
    <h2 class="page-title">Reports &amp; Insights</h2>

    <!-- Section 1: Pipeline summary cards -->
    <section class="stat-grid">
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="dollar" :size="16" /></div>
        <div class="stat-main">{{ fmtValue(totalPipelineValue) }}</div>
        <div class="stat-label">Total pipeline value</div>
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="trending-up" :size="16" /></div>
        <div class="stat-main">{{ fmtValue(Math.round(weightedPipeline)) }}</div>
        <div class="stat-label">Weighted pipeline</div>
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="check-circle" :size="16" /></div>
        <div class="stat-main">{{ winRatePct }}%</div>
        <div class="stat-label">Win rate</div>
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="stat-card">
        <div class="stat-icon"><SvgIcon name="bar-chart" :size="16" /></div>
        <div class="stat-main">{{ fmtValue(avgDealSize) }}</div>
        <div class="stat-label">Avg deal size</div>
      </article>
    </section>

    <!-- Section 2: Charts -->
    <section class="charts-row">
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="chart-card">
        <ReportChart
          type="bar"
          :data="leadFunnelData"
          :options="funnelOptions"
          title="Lead pipeline funnel"
        />
      </article>
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="chart-card">
        <ReportChart
          type="line"
          :data="monthlyTrendData"
          title="Pipeline value by month"
        />
      </article>
    </section>

    <!-- Section 3: Tables -->
    <section class="tables-row">
      <!-- Top contacts -->
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="table-card">
        <h3 class="card-title">Top contacts by value</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Company</th>
              <th class="num-col">Total value</th>
              <th class="num-col">Open leads</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, i) in topContactsByValue" :key="i">
              <td class="rank-col">{{ i + 1 }}</td>
              <td>{{ c.name }}</td>
              <td class="muted">{{ c.company }}</td>
              <td class="num-col blue">{{ fmtValue(c.total) }}</td>
              <td class="num-col">{{ c.openLeads }}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <!-- Agent performance -->
      <article :class="theme.isDark ? 'd-stat' : 'l-stat'" class="table-card">
        <h3 class="card-title">Agent performance</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th class="num-col">Leads</th>
              <th class="num-col">Won</th>
              <th class="num-col">Win %</th>
              <th class="num-col">Value closed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in agentPerformance" :key="a.name">
              <td>{{ a.name }}</td>
              <td class="num-col">{{ a.leadsAssigned }}</td>
              <td class="num-col">{{ a.dealsWon }}</td>
              <td class="num-col">{{ a.winRate }}%</td>
              <td class="num-col blue">{{ fmtValue(a.totalValue) }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
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

.tables-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.table-card { padding: 16px; overflow: hidden; }

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th {
  font-size: 11.5px;
  font-weight: 600;
  opacity: 0.5;
  text-align: left;
  padding: 4px 8px 8px;
  border-bottom: 1px solid rgba(16,41,64,0.08);
}

:global([data-theme='dark']) .report-table th {
  border-bottom-color: rgba(255,255,255,0.08);
}

.report-table td {
  padding: 8px;
  border-bottom: 1px solid rgba(16,41,64,0.04);
}

:global([data-theme='dark']) .report-table td {
  border-bottom-color: rgba(255,255,255,0.04);
}

.report-table tr:last-child td { border-bottom: none; }

.num-col { text-align: right; }
.rank-col { text-align: center; width: 30px; opacity: 0.5; font-weight: 700; }
.blue { color: #0477bf; font-weight: 600; }
.muted { opacity: 0.55; font-size: 12px; }

@media (max-width: 900px) {
  .stat-grid, .charts-row, .tables-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .stat-grid, .charts-row, .tables-row { grid-template-columns: 1fr; }
}
</style>
