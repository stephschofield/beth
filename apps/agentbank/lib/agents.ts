import type { Agent, AgentId } from './types';

export const agents: Record<AgentId, Agent> = {
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    avatar: '🌐',
    color: 'slate',
    bgColor: 'bg-slate-900',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-900',
    role: 'Orchestrator',
    description: 'I coordinate between specialized agents to help you with any banking needs.',
  },
  penny: {
    id: 'penny',
    name: 'Penny',
    avatar: '💰',
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
    role: 'Spending Analyst',
    description: 'I analyze your spending patterns and help you understand where your money goes.',
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    avatar: '🛡️',
    color: 'red',
    bgColor: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600',
    role: 'Fraud Detection',
    description: 'I monitor your accounts 24/7 to keep your money safe from fraud.',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    avatar: '⚡',
    color: 'indigo',
    bgColor: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-500',
    role: 'Transfers Specialist',
    description: 'I handle all your money transfers quickly and securely.',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    avatar: '📊',
    color: 'amber',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-500',
    role: 'Financial Advisor',
    description: 'I provide personalized advice to help you reach your financial goals.',
  },
};

export function getAgent(id: AgentId): Agent {
  return agents[id];
}

export function getAllAgents(): Agent[] {
  return Object.values(agents);
}

// Mock agent responses based on context
export interface AgentResponse {
  message: string;
  card?: {
    type: 'transfer-confirm' | 'spending-chart' | 'fraud-alert' | 'account-summary' | 'bill-reminder';
    data: Record<string, unknown>;
  };
}

export function getAgentGreeting(agentId: AgentId): string {
  const greetings: Record<AgentId, string> = {
    atlas: "Hello! I'm Atlas, your personal banking orchestrator. How can I help you today?",
    penny: "Hi there! I'm Penny, your spending analyst. Ready to dive into your finances?",
    sentinel: "Hello, I'm Sentinel. Your account security is my top priority. What would you like to review?",
    nova: "Hey! I'm Nova, and I make transfers lightning fast. Who would you like to send money to?",
    sage: "Greetings! I'm Sage, your financial advisor. Let's work on building your wealth together.",
  };
  return greetings[agentId];
}

export function getMockAgentResponse(agentId: AgentId, userMessage: string): AgentResponse {
  const lowerMessage = userMessage.toLowerCase();
  
  switch (agentId) {
    case 'nova': {
      if (lowerMessage.includes('sarah') || lowerMessage.includes('$100') || lowerMessage.includes('send')) {
        return {
          message: "I've prepared a transfer for you. Please review the details below and confirm when ready.",
          card: {
            type: 'transfer-confirm',
            data: {
              fromAccount: 'Everyday Checking (****4521)',
              toContact: 'Sarah Chen',
              amount: 100,
              memo: 'Dinner split',
              estimatedArrival: 'Instant',
            },
          },
        };
      }
      return {
        message: "I can help you transfer money. Just tell me who you'd like to send money to and how much. Your recent contacts are Sarah Chen, Michael Rodriguez, and David Kim.",
      };
    }
    
    case 'penny': {
      if (lowerMessage.includes('dining') || lowerMessage.includes('food') || lowerMessage.includes('restaurant')) {
        return {
          message: "I've analyzed your dining spending. Here's a breakdown of your food expenses this month.",
          card: {
            type: 'spending-chart',
            data: {
              category: 'Dining',
              thisMonth: 156.45,
              lastMonth: 127.32,
              trend: 'up',
              changePercent: 23,
              breakdown: [
                { name: 'Uber Eats', amount: 34.56 },
                { name: 'Starbucks', amount: 7.45 },
                { name: 'Various Restaurants', amount: 114.44 },
              ],
            },
          },
        };
      }
      return {
        message: "Your total spending this month is $829.36. Your biggest categories are Shopping (29%), Groceries (24%), and Dining (19%). Would you like me to analyze any specific category?",
        card: {
          type: 'spending-chart',
          data: {
            total: 829.36,
            categories: [
              { name: 'Shopping', amount: 246.77, percentage: 29 },
              { name: 'Groceries', amount: 195.07, percentage: 24 },
              { name: 'Dining', amount: 156.45, percentage: 19 },
              { name: 'Utilities', amount: 145.67, percentage: 18 },
              { name: 'Transport', amount: 58.42, percentage: 7 },
              { name: 'Subscriptions', amount: 26.98, percentage: 3 },
            ],
          },
        },
      };
    }
    
    case 'sentinel': {
      if (lowerMessage.includes('suspicious') || lowerMessage.includes('fraud') || lowerMessage.includes('block')) {
        return {
          message: "🚨 I've detected a suspicious transaction that requires your attention. An ATM withdrawal in New York doesn't match your usual activity patterns.",
          card: {
            type: 'fraud-alert',
            data: {
              transactionId: 'txn-014',
              type: 'ATM Withdrawal',
              amount: 500,
              location: 'New York, NY',
              date: '2026-01-13',
              riskLevel: 'high',
              reason: 'Unusual location - you were in San Francisco on this date',
              actions: ['Block Card', 'Report as Fraud', 'This Was Me'],
            },
          },
        };
      }
      return {
        message: "Your accounts are currently secure. I'm monitoring all activity 24/7. There's one flagged transaction from January 13th that I'd like you to review. Would you like to see the details?",
      };
    }
    
    case 'sage': {
      if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
        return {
          message: "Great question! Based on your income and spending patterns, I recommend setting aside $800/month. You could reach a $30,000 emergency fund by October 2026. Here are some strategies:\n\n1. **Automate savings**: Set up a $200/week transfer to your High-Yield Savings\n2. **Reduce dining out**: Cutting back 20% saves $31/month\n3. **Review subscriptions**: You have 2 subscriptions totaling $27/month\n\nWould you like me to set up automated savings?",
        };
      }
      if (lowerMessage.includes('invest')) {
        return {
          message: "With your current savings rate and risk tolerance, I'd suggest a balanced approach:\n\n📈 **Investment Allocation**\n- 60% Index Funds (S&P 500, Total Market)\n- 25% Bonds (for stability)\n- 15% Growth stocks (tech, innovation)\n\nYour emergency fund ($24,680) covers 6 months of expenses, so you're ready to start investing! Want me to explain any of these options in detail?",
        };
      }
      return {
        message: "I'm here to help with your financial goals. Based on your accounts, you have a healthy savings balance and manageable credit card usage. What would you like to work on - saving more, investing, or paying down debt faster?",
      };
    }
    
    default: {
      // Atlas - orchestrator responses
      return {
        message: "I understand your request. Let me connect you with the right specialist. Based on what you're asking about, I think one of my colleagues can help you better.",
      };
    }
  }
}
