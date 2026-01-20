import type { AgentId } from './types';

interface RouteResult {
  targetAgent: AgentId;
  shouldHandoff: boolean;
  reason: string;
}

// Keyword patterns for each agent
const agentKeywords: Record<Exclude<AgentId, 'atlas'>, string[]> = {
  nova: ['send', 'transfer', 'pay', 'payment', 'wire', 'zelle', 'venmo', 'money to'],
  penny: ['spending', 'budget', 'category', 'spent', 'expenses', 'breakdown', 'analytics', 'where did', 'how much did i spend'],
  sentinel: ['fraud', 'suspicious', 'block', 'security', 'unauthorized', 'stolen', 'hack', 'scam', 'protect'],
  sage: ['advice', 'save', 'saving', 'invest', 'investment', 'goal', 'retire', 'plan', 'strategy', 'should i'],
};

export function routeToAgent(message: string, currentAgent: AgentId): RouteResult {
  const lowerMessage = message.toLowerCase();
  
  // Check each agent's keywords
  for (const [agentId, keywords] of Object.entries(agentKeywords)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        const targetAgent = agentId as AgentId;
        return {
          targetAgent,
          shouldHandoff: currentAgent !== targetAgent,
          reason: `Detected "${keyword}" in message`,
        };
      }
    }
  }
  
  // Default to Atlas or stay with current agent
  if (currentAgent === 'atlas') {
    return {
      targetAgent: 'atlas',
      shouldHandoff: false,
      reason: 'No specific intent detected, staying with Atlas',
    };
  }
  
  // If already with a specialist, stay with them unless clear topic change
  return {
    targetAgent: currentAgent,
    shouldHandoff: false,
    reason: 'Continuing conversation with current agent',
  };
}

export function getHandoffMessage(fromAgent: AgentId, toAgent: AgentId): string {
  const messages: Record<string, string> = {
    'atlas-nova': "I'll connect you with Nova, our transfers specialist. She'll help you send money quickly and securely.",
    'atlas-penny': "Let me bring in Penny, our spending analyst. She's great at breaking down where your money goes.",
    'atlas-sentinel': "I'm routing you to Sentinel, our security expert. They'll help keep your accounts safe.",
    'atlas-sage': "I'll introduce you to Sage, our financial advisor. They can help you plan for the future.",
    'nova-penny': "Handing you off to Penny for spending analysis. She'll give you the detailed breakdown you need.",
    'nova-sentinel': "I'm connecting you with Sentinel for security matters. Your safety comes first.",
    'nova-sage': "Let me transfer you to Sage for financial advice. They're the expert on long-term planning.",
    'penny-nova': "Connecting you to Nova for your transfer needs. She'll get that money moving!",
    'penny-sentinel': "I'm bringing in Sentinel to review security concerns. They've got you covered.",
    'penny-sage': "Transferring you to Sage for advice. They can help turn these insights into action.",
    'sentinel-nova': "Routing to Nova for transfer assistance. She'll handle it securely.",
    'sentinel-penny': "Connecting you to Penny to review your spending patterns.",
    'sentinel-sage': "Handing off to Sage for financial guidance.",
    'sage-nova': "Let me connect you with Nova for that transfer.",
    'sage-penny': "Bringing in Penny to analyze your spending in detail.",
    'sage-sentinel': "Connecting you to Sentinel for security review.",
  };
  
  const key = `${fromAgent}-${toAgent}`;
  return messages[key] || `Transferring you to ${toAgent} for specialized assistance.`;
}

// Simulate proactive fraud detection
export function shouldTriggerFraudAlert(): boolean {
  // In a real app, this would check for suspicious patterns
  // For demo, randomly trigger or based on certain conditions
  return Math.random() < 0.1; // 10% chance for demo purposes
}

export function getFraudAlertData() {
  return {
    transactionId: 'txn-014',
    type: 'ATM Withdrawal',
    amount: 500,
    location: 'New York, NY',
    date: '2026-01-13',
    riskLevel: 'high',
    reason: 'Unusual location - you were in San Francisco on this date',
  };
}
