'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { agents } from '@/lib/agents';
import type { AgentId } from '@/lib/types';
import { thinkingDotVariants, thinkingContainerVariants } from '@/lib/design-system/animations';

interface AgentThinkingIndicatorProps {
  agentId: AgentId;
}

export function AgentThinkingIndicator({ agentId }: AgentThinkingIndicatorProps) {
  const agent = agents[agentId];

  return (
    <motion.div
      className="flex items-start gap-3"
      variants={thinkingContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 agent-avatar-active',
          agent.bgColor
        )}
      >
        {agent.avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
          <span className="text-xs text-gray-500">is thinking...</span>
        </div>
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              variants={thinkingDotVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
