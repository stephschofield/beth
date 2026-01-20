import { AppShell } from '@/components/layout/AppShell';
import { accounts } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Wallet, PiggyBank, TrendingUp, MoreVertical } from 'lucide-react';

const accountIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
};

const accountColors = {
  checking: 'bg-blue-500',
  savings: 'bg-emerald-500',
  credit: 'bg-purple-500',
};

export default function AccountsPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-500 mt-1">Manage all your connected accounts</p>
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            + Link Account
          </button>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const Icon = accountIcons[account.type];
            const colorClass = accountColors[account.type];

            return (
              <div
                key={account.id}
                className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                {/* Account Header */}
                <div className="flex items-start justify-between">
                  <div className={`${colorClass} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Account Info */}
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{account.accountNumber}</p>
                </div>

                {/* Balance */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {account.type === 'credit' ? 'Current Balance' : 'Available Balance'}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    account.balance < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatCurrency(Math.abs(account.balance))}
                  </p>
                  {account.type === 'credit' && account.creditLimit && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Credit Used</span>
                        <span className="font-medium">
                          {Math.round((Math.abs(account.balance) / account.creditLimit) * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${(Math.abs(account.balance) / account.creditLimit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {account.type === 'savings' && account.interestRate && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{account.interestRate}% APY</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Details
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                    Transfer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Assets Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300">Total Net Worth</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-300">Accounts Connected</p>
              <p className="text-3xl font-bold mt-1">{accounts.length}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
