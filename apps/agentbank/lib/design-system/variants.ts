/**
 * Shared CVA (Class Variance Authority) Variants
 * 
 * Centralized variant definitions for consistent component styling.
 * Uses Tailwind CSS classes with the design tokens.
 */

import { cva, type VariantProps } from 'class-variance-authority';

// ─────────────────────────────────────────────────────────────────────────────
// Button Variants
// ─────────────────────────────────────────────────────────────────────────────

export const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium whitespace-nowrap',
    'rounded-lg transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-indigo-600 text-white',
          'hover:bg-indigo-700',
          'focus-visible:ring-indigo-500',
          'shadow-sm',
        ],
        secondary: [
          'bg-white text-gray-700 border border-gray-300',
          'hover:bg-gray-50 hover:border-gray-400',
          'focus-visible:ring-indigo-500',
        ],
        ghost: [
          'text-gray-600',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus-visible:ring-gray-400',
        ],
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus-visible:ring-red-500',
          'shadow-sm',
        ],
        success: [
          'bg-emerald-600 text-white',
          'hover:bg-emerald-700',
          'focus-visible:ring-emerald-500',
          'shadow-sm',
        ],
        link: [
          'text-indigo-600 underline-offset-4',
          'hover:underline hover:text-indigo-700',
          'focus-visible:ring-indigo-500',
        ],
        gradient: [
          'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
          'hover:from-indigo-600 hover:to-purple-700',
          'focus-visible:ring-indigo-500',
          'shadow-md hover:shadow-lg',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Card Variants
// ─────────────────────────────────────────────────────────────────────────────

export const cardVariants = cva(
  // Base styles
  [
    'rounded-xl bg-white',
    'transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'border border-gray-200 shadow-sm',
        elevated: 'shadow-md hover:shadow-lg',
        outlined: 'border-2 border-gray-200',
        ghost: 'bg-gray-50/50',
        gradient: 'bg-gradient-to-br border-0',
        interactive: [
          'border border-gray-200 shadow-sm',
          'hover:shadow-md hover:border-gray-300',
          'cursor-pointer',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Badge Variants
// ─────────────────────────────────────────────────────────────────────────────

export const badgeVariants = cva(
  // Base styles
  [
    'inline-flex items-center gap-1',
    'font-medium rounded-full',
    'transition-colors duration-150',
  ],
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-indigo-100 text-indigo-700',
        secondary: 'bg-purple-100 text-purple-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        outline: 'border border-current bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Input Variants
// ─────────────────────────────────────────────────────────────────────────────

export const inputVariants = cva(
  // Base styles
  [
    'flex w-full rounded-lg border bg-white',
    'text-gray-900 placeholder:text-gray-400',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-300',
          'focus:border-indigo-500 focus:ring-indigo-500/20',
        ],
        filled: [
          'border-transparent bg-gray-100',
          'focus:border-indigo-500 focus:ring-indigo-500/20 focus:bg-white',
        ],
        error: [
          'border-red-500',
          'focus:border-red-500 focus:ring-red-500/20',
        ],
        success: [
          'border-emerald-500',
          'focus:border-emerald-500 focus:ring-emerald-500/20',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Avatar Variants
// ─────────────────────────────────────────────────────────────────────────────

export const avatarVariants = cva(
  // Base styles
  [
    'relative inline-flex items-center justify-center',
    'rounded-full flex-shrink-0',
    'font-medium',
  ],
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-14 h-14 text-xl',
        xl: 'w-20 h-20 text-2xl',
      },
      status: {
        online: 'ring-2 ring-offset-2 ring-emerald-500',
        offline: 'ring-2 ring-offset-2 ring-gray-300',
        busy: 'ring-2 ring-offset-2 ring-red-500',
        away: 'ring-2 ring-offset-2 ring-amber-500',
        active: 'ring-2 ring-offset-2 ring-indigo-500',
        none: '',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'none',
    },
  }
);

export type AvatarVariants = VariantProps<typeof avatarVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Alert Variants
// ─────────────────────────────────────────────────────────────────────────────

export const alertVariants = cva(
  // Base styles
  [
    'relative flex items-start gap-3',
    'rounded-lg p-4',
    'border',
  ],
  {
    variants: {
      variant: {
        default: 'bg-gray-50 border-gray-200 text-gray-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        error: 'bg-red-50 border-red-200 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type AlertVariants = VariantProps<typeof alertVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Chat Bubble Variants
// ─────────────────────────────────────────────────────────────────────────────

export const chatBubbleVariants = cva(
  // Base styles
  [
    'px-4 py-3',
    'text-sm',
  ],
  {
    variants: {
      variant: {
        user: [
          'bg-indigo-600 text-white',
          'rounded-2xl rounded-br-sm',
        ],
        agent: [
          'bg-white text-gray-700 border border-gray-200',
          'rounded-2xl rounded-tl-sm',
          'shadow-sm',
        ],
        system: [
          'bg-gray-100 text-gray-600',
          'rounded-full px-4 py-2 text-xs',
        ],
      },
      maxWidth: {
        sm: 'max-w-[50%]',
        md: 'max-w-[70%]',
        lg: 'max-w-[85%]',
        full: 'max-w-full',
      },
    },
    defaultVariants: {
      variant: 'agent',
      maxWidth: 'md',
    },
  }
);

export type ChatBubbleVariants = VariantProps<typeof chatBubbleVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Rich Card Variants (for chat cards)
// ─────────────────────────────────────────────────────────────────────────────

export const richCardVariants = cva(
  // Base styles
  [
    'rounded-xl overflow-hidden',
    'border',
    'transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white',
        success: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50',
        warning: 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50',
        error: 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50',
        info: 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50',
        transfer: 'border-indigo-200 bg-white',
        fraud: 'border-red-200 bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type RichCardVariants = VariantProps<typeof richCardVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Item Variants
// ─────────────────────────────────────────────────────────────────────────────

export const navItemVariants = cva(
  // Base styles
  [
    'flex items-center gap-3',
    'px-3 py-2.5',
    'text-sm font-medium',
    'rounded-lg',
    'transition-colors duration-150',
  ],
  {
    variants: {
      variant: {
        default: [
          'text-gray-600',
          'hover:bg-gray-100 hover:text-gray-900',
        ],
        active: [
          'bg-indigo-50 text-indigo-700',
        ],
        muted: [
          'text-gray-400',
          'hover:text-gray-600',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type NavItemVariants = VariantProps<typeof navItemVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Account Card Gradient Variants
// ─────────────────────────────────────────────────────────────────────────────

export const accountGradientVariants = cva(
  // Base styles
  [
    'p-2.5 rounded-lg',
  ],
  {
    variants: {
      type: {
        checking: 'bg-gradient-to-br from-blue-500 to-blue-600',
        savings: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        credit: 'bg-gradient-to-br from-purple-500 to-purple-600',
        investment: 'bg-gradient-to-br from-amber-500 to-amber-600',
      },
    },
    defaultVariants: {
      type: 'checking',
    },
  }
);

export type AccountGradientVariants = VariantProps<typeof accountGradientVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Status Indicator Variants
// ─────────────────────────────────────────────────────────────────────────────

export const statusIndicatorVariants = cva(
  // Base styles
  [
    'rounded-full',
  ],
  {
    variants: {
      status: {
        online: 'bg-emerald-500',
        offline: 'bg-gray-300',
        busy: 'bg-red-500',
        away: 'bg-amber-500',
        processing: 'bg-indigo-500 animate-pulse',
      },
      size: {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
      },
    },
    defaultVariants: {
      status: 'online',
      size: 'md',
    },
  }
);

export type StatusIndicatorVariants = VariantProps<typeof statusIndicatorVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Variants
// ─────────────────────────────────────────────────────────────────────────────

export const skeletonVariants = cva(
  // Base styles
  [
    'animate-pulse bg-gray-200 rounded',
  ],
  {
    variants: {
      variant: {
        text: 'h-4 rounded',
        title: 'h-6 rounded',
        avatar: 'rounded-full',
        button: 'h-10 rounded-lg',
        card: 'rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Divider Variants
// ─────────────────────────────────────────────────────────────────────────────

export const dividerVariants = cva(
  // Base styles
  [
    'border-0',
  ],
  {
    variants: {
      orientation: {
        horizontal: 'w-full h-px',
        vertical: 'h-full w-px',
      },
      variant: {
        solid: 'bg-gray-200',
        dashed: 'bg-gray-200 [background-image:repeating-linear-gradient(90deg,currentColor,currentColor_4px,transparent_4px,transparent_8px)]',
        dotted: 'bg-gray-200',
      },
      spacing: {
        none: '',
        sm: 'my-2',
        md: 'my-4',
        lg: 'my-6',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'solid',
      spacing: 'md',
    },
  }
);

export type DividerVariants = VariantProps<typeof dividerVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// Focus Ring Utility
// ─────────────────────────────────────────────────────────────────────────────

export const focusRing = [
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-indigo-500',
  'focus-visible:ring-offset-2',
].join(' ');

// ─────────────────────────────────────────────────────────────────────────────
// Disabled Utility
// ─────────────────────────────────────────────────────────────────────────────

export const disabledStyles = [
  'disabled:pointer-events-none',
  'disabled:opacity-50',
  'disabled:cursor-not-allowed',
].join(' ');

// ─────────────────────────────────────────────────────────────────────────────
// Export Index File Helper
// ─────────────────────────────────────────────────────────────────────────────

export const variants = {
  button: buttonVariants,
  card: cardVariants,
  badge: badgeVariants,
  input: inputVariants,
  avatar: avatarVariants,
  alert: alertVariants,
  chatBubble: chatBubbleVariants,
  richCard: richCardVariants,
  navItem: navItemVariants,
  accountGradient: accountGradientVariants,
  statusIndicator: statusIndicatorVariants,
  skeleton: skeletonVariants,
  divider: dividerVariants,
} as const;
