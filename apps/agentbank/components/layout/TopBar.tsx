'use client';

import { useState } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { agentInsights } from '@/lib/mock-data';
import { agents } from '@/lib/agents';
import { cn } from '@/lib/utils';

export function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const urgentInsights = agentInsights.filter((i) => i.priority === 'urgent');

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4 lg:mx-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, accounts, or ask an agent..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {urgentInsights.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border shadow-lg overflow-hidden animate-fade-in">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Agent Alerts</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {agentInsights.slice(0, 4).map((insight) => {
                    const agent = agents[insight.agentId];
                    return (
                      <div
                        key={insight.id}
                        className={cn(
                          'p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors',
                          insight.priority === 'urgent' && 'bg-red-50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0',
                              agent.bgColor
                            )}
                          >
                            {agent.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                {insight.title}
                              </p>
                              {insight.priority === 'urgent' && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 bg-gray-50 border-t">
                  <button className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    View All Alerts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm lg:hidden">
            A
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t bg-white animate-fade-in">
          <nav className="p-4 space-y-2">
            <a href="/" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">
              Dashboard
            </a>
            <a href="/chat" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">
              Chat with Agents
            </a>
            <a href="/accounts" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">
              Accounts
            </a>
            <a href="/transfers" className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">
              Transfers
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
