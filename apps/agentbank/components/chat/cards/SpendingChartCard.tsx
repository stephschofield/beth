'use client';

import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, PieChart } from 'lucide-react';

interface SpendingChartCardProps {
  data: Record<string, unknown>;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

const categoryColors: Record<string, string> = {
  'Shopping': 'bg-pink-500',
  'Groceries': 'bg-green-500',
  'Dining': 'bg-orange-500',
  'Utilities': 'bg-yellow-500',
  'Transport': 'bg-blue-500',
  'Subscriptions': 'bg-purple-500',
  'Entertainment': 'bg-indigo-500',
  'Healthcare': 'bg-red-500',
  'Default': 'bg-gray-500',
};

export function SpendingChartCard({ data }: SpendingChartCardProps) {
  const categories = data.categories as CategoryData[] | undefined;
  const breakdown = data.breakdown as { name: string; amount: number }[] | undefined;
  const total = data.total as number | undefined;
  const thisMonth = data.thisMonth as number | undefined;
  const lastMonth = data.lastMonth as number | undefined;
  const trend = data.trend as 'up' | 'down' | 'stable' | undefined;
  const changePercent = data.changePercent as number | undefined;
  const category = data.category as string | undefined;

  // Single category view
  if (category && thisMonth !== undefined) {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-gray-500';

    return (
      <div className="rich-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${categoryColors[category] || categoryColors['Default']} flex items-center justify-center`}>
              <span className="text-white text-sm">🍽️</span>
            </div>
            <span className="font-semibold text-gray-900">{category} Spending</span>
          </div>
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{changePercent}%</span>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">This Month</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(thisMonth)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Last Month</p>
            <p className="text-xl font-bold text-gray-500">{formatCurrency(lastMonth as number)}</p>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Breakdown</p>
            <div className="space-y-2">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Overview with all categories
  if (categories && total !== undefined) {
    return (
      <div className="rich-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-gray-900">Spending Overview</span>
          </div>
          <span className="text-sm text-gray-500">This month</span>
        </div>

        {/* Total */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>

        {/* Category Bars */}
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{cat.name}</span>
                <span className="font-medium text-gray-900">{formatCurrency(cat.amount)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${categoryColors[cat.name] || categoryColors['Default']}`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <button className="w-full mt-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View Full Report →
        </button>
      </div>
    );
  }

  return null;
}
