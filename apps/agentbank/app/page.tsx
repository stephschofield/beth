import { AppShell } from '@/components/layout/AppShell';
import { AccountSummary } from '@/components/dashboard/AccountSummary';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AgentInsightsPanel } from '@/components/dashboard/AgentInsightsPanel';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Alex</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your money</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Account Summary & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <AccountSummary />
            <RecentTransactions />
          </div>

          {/* Right Column - Agent Insights */}
          <div className="lg:col-span-1">
            <AgentInsightsPanel />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
