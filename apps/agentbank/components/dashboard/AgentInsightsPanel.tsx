'use client';

import { agentInsights } from '@/lib/mock-data';
import { agents } from '@/lib/agents';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Sparkles, ArrowRight, Bell } from 'lucide-react';
import Link from 'next/link';

export function AgentInsightsPanel() {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Agent Insights</h2>
            <p className="text-xs text-gray-500">Your AI team's observations</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="divide-y">
        {agentInsights.map((insight) => {
          const agent = agents[insight.agentId];
          const priorityStyles = {
            urgent: 'border-l-4 border-red-500 bg-red-50',
            high: 'border-l-4 border-amber-500 bg-amber-50',
            medium: 'border-l-4 border-blue-500',
            low: '',
          };

          return (
            <div
              key={insight.id}
              className={cn(
                'px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer',
                priorityStyles[insight.priority]
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
                    <p className="font-medium text-gray-900 text-sm">{insight.title}</p>
                    {insight.priority === 'urgent' && (
                      <span className="animate-pulse">
                        <Bell className="w-4 h-4 text-red-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {agent.name} • {formatRelativeTime(insight.timestamp)}
                    </span>
                    {insight.actionLabel && (
                      <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                        {insight.actionLabel}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gradient-to-r from-indigo-50 to-purple-50">
        <Link
          href="/chat"
          className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Sparkles className="w-4 h-4" />
          Chat with your AI agents
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
