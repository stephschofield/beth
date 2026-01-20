import { cn } from '@/lib/utils';
import { agents } from '@/lib/agents';
import type { AgentId } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface AgentHandoffTransitionProps {
  fromAgentId: AgentId;
  toAgentId: AgentId;
  message: string;
}

export function AgentHandoffTransition({
  fromAgentId,
  toAgentId,
  message,
}: AgentHandoffTransitionProps) {
  const fromAgent = agents[fromAgentId];
  const toAgent = agents[toAgentId];

  return (
    <div className="flex items-center justify-center py-4 animate-fade-in">
      <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border rounded-xl px-6 py-4 max-w-md agent-handoff-enter">
        {/* Agent Transition Visual */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg transition-opacity',
              fromAgent.bgColor,
              'opacity-50'
            )}
          >
            {fromAgent.avatar}
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="w-5 h-5 text-indigo-500" />
            <ArrowRight className="w-5 h-5 text-indigo-500 -ml-3 opacity-60" />
            <ArrowRight className="w-5 h-5 text-indigo-500 -ml-3 opacity-30" />
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg ring-2 ring-indigo-500 ring-offset-2',
              toAgent.bgColor
            )}
          >
            {toAgent.avatar}
          </div>
        </div>

        {/* Agent Names */}
        <div className="flex items-center justify-center gap-8 mb-2">
          <div className="text-center">
            <p className="text-xs text-gray-400">{fromAgent.name}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">{toAgent.name}</p>
            <p className="text-xs text-gray-500">{toAgent.role}</p>
          </div>
        </div>

        {/* Handoff Message */}
        <p className="text-sm text-center text-gray-600 italic">"{message}"</p>
      </div>
    </div>
  );
}
