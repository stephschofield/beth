import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    groceries: '🛒',
    dining: '🍽️',
    transport: '🚗',
    utilities: '💡',
    entertainment: '🎬',
    shopping: '🛍️',
    income: '💵',
    transfer: '↔️',
    healthcare: '🏥',
    subscriptions: '📱',
  };
  return icons[category] || '💳';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    groceries: 'bg-green-100 text-green-700',
    dining: 'bg-orange-100 text-orange-700',
    transport: 'bg-blue-100 text-blue-700',
    utilities: 'bg-yellow-100 text-yellow-700',
    entertainment: 'bg-purple-100 text-purple-700',
    shopping: 'bg-pink-100 text-pink-700',
    income: 'bg-emerald-100 text-emerald-700',
    transfer: 'bg-slate-100 text-slate-700',
    healthcare: 'bg-red-100 text-red-700',
    subscriptions: 'bg-indigo-100 text-indigo-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}
