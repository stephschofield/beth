'use client';

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence, type Variants, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardVariants, type CardVariants } from '@/lib/design-system/variants';
import {
  cardMotionVariants,
  fadeUpVariants,
  transitions,
} from '@/lib/design-system/animations';

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface CardContextValue {
  variant: CardVariants['variant'];
}

const CardContext = createContext<CardContextValue | null>(null);

const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('Card compound components must be used within a Card');
  }
  return context;
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'children' | 'variants'>,
    CardVariants {
  /** Card content */
  children: ReactNode;
  /** Enables hover animation */
  hoverable?: boolean;
  /** Enables entrance animation */
  animate?: boolean;
  /** Custom animation variants */
  motionVariants?: Variants;
  /** Additional class names */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Card Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Card container with multiple variants and optional animations.
 * Supports compound components for structured layouts.
 * 
 * @example
 * ```tsx
 * // Simple card
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Account Overview</CardTitle>
 *     <CardDescription>Your financial summary</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Balance: $12,345.00</p>
 *   </CardContent>
 * </Card>
 * 
 * // Interactive card with hover animation
 * <Card variant="interactive" hoverable>
 *   <CardContent>Click me!</CardContent>
 * </Card>
 * 
 * // Gradient card
 * <Card variant="gradient" className="from-indigo-500 to-purple-600 text-white">
 *   <CardContent>Premium Feature</CardContent>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'none', // Default to none so compound components control padding
      hoverable = false,
      animate = false,
      motionVariants,
      className,
      ...props
    },
    ref
  ) => {
    const contextValue: CardContextValue = { variant };
    const variants = motionVariants ?? cardMotionVariants;

    return (
      <CardContext.Provider value={contextValue}>
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, padding }), className)}
          initial={animate ? 'hidden' : undefined}
          animate={animate ? 'visible' : undefined}
          whileHover={hoverable ? 'hover' : undefined}
          variants={animate || hoverable ? variants : undefined}
          transition={animate || hoverable ? transitions.spring : undefined}
          {...props}
        >
          {children}
        </motion.div>
      </CardContext.Provider>
    );
  }
);

Card.displayName = 'Card';

// ─────────────────────────────────────────────────────────────────────────────
// Card Header
// ─────────────────────────────────────────────────────────────────────────────

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Show bottom border */
  bordered?: boolean;
  className?: string;
}

/**
 * Card header section with optional border.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, bordered = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5 p-6',
          bordered && 'border-b border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ─────────────────────────────────────────────────────────────────────────────
// Card Title
// ─────────────────────────────────────────────────────────────────────────────

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  /** Heading level for accessibility */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}

/**
 * Card title with proper heading semantics.
 */
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, as: Component = 'h3', className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-lg font-semibold leading-none tracking-tight text-gray-900',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// ─────────────────────────────────────────────────────────────────────────────
// Card Description
// ─────────────────────────────────────────────────────────────────────────────

export interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Card description/subtitle text.
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ children, className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

// ─────────────────────────────────────────────────────────────────────────────
// Card Content
// ─────────────────────────────────────────────────────────────────────────────

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Main card content area.
 */
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// ─────────────────────────────────────────────────────────────────────────────
// Card Footer
// ─────────────────────────────────────────────────────────────────────────────

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Show top border */
  bordered?: boolean;
  className?: string;
}

/**
 * Card footer section, typically for actions.
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, bordered = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center p-6 pt-0',
          bordered && 'border-t border-gray-200 pt-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ─────────────────────────────────────────────────────────────────────────────
// Gradient Card Header
// ─────────────────────────────────────────────────────────────────────────────

export interface GradientCardHeaderProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Gradient preset */
  gradient?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'dark';
  className?: string;
}

const gradientPresets = {
  primary: 'from-indigo-500 to-purple-600',
  secondary: 'from-purple-500 to-pink-500',
  success: 'from-emerald-500 to-teal-500',
  warning: 'from-amber-500 to-orange-500',
  error: 'from-red-500 to-rose-500',
  dark: 'from-slate-900 to-slate-800',
};

/**
 * Card header with gradient background, useful for rich cards.
 */
export const GradientCardHeader = forwardRef<
  HTMLDivElement,
  GradientCardHeaderProps
>(({ children, gradient = 'primary', className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-gradient-to-r px-6 py-4 text-white',
        gradientPresets[gradient],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

GradientCardHeader.displayName = 'GradientCardHeader';

// ─────────────────────────────────────────────────────────────────────────────
// Animated Card List
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimatedCardListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper for animating a list of cards with stagger effect.
 * 
 * @example
 * ```tsx
 * <AnimatedCardList>
 *   {accounts.map((account) => (
 *     <Card key={account.id} animate>
 *       ...
 *     </Card>
 *   ))}
 * </AnimatedCardList>
 * ```
 */
export function AnimatedCardList({ children, className }: AnimatedCardListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
          },
        },
      }}
    >
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { cardVariants };
export type { CardVariants };
