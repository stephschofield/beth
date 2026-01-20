import type {
  Account,
  Transaction,
  Bill,
  Contact,
  AgentInsight,
  SpendingCategory,
} from './types';

// Mock Accounts
export const accounts: Account[] = [
  {
    id: 'acc-001',
    type: 'checking',
    name: 'Everyday Checking',
    balance: 8542.67,
    availableBalance: 8342.67,
    accountNumber: '****4521',
    lastFourDigits: '4521',
  },
  {
    id: 'acc-002',
    type: 'savings',
    name: 'High-Yield Savings',
    balance: 24680.45,
    availableBalance: 24680.45,
    accountNumber: '****7832',
    lastFourDigits: '7832',
    interestRate: 4.5,
  },
  {
    id: 'acc-003',
    type: 'credit',
    name: 'Platinum Rewards Card',
    balance: -1847.23,
    availableBalance: 8152.77,
    accountNumber: '****9156',
    lastFourDigits: '9156',
    creditLimit: 10000,
  },
];

// Mock Transactions
export const transactions: Transaction[] = [
  {
    id: 'txn-001',
    accountId: 'acc-001',
    date: '2026-01-20',
    description: 'Whole Foods Market',
    amount: -127.84,
    category: 'groceries',
    status: 'completed',
    merchant: 'Whole Foods',
    location: 'San Francisco, CA',
  },
  {
    id: 'txn-002',
    accountId: 'acc-001',
    date: '2026-01-19',
    description: 'Direct Deposit - TechCorp Inc',
    amount: 4250.0,
    category: 'income',
    status: 'completed',
  },
  {
    id: 'txn-003',
    accountId: 'acc-003',
    date: '2026-01-19',
    description: 'Uber Eats',
    amount: -34.56,
    category: 'dining',
    status: 'completed',
    merchant: 'Uber Eats',
  },
  {
    id: 'txn-004',
    accountId: 'acc-001',
    date: '2026-01-18',
    description: 'Netflix Subscription',
    amount: -15.99,
    category: 'subscriptions',
    status: 'completed',
    merchant: 'Netflix',
  },
  {
    id: 'txn-005',
    accountId: 'acc-001',
    date: '2026-01-18',
    description: 'Gas Station - Shell',
    amount: -58.42,
    category: 'transport',
    status: 'completed',
    merchant: 'Shell',
    location: 'Oakland, CA',
  },
  {
    id: 'txn-006',
    accountId: 'acc-003',
    date: '2026-01-17',
    description: 'Amazon.com',
    amount: -89.99,
    category: 'shopping',
    status: 'completed',
    merchant: 'Amazon',
  },
  {
    id: 'txn-007',
    accountId: 'acc-001',
    date: '2026-01-17',
    description: 'Starbucks',
    amount: -7.45,
    category: 'dining',
    status: 'completed',
    merchant: 'Starbucks',
    location: 'San Francisco, CA',
  },
  {
    id: 'txn-008',
    accountId: 'acc-001',
    date: '2026-01-16',
    description: 'Transfer to Savings',
    amount: -500.0,
    category: 'transfer',
    status: 'completed',
  },
  {
    id: 'txn-009',
    accountId: 'acc-002',
    date: '2026-01-16',
    description: 'Transfer from Checking',
    amount: 500.0,
    category: 'transfer',
    status: 'completed',
  },
  {
    id: 'txn-010',
    accountId: 'acc-003',
    date: '2026-01-15',
    description: 'Spotify Premium',
    amount: -10.99,
    category: 'subscriptions',
    status: 'completed',
    merchant: 'Spotify',
  },
  {
    id: 'txn-011',
    accountId: 'acc-001',
    date: '2026-01-15',
    description: 'PG&E Utilities',
    amount: -145.67,
    category: 'utilities',
    status: 'completed',
    merchant: 'PG&E',
  },
  {
    id: 'txn-012',
    accountId: 'acc-001',
    date: '2026-01-14',
    description: 'Movie Theater',
    amount: -28.5,
    category: 'entertainment',
    status: 'completed',
    merchant: 'AMC Theaters',
  },
  {
    id: 'txn-013',
    accountId: 'acc-003',
    date: '2026-01-14',
    description: 'CVS Pharmacy',
    amount: -42.18,
    category: 'healthcare',
    status: 'completed',
    merchant: 'CVS',
  },
  {
    id: 'txn-014',
    accountId: 'acc-001',
    date: '2026-01-13',
    description: 'Unknown - ATM Withdrawal',
    amount: -500.0,
    category: 'transfer',
    status: 'flagged',
    location: 'New York, NY',
    isFlagged: true,
  },
  {
    id: 'txn-015',
    accountId: 'acc-001',
    date: '2026-01-12',
    description: 'Trader Joe\'s',
    amount: -67.23,
    category: 'groceries',
    status: 'completed',
    merchant: 'Trader Joe\'s',
    location: 'San Francisco, CA',
  },
  {
    id: 'txn-016',
    accountId: 'acc-003',
    date: '2026-01-12',
    description: 'Target',
    amount: -156.78,
    category: 'shopping',
    status: 'completed',
    merchant: 'Target',
  },
];

// Mock Bills
export const bills: Bill[] = [
  {
    id: 'bill-001',
    payee: 'Rent - Bay Apartments',
    amount: 2850.0,
    dueDate: '2026-02-01',
    category: 'Housing',
    isAutoPay: true,
    accountId: 'acc-001',
  },
  {
    id: 'bill-002',
    payee: 'AT&T Wireless',
    amount: 89.99,
    dueDate: '2026-01-25',
    category: 'Phone',
    isAutoPay: false,
    accountId: 'acc-001',
  },
  {
    id: 'bill-003',
    payee: 'Comcast Internet',
    amount: 79.99,
    dueDate: '2026-01-28',
    category: 'Internet',
    isAutoPay: true,
    accountId: 'acc-001',
  },
];

// Mock Contacts
export const contacts: Contact[] = [
  {
    id: 'contact-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '(415) 555-0123',
    bank: 'Chase',
    isFavorite: true,
  },
  {
    id: 'contact-002',
    name: 'Michael Rodriguez',
    email: 'm.rodriguez@email.com',
    phone: '(510) 555-0456',
    bank: 'Bank of America',
    isFavorite: true,
  },
  {
    id: 'contact-003',
    name: 'Emily Watson',
    email: 'emily.w@email.com',
    bank: 'Wells Fargo',
    isFavorite: false,
  },
  {
    id: 'contact-004',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '(650) 555-0789',
    bank: 'Chase',
    isFavorite: true,
  },
  {
    id: 'contact-005',
    name: 'Amanda Foster',
    email: 'a.foster@email.com',
    bank: 'Citibank',
    isFavorite: false,
  },
];

// Mock Agent Insights
export const agentInsights: AgentInsight[] = [
  {
    id: 'insight-001',
    agentId: 'sentinel',
    title: 'Suspicious Activity Detected',
    description: 'An ATM withdrawal of $500 in New York seems unusual given your location history.',
    priority: 'urgent',
    actionLabel: 'Review Now',
    timestamp: new Date('2026-01-20T10:30:00'),
  },
  {
    id: 'insight-002',
    agentId: 'penny',
    title: 'Dining Spending Up 23%',
    description: 'You\'ve spent $156 on dining this month, up from $127 last month.',
    priority: 'medium',
    actionLabel: 'View Details',
    timestamp: new Date('2026-01-20T09:00:00'),
  },
  {
    id: 'insight-003',
    agentId: 'sage',
    title: 'Savings Goal Progress',
    description: 'You\'re 78% towards your $30,000 emergency fund goal. Great progress!',
    priority: 'low',
    actionLabel: 'Adjust Goal',
    timestamp: new Date('2026-01-19T14:00:00'),
  },
  {
    id: 'insight-004',
    agentId: 'nova',
    title: 'Upcoming Bill: AT&T',
    description: 'Your AT&T bill of $89.99 is due in 5 days. Schedule payment?',
    priority: 'medium',
    actionLabel: 'Pay Now',
    timestamp: new Date('2026-01-20T08:00:00'),
  },
];

// Mock Spending Categories
export const spendingByCategory: SpendingCategory[] = [
  { category: 'groceries', amount: 195.07, percentage: 24, trend: 'down', changePercent: -8 },
  { category: 'dining', amount: 156.45, percentage: 19, trend: 'up', changePercent: 23 },
  { category: 'transport', amount: 58.42, percentage: 7, trend: 'stable', changePercent: 2 },
  { category: 'utilities', amount: 145.67, percentage: 18, trend: 'up', changePercent: 5 },
  { category: 'subscriptions', amount: 26.98, percentage: 3, trend: 'stable', changePercent: 0 },
  { category: 'shopping', amount: 246.77, percentage: 29, trend: 'up', changePercent: 15 },
];

// Helper functions
export function getAccountById(id: string): Account | undefined {
  return accounts.find((acc) => acc.id === id);
}

export function getTransactionsByAccountId(accountId: string): Transaction[] {
  return transactions.filter((txn) => txn.accountId === accountId);
}

export function getRecentTransactions(limit: number = 10): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getTotalBalance(): number {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0);
}

export function getContactById(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id);
}

export function getFavoriteContacts(): Contact[] {
  return contacts.filter((c) => c.isFavorite);
}
