import { cn } from '@/lib/utils';
import { agents } from '@/lib/agents';
import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { TransferConfirmCard } from './cards/TransferConfirmCard';
import { SpendingChartCard } from './cards/SpendingChartCard';
import { FraudAlertCard } from './cards/FraudAlertCard';
import { AgentHandoffTransition } from '../agents/AgentHandoffTransition';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  // Handoff message
  if (message.type === 'handoff' && message.handoffFrom && message.handoffTo) {
    return (
      <AgentHandoffTransition
        fromAgentId={message.handoffFrom}
        toAgentId={message.handoffTo}
        message={message.content}
      />
    );
  }

  // User message
  if (message.type === 'user') {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[70%]">
          <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3">
            <p className="text-sm">{message.content}</p>
          </div>
          <p className="text-xs text-gray-400 text-right mt-1">
            {formatRelativeTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  // Agent message
  if (message.type === 'agent' && message.agentId) {
    const agent = agents[message.agentId];

    return (
      <div className="flex items-start gap-3 animate-fade-in">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            agent.bgColor
          )}
        >
          {agent.avatar}
        </div>
        <div className="flex-1 max-w-[70%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', `bg-${agent.color}-100 ${agent.textColor}`)}>
              {agent.role}
            </span>
          </div>
          <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {/* Rich Card */}
          {message.card && (
            <div className="mt-3">
              {message.card.type === 'transfer-confirm' && (
                <TransferConfirmCard data={message.card.data} />
              )}
              {message.card.type === 'spending-chart' && (
                <SpendingChartCard data={message.card.data} />
              )}
              {message.card.type === 'fraud-alert' && (
                <FraudAlertCard data={message.card.data} />
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-1">
            {formatRelativeTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  // System message
  return (
    <div className="flex justify-center animate-fade-in">
      <div className="bg-gray-100 text-gray-600 rounded-full px-4 py-2 text-xs">
        {message.content}
      </div>
    </div>
  );
}
