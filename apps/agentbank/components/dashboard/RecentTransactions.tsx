import { getRecentTransactions } from '@/lib/mock-data';
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export function RecentTransactions() {
  const transactions = getRecentTransactions(8);

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Transaction List */}
      <div className="divide-y">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className={cn(
              'px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors',
              txn.isFlagged && 'bg-red-50'
            )}
          >
            {/* Category Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                getCategoryColor(txn.category)
              )}
            >
              <span className="text-lg">{getCategoryIcon(txn.category)}</span>
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">{txn.description}</p>
                {txn.isFlagged && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Flagged
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatDate(txn.date)}</span>
                {txn.merchant && (
                  <>
                    <span>•</span>
                    <span>{txn.merchant}</span>
                  </>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p
                className={cn(
                  'font-semibold',
                  txn.amount > 0 ? 'text-emerald-600' : 'text-gray-900'
                )}
              >
                {txn.amount > 0 ? '+' : ''}{formatCurrency(txn.amount)}
              </p>
              <p className="text-sm text-gray-400 capitalize">
                {txn.category.replace('_', ' ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
