'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { agents } from '@/lib/agents';
import type { AgentId } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import {
  handoffContainerVariants,
  handoffAvatarVariants,
  handoffArrowVariants,
} from '@/lib/design-system/animations';

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
    <motion.div
      className="flex items-center justify-center py-4"
      variants={handoffContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border rounded-xl px-6 py-4 max-w-md">
        {/* Agent Transition Visual */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <motion.div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg',
              fromAgent.bgColor,
              'opacity-50'
            )}
            variants={handoffAvatarVariants}
          >
            {fromAgent.avatar}
          </motion.div>
          <motion.div className="flex items-center gap-1" variants={handoffArrowVariants}>
            <ArrowRight className="w-5 h-5 text-indigo-500" />
            <ArrowRight className="w-5 h-5 text-indigo-500 -ml-3 opacity-60" />
            <ArrowRight className="w-5 h-5 text-indigo-500 -ml-3 opacity-30" />
          </motion.div>
          <motion.div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg ring-2 ring-indigo-500 ring-offset-2',
              toAgent.bgColor
            )}
            variants={handoffAvatarVariants}
          >
            {toAgent.avatar}
          </motion.div>
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
    </motion.div>
  );
}
