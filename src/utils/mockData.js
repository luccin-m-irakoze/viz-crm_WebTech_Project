// Mock data for Viz CRM: users, contacts, leads, deals, activities

export const mockUsers = [
  { id: 1, name: 'Alice Admin', email: 'admin@vizcrm.com', password: 'Admin@123', role: 'admin' },
  { id: 2, name: 'Bob Agent',   email: 'agent@vizcrm.com', password: 'Agent@123', role: 'agent' }
];

let _nextUserId = 3;

export function registerMockUser({ name, email, password }) {
  const existing = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return null; // email already taken
  const newUser = { id: _nextUserId++, name, email, password, role: 'agent' };
  mockUsers.push(newUser);
  return newUser;
}

export const mockContacts = [
  { id: 1,  name: 'Jean Paul Nkurunziza',     email: 'jp.nkurunziza@bankofkigali.com',    phone: '+250 788 123 456', company: 'Bank of Kigali',        status: 'active',   assignedTo: 1, createdAt: '2026-02-15T10:00:00Z' },
  { id: 2,  name: 'Marie Claire Uwera',       email: 'm.uwera@mtn.co.rw',                 phone: '+250 788 234 567', company: 'MTN Rwanda',             status: 'active',   assignedTo: 2, createdAt: '2026-02-18T14:30:00Z' },
  { id: 3,  name: 'Emmanuel Habimana',        email: 'e.habimana@bralirwa.com',           phone: '+250 788 345 678', company: 'Bralirwa',               status: 'inactive', assignedTo: 2, createdAt: '2026-02-20T09:15:00Z' },
  { id: 4,  name: 'Uwase Murekatete',         email: 'u.murekatete@kigaliheights.rw',     phone: '+250 788 456 789', company: 'Kigali Heights Mall',   status: 'lead',     assignedTo: 1, createdAt: '2026-02-22T11:00:00Z' },
  { id: 5,  name: 'Eric Ndahiro',             email: 'e.ndahiro@bourboncoffee.rw',        phone: '+250 788 567 890', company: 'Bourbon Coffee',         status: 'active',   assignedTo: 1, createdAt: '2026-02-25T13:00:00Z' },
  { id: 6,  name: 'Claudine Iradukunda',      email: 'c.iradukunda@bourboncoffee.rw',     phone: '+250 788 678 901', company: 'Bourbon Coffee',         status: 'active',   assignedTo: 2, createdAt: '2026-02-26T10:30:00Z' },
  { id: 7,  name: 'Patrick Kayiranga',        email: 'p.kayiranga@nyungwetea.rw',        phone: '+250 788 789 012', company: 'Nyungwe Tea Co.',       status: 'inactive', assignedTo: 1, createdAt: '2026-03-01T08:00:00Z' },
  { id: 8,  name: 'Grace Uwambaye',           email: 'g.uwambaye@yobrand.rw',             phone: '+250 788 890 123', company: 'Yobrand Group',          status: 'lead',     assignedTo: 2, createdAt: '2026-03-03T09:00:00Z' },
  { id: 9,  name: 'David Rutagengwa',         email: 'd.rutagengwa@dreamafrica.rw',       phone: '+250 788 901 234', company: 'Dream Africa Holdings', status: 'active',   assignedTo: 1, createdAt: '2026-03-05T11:00:00Z' },
  { id: 10, name: 'Josiane Umutesi',          email: 'j.umutesi@bazasoft.rw',             phone: '+250 788 012 345', company: 'Bazasoft Rwanda',        status: 'active',   assignedTo: 2, createdAt: '2026-03-06T14:00:00Z' },
  { id: 11, name: 'Fidele Nsengimana',        email: 'f.nsengimana@neza-safaris.rw',      phone: '+250 789 123 456', company: 'Neza Safaris',           status: 'lead',     assignedTo: 1, createdAt: '2026-03-08T10:00:00Z' },
  { id: 12, name: 'Alphonsine Mutoni',        email: 'a.mutoni@accessbank.co.rw',         phone: '+250 789 234 567', company: 'Access Bank Rwanda',    status: 'inactive', assignedTo: 2, createdAt: '2026-03-10T09:00:00Z' }
];

export const mockLeads = [
  { id: 1,  title: 'Bank of Kigali Digital Banking Demo',  value: 5000,  status: 'new',       contactId: 1,  assignedTo: 1, createdAt: '2026-03-06T11:00:00Z' },
  { id: 2,  title: 'MTN Rwanda Network Upgrade',           value: 12000, status: 'qualified', contactId: 2,  assignedTo: 2, createdAt: '2026-03-07T16:45:00Z' },
  { id: 3,  title: 'Bralirwa Distribution Follow-up',      value: 8000,  status: 'contacted', contactId: 3,  assignedTo: 2, createdAt: '2026-03-08T13:20:00Z' },
  { id: 4,  title: 'Kigali Heights Mall Security Upgrade', value: 25000, status: 'won',       contactId: 4,  assignedTo: 1, createdAt: '2026-02-20T09:00:00Z' },
  { id: 5,  title: 'Bourbon Coffee Supply Deal',           value: 7500,  status: 'lost',      contactId: 5,  assignedTo: 1, createdAt: '2026-02-15T10:30:00Z' },
  { id: 6,  title: 'Dream Africa Solar Install',           value: 18000, status: 'qualified', contactId: 9,  assignedTo: 1, createdAt: '2026-03-01T08:00:00Z' },
  { id: 7,  title: 'Bazasoft Hosting Maintenance',         value: 4500,  status: 'contacted', contactId: 10, assignedTo: 2, createdAt: '2026-03-04T10:00:00Z' },
  { id: 8,  title: 'Yobrand Digital Marketing Campaign',   value: 15000, status: 'new',       contactId: 8,  assignedTo: 2, createdAt: '2026-03-09T14:00:00Z' },
  { id: 9,  title: 'Nyungwe Tea Partnership',              value: 9000,  status: 'contacted', contactId: 7,  assignedTo: 1, createdAt: '2026-03-10T09:30:00Z' },
  { id: 10, title: 'Neza Safaris Tourism Contract',        value: 22000, status: 'won',       contactId: 11, assignedTo: 2, createdAt: '2026-02-28T11:00:00Z' },
  { id: 11, title: 'Access Bank Rwanda Tech Integration',  value: 35000, status: 'qualified', contactId: 12, assignedTo: 1, createdAt: '2026-03-11T10:00:00Z' },
  { id: 12, title: 'MTN Rwanda Phase 2 Expansion',         value: 45000, status: 'new',       contactId: 2,  assignedTo: 2, createdAt: '2026-03-12T15:00:00Z' }
];

// Deals / Opportunities for Kanban board
export const mockDeals = [
  { id: 1,  title: 'Bank of Kigali Enterprise License',   contactId: 1,  value: 28000, stage: 'proposal',    probability: 50,  assignedTo: 1, expectedCloseDate: '2026-04-15', notes: 'Second meeting scheduled' },
  { id: 2,  title: 'MTN Rwanda System Integration',       contactId: 2,  value: 42000, stage: 'negotiation',  probability: 75,  assignedTo: 2, expectedCloseDate: '2026-03-28', notes: 'Price negotiation ongoing' },
  { id: 3,  title: 'Kigali Heights Network Setup',        contactId: 4,  value: 15000, stage: 'qualified',    probability: 25,  assignedTo: 1, expectedCloseDate: '2026-05-01', notes: 'Initial qualification done' },
  { id: 4,  title: 'Bourbon Coffee Cloud Subscription',   contactId: 5,  value: 7200,  stage: 'won',          probability: 100, assignedTo: 1, expectedCloseDate: '2026-03-10', notes: 'Contract signed' },
  { id: 5,  title: 'Bralirwa Legacy Migration',           contactId: 3,  value: 33000, stage: 'lost',         probability: 0,   assignedTo: 2, expectedCloseDate: '2026-03-05', notes: 'Lost to competitor' },
  { id: 6,  title: 'Dream Africa Analytics Suite',        contactId: 9,  value: 19500, stage: 'proposal',    probability: 50,  assignedTo: 1, expectedCloseDate: '2026-04-20', notes: 'Proposal submitted' },
  { id: 7,  title: 'Yobrand Performance Tracking',        contactId: 8,  value: 11000, stage: 'qualified',    probability: 25,  assignedTo: 2, expectedCloseDate: '2026-05-10', notes: 'Demo completed' },
  { id: 8,  title: 'Neza Safaris POS Upgrade',            contactId: 11, value: 8500,  stage: 'negotiation',  probability: 75,  assignedTo: 2, expectedCloseDate: '2026-03-25', notes: 'Hardware included' },
  { id: 9,  title: 'Access Bank Inventory Management',    contactId: 12, value: 22000, stage: 'proposal',    probability: 50,  assignedTo: 1, expectedCloseDate: '2026-04-30', notes: 'Custom integration required' },
  { id: 10, title: 'Nyungwe Tea ERP',                     contactId: 7,  value: 50000, stage: 'qualified',    probability: 25,  assignedTo: 1, expectedCloseDate: '2026-05-15', notes: 'Very large deal' }
];

// Activities / Tasks — dueDate as 'YYYY-MM-DD' string
// Today = 2026-03-13
export const mockActivities = [
  // Today's activities (open) — shown in "Open tasks today" widget
  { id: 1,  subject: 'Call Jean Paul re: proposal',        type: 'call',  relatedTo: { type: 'contact', id: 1  }, dueDate: '2026-03-13', owner: 1, status: 'open', notes: '' },
  { id: 2,  subject: 'Send MTN Rwanda contract draft',     type: 'email', relatedTo: { type: 'contact', id: 2  }, dueDate: '2026-03-13', owner: 2, status: 'open', notes: '' },
  { id: 3,  subject: 'Visit Yobrand for product demo',     type: 'visit', relatedTo: { type: 'lead',    id: 8  }, dueDate: '2026-03-13', owner: 2, status: 'open', notes: '' },
  // Overdue (past dueDate, status open)
  { id: 4,  subject: 'Follow up Bralirwa migration',       type: 'call',  relatedTo: { type: 'lead',    id: 3  }, dueDate: '2026-03-05', owner: 2, status: 'open', notes: 'No response yet' },
  { id: 5,  subject: 'Send Kigali Heights quote email',    type: 'email', relatedTo: { type: 'contact', id: 4  }, dueDate: '2026-03-07', owner: 1, status: 'open', notes: '' },
  { id: 6,  subject: 'Nyungwe Tea site visit',             type: 'visit', relatedTo: { type: 'contact', id: 7  }, dueDate: '2026-02-28', owner: 1, status: 'open', notes: 'Rescheduled twice' },
  // Completed past activities
  { id: 7,  subject: 'Initial call with Bank of Kigali',   type: 'call',  relatedTo: { type: 'contact', id: 1  }, dueDate: '2026-03-01', owner: 1, status: 'done', notes: 'Good response, sending proposal' },
  { id: 8,  subject: 'Email Dream Africa proposal',        type: 'email', relatedTo: { type: 'lead',    id: 6  }, dueDate: '2026-03-03', owner: 1, status: 'done', notes: '' },
  { id: 9,  subject: 'Bazasoft meeting',                   type: 'visit', relatedTo: { type: 'lead',    id: 7  }, dueDate: '2026-03-06', owner: 2, status: 'done', notes: 'Positive meeting' },
  { id: 10, subject: 'Send Neza Safaris invoice',         type: 'email', relatedTo: { type: 'contact', id: 11 }, dueDate: '2026-03-10', owner: 2, status: 'done', notes: '' },
  { id: 11, subject: 'Access Bank intro call',             type: 'call',  relatedTo: { type: 'contact', id: 12 }, dueDate: '2026-03-11', owner: 1, status: 'done', notes: 'Interested in full suite' },
  { id: 12, subject: 'MTN Rwanda negotiation meeting',     type: 'visit', relatedTo: { type: 'contact', id: 2  }, dueDate: '2026-03-04', owner: 2, status: 'done', notes: 'Great progress' },
  // Future activities (open)
  { id: 13, subject: 'MTN Rwanda follow-up meeting',       type: 'visit', relatedTo: { type: 'contact', id: 2  }, dueDate: '2026-03-17', owner: 2, status: 'open', notes: '' },
  { id: 14, subject: 'Yobrand proposal review call',      type: 'call',  relatedTo: { type: 'lead',    id: 8  }, dueDate: '2026-03-19', owner: 2, status: 'open', notes: '' },
  { id: 15, subject: 'Access Bank contract signing visit', type: 'visit', relatedTo: { type: 'contact', id: 12 }, dueDate: '2026-03-25', owner: 1, status: 'open', notes: '' }
];

export const mockUsersAdminView = mockUsers.map((user) => ({
  id:        user.id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  status:    'active',
  createdAt: user.id === 1 ? '2026-02-20T09:00:00Z' : '2026-02-25T09:00:00Z'
}));

export function getDashboardStatsForUser(userId, role) {
  const contacts = role === 'admin' ? mockContacts : mockContacts.filter((c) => c.assignedTo === userId);
  const leads    = role === 'admin' ? mockLeads    : mockLeads.filter((l) => l.assignedTo === userId);

  const totalValue   = leads.reduce((sum, l) => sum + (Number.isFinite(l.value) ? l.value : 0), 0);
  const statusCounts = leads.reduce(
    (acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; },
    { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0 }
  );

  return { contactsCount: contacts.length, leadsCount: leads.length, totalPipelineValue: totalValue, statusCounts };
}
