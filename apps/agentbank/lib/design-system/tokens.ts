/**
 * Design System Tokens
 * 
 * Centralized design tokens for AgentBank's visual language.
 * These tokens ensure consistency across all components.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Color Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Brand Colors
  brand: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Primary indigo
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Secondary purple
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Emerald
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Amber
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Agent Colors (for multi-agent personas)
  agents: {
    maya: { bg: 'bg-indigo-100', text: 'text-indigo-700', accent: '#6366f1' },
    max: { bg: 'bg-emerald-100', text: 'text-emerald-700', accent: '#10b981' },
    sage: { bg: 'bg-purple-100', text: 'text-purple-700', accent: '#a855f7' },
    finn: { bg: 'bg-amber-100', text: 'text-amber-700', accent: '#f59e0b' },
    shield: { bg: 'bg-red-100', text: 'text-red-700', accent: '#ef4444' },
  },

  // Account Type Colors
  accounts: {
    checking: { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600' },
    savings: { gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600' },
    credit: { gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600' },
    investment: { gradient: 'from-amber-500 to-amber-600', text: 'text-amber-600' },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Spacing Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Typography Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'monospace'],
  },

  // Font Sizes with line heights
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },       // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },   // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },      // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },   // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },    // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },     // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },  // 36px
    '5xl': { size: '3rem', lineHeight: '1' },          // 48px
    '6xl': { size: '3.75rem', lineHeight: '1' },       // 60px
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Border Radius Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shadow Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Colored shadows for cards and elevated elements
  primary: '0 4px 14px 0 rgb(99 102 241 / 0.25)',
  success: '0 4px 14px 0 rgb(16 185 129 / 0.25)',
  warning: '0 4px 14px 0 rgb(245 158 11 / 0.25)',
  error: '0 4px 14px 0 rgb(239 68 68 / 0.25)',
  
  // Focus ring shadows
  ring: '0 0 0 2px rgb(99 102 241 / 0.5)',
  ringOffset: '0 0 0 2px #fff, 0 0 0 4px rgb(99 102 241 / 0.5)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Transition Tokens (CSS)
// ─────────────────────────────────────────────────────────────────────────────

export const cssTransitions = {
  // Durations
  duration: {
    fastest: '50ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },

  // Timing Functions
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom timing for smooth UI animations
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    snappy: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Presets
  preset: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color, background-color, border-color, fill, stroke 150ms ease',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms ease',
    shadow: 'box-shadow 200ms ease',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Z-Index Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component Size Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const componentSizes = {
  // Button/Input heights
  height: {
    xs: '1.5rem',   // 24px
    sm: '2rem',     // 32px
    md: '2.5rem',   // 40px
    lg: '3rem',     // 48px
    xl: '3.5rem',   // 56px
  },

  // Avatar/Icon sizes
  avatar: {
    xs: '1.5rem',   // 24px
    sm: '2rem',     // 32px
    md: '2.5rem',   // 40px
    lg: '3.5rem',   // 56px
    xl: '4.5rem',   // 72px
    '2xl': '6rem',  // 96px
  },

  // Touch target minimum (WCAG 2.1)
  touchTarget: '44px',

  // Sidebar width
  sidebar: {
    collapsed: '64px',
    expanded: '256px',
  },

  // Chat input height
  chatInput: {
    min: '48px',
    max: '200px',
  },

  // Card widths
  card: {
    sm: '320px',
    md: '400px',
    lg: '480px',
    xl: '640px',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Breakpoint Tokens
// ─────────────────────────────────────────────────────────────────────────────

export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Composite Token Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** CSS variable map for Tailwind CSS integration */
export const cssVariables = {
  '--radius': borderRadius.lg,
  '--background': '0 0% 100%',
  '--foreground': '222.2 84% 4.9%',
  '--card': '0 0% 100%',
  '--card-foreground': '222.2 84% 4.9%',
  '--primary': '238.7 83.5% 66.7%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '270 95.2% 66.1%',
  '--secondary-foreground': '222.2 47.4% 11.2%',
  '--muted': '210 40% 96.1%',
  '--muted-foreground': '215.4 16.3% 46.9%',
  '--accent': '210 40% 96.1%',
  '--accent-foreground': '222.2 47.4% 11.2%',
  '--destructive': '0 84.2% 60.2%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '214.3 31.8% 91.4%',
  '--input': '214.3 31.8% 91.4%',
  '--ring': '238.7 83.5% 66.7%',
} as const;

// Type exports for TypeScript strict mode
export type ColorScale = keyof typeof colors.brand.primary;
export type SpacingScale = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type BorderRadiusScale = keyof typeof borderRadius;
export type ShadowScale = keyof typeof shadows;
export type ZIndexScale = keyof typeof zIndex;
export type ComponentSizeScale = keyof typeof componentSizes.height;
export type BreakpointScale = keyof typeof breakpoints;
