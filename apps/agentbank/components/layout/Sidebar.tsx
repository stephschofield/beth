'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Wallet, 
  Send, 
  PieChart,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { agents } from '@/lib/agents';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chat with Agents', href: '/chat', icon: MessageSquare },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Transfers', href: '/transfers', icon: Send },
];

const secondaryNav = [
  { name: 'Settings', href: '#', icon: Settings },
  { name: 'Help', href: '#', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl">🏦</span>
            </div>
            <div>
              <h1 className="font-bold text-xl gradient-text">AgentBank</h1>
              <p className="text-xs text-gray-500">AI-Powered Banking</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
                {item.name === 'Chat with Agents' && (
                  <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                    5 agents
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Agent Roster */}
        <div className="px-4 mt-4">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Your AI Team
          </p>
          <div className="mt-3 space-y-1">
            {Object.values(agents).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    agent.bgColor
                  )}
                >
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                  <p className="text-xs text-gray-500 truncate">{agent.role}</p>
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full" title="Online" />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-auto px-2 border-t pt-4">
          {secondaryNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              {item.name}
            </Link>
          ))}
          
          {/* User Profile */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Alex Johnson</p>
                <p className="text-xs text-gray-500 truncate">Premium Member</p>
              </div>
              <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
