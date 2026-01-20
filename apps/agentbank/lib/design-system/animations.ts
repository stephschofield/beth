/**
 * Animation Presets using Framer Motion
 * 
 * Provides consistent animation patterns for AgentBank's UI.
 * All animations respect prefers-reduced-motion for accessibility.
 */

import type { Variants, Transition, TargetAndTransition } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Motion Preferences Hook (for use in components)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the user prefers reduced motion.
 * Use this to conditionally disable animations.
 * 
 * @example
 * const prefersReducedMotion = usePrefersReducedMotion();
 * const animationVariants = prefersReducedMotion ? reducedMotionVariants : fullMotionVariants;
 */
export const getReducedMotionMediaQuery = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ─────────────────────────────────────────────────────────────────────────────
// Base Transition Presets
// ─────────────────────────────────────────────────────────────────────────────

export const transitions = {
  /** Snappy spring for UI interactions */
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  } satisfies Transition,

  /** Bouncy spring for playful elements */
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  } satisfies Transition,

  /** Gentle spring for subtle movements */
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 30,
  } satisfies Transition,

  /** Fast tween for quick transitions */
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,

  /** Normal tween for standard transitions */
  normal: {
    type: 'tween',
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,

  /** Slow tween for emphasized transitions */
  slow: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  } satisfies Transition,

  /** Ease out for enter animations */
  easeOut: {
    type: 'tween',
    duration: 0.25,
    ease: [0, 0, 0.2, 1],
  } satisfies Transition,

  /** Ease in for exit animations */
  easeIn: {
    type: 'tween',
    duration: 0.2,
    ease: [0.4, 0, 1, 1],
  } satisfies Transition,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Fade Animations
// ─────────────────────────────────────────────────────────────────────────────

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.normal,
  },
  exit: { 
    opacity: 0,
    transition: transitions.fast,
  },
};

export const fadeUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    y: -5,
    transition: transitions.fast,
  },
};

export const fadeDownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -10,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    y: 5,
    transition: transitions.fast,
  },
};

export const fadeScaleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Slide Animations
// ─────────────────────────────────────────────────────────────────────────────

export const slideLeftVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: transitions.fast,
  },
};

export const slideRightVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Chat Message Animations
// ─────────────────────────────────────────────────────────────────────────────

export const chatMessageVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: transitions.fast,
  },
};

export const userMessageVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    x: 10,
    scale: 0.95,
    transition: transitions.fast,
  },
};

export const agentMessageVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    x: -10,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Agent Handoff Animation
// ─────────────────────────────────────────────────────────────────────────────

export const handoffContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const handoffAvatarVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
    rotate: -10,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

export const handoffArrowVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0,
    x: -10,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
};

export const handoffGlowVariants: Variants = {
  hidden: { 
    boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)',
  },
  visible: { 
    boxShadow: [
      '0 0 0 0 rgba(99, 102, 241, 0.4)',
      '0 0 20px 10px rgba(99, 102, 241, 0.2)',
      '0 0 0 0 rgba(99, 102, 241, 0)',
    ],
    transition: {
      duration: 1.2,
      ease: 'easeOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Thinking Indicator Animation
// ─────────────────────────────────────────────────────────────────────────────

export const thinkingDotVariants: Variants = {
  hidden: { opacity: 0.4, y: 0 },
  visible: (custom: number) => ({
    opacity: [0.4, 1, 0.4],
    y: [0, -6, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      delay: custom * 0.2,
      ease: 'easeInOut',
    },
  }),
};

export const thinkingContainerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Button & Interactive Animations
// ─────────────────────────────────────────────────────────────────────────────

export const buttonTap: TargetAndTransition = {
  scale: 0.97,
};

export const buttonHover: TargetAndTransition = {
  scale: 1.02,
  transition: transitions.spring,
};

export const iconButtonTap: TargetAndTransition = {
  scale: 0.92,
};

export const iconButtonHover: TargetAndTransition = {
  scale: 1.1,
  transition: transitions.bouncy,
};

// ─────────────────────────────────────────────────────────────────────────────
// Card & Container Animations
// ─────────────────────────────────────────────────────────────────────────────

export const cardMotionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.98,
    transition: transitions.fast,
  },
  hover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: transitions.spring,
  },
};

export const richCardMotionVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1,
    },
  },
  exit: { 
    opacity: 0, 
    y: -15,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// List & Stagger Animations
// ─────────────────────────────────────────────────────────────────────────────

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -10,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    x: -10,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal & Overlay Animations
// ─────────────────────────────────────────────────────────────────────────────

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: transitions.fast,
  },
};

export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
    },
  },
  exit: { 
    x: '100%',
    transition: transitions.normal,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast & Notification Animations
// ─────────────────────────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: transitions.bouncy,
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Loading & Progress Animations
// ─────────────────────────────────────────────────────────────────────────────

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const progressBarVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Success & Status Animations
// ─────────────────────────────────────────────────────────────────────────────

export const successCheckVariants: Variants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
      delay: 0.2,
    },
  },
};

export const successCircleVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Reduced Motion Alternatives
// ─────────────────────────────────────────────────────────────────────────────

export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.01 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.01 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Create Stagger Container
// ─────────────────────────────────────────────────────────────────────────────

export const createStaggerContainer = (
  staggerDelay = 0.05,
  delayChildren = 0.1
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: staggerDelay / 2,
      staggerDirection: -1,
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Motion Config
// ─────────────────────────────────────────────────────────────────────────────

/** Default motion configuration for MotionConfig provider */
export const motionConfig = {
  reducedMotion: 'user' as const,
  transition: transitions.spring,
};
