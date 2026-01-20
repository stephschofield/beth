import { accounts } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Wallet, PiggyBank, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const accountIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
};

const accountGradients = {
  checking: 'from-blue-500 to-blue-600',
  savings: 'from-emerald-500 to-emerald-600',
  credit: 'from-purple-500 to-purple-600',
};

export function AccountSummary() {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-4">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Total Net Worth</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+2.5% from last month</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold">A+</p>
                <p className="text-xs text-slate-400">Health Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const Icon = accountIcons[account.type];
          const gradient = accountGradients[account.type];
          const isNegative = account.balance < 0;

          return (
            <div
              key={account.id}
              className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`bg-gradient-to-br ${gradient} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-0.5 text-sm ${
                  account.type === 'credit' ? 'text-purple-600' : 'text-emerald-600'
                }`}>
                  {account.type === 'credit' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                  <span>{account.type === 'credit' ? 'Owed' : '+$124'}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">{account.name}</p>
                <p className={`text-xl font-bold mt-0.5 ${
                  isNegative ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatCurrency(Math.abs(account.balance))}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{account.accountNumber}</span>
                  {account.type === 'savings' && account.interestRate && (
                    <span className="text-emerald-600 font-medium">{account.interestRate}% APY</span>
                  )}
                  {account.type === 'credit' && account.creditLimit && (
                    <span className="text-purple-600 font-medium">
                      {formatCurrency(account.availableBalance)} avail
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
