'use client';

import { useRef, useEffect } from 'react';
import { useAgentChat } from '@/hooks/useAgentChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentThinkingIndicator } from '../agents/AgentThinkingIndicator';
import { AgentBadge } from '../agents/AgentBadge';
import { agents } from '@/lib/agents';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export function ChatContainer() {
  const {
    messages,
    currentAgent,
    isThinking,
    isHandingOff,
    sendMessage,
    triggerFraudAlert,
    resetChat,
  } = useAgentChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AgentBadge agentId={currentAgent} size="lg" showRole isActive />
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-sm text-gray-500">Current Agent</p>
              <p className="text-sm font-medium text-gray-900">
                {agents[currentAgent].description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Demo Controls */}
            <button
              onClick={triggerFraudAlert}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Trigger a fraud alert demo"
            >
              <AlertTriangle className="w-4 h-4" />
              Demo Fraud Alert
            </button>
            <button
              onClick={resetChat}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Agent Roster Mini */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-xs text-gray-500">Available agents:</span>
          <div className="flex items-center gap-2">
            {Object.values(agents).map((agent) => (
              <div
                key={agent.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  agent.id === currentAgent
                    ? `${agent.bgColor} ring-2 ring-offset-1 ring-indigo-500`
                    : `${agent.bgColor} opacity-50 hover:opacity-100`
                }`}
                title={`${agent.name} - ${agent.role}`}
              >
                {agent.avatar}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isThinking && !isHandingOff && (
          <AgentThinkingIndicator agentId={currentAgent} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-gray-500 flex-shrink-0">Try:</span>
          {[
            'Send $100 to Sarah',
            'Show my spending',
            'Check for fraud',
            'How can I save more?',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="flex-shrink-0 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSend={sendMessage} disabled={isThinking || isHandingOff} />
    </div>
  );
}
