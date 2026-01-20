'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariants } from '@/lib/design-system/variants';
import { buttonTap, buttonHover, transitions } from '@/lib/design-system/animations';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    ButtonVariants {
  /** Content to render inside the button */
  children: ReactNode;
  /** Optional icon to render before children */
  leftIcon?: ReactNode;
  /** Optional icon to render after children */
  rightIcon?: ReactNode;
  /** Shows loading spinner and disables button */
  loading?: boolean;
  /** Loading text to show (defaults to children) */
  loadingText?: string;
  /** Disables the button */
  disabled?: boolean;
  /** Disables motion animations */
  disableMotion?: boolean;
  /** Additional class names */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Button component with variants, loading states, and Framer Motion animations.
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary">Click me</Button>
 * 
 * // With icons
 * <Button leftIcon={<Send />} variant="gradient">Send Money</Button>
 * 
 * // Loading state
 * <Button loading loadingText="Processing...">Submit</Button>
 * 
 * // Different sizes
 * <Button size="lg" variant="secondary">Large Button</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      size,
      fullWidth,
      leftIcon,
      rightIcon,
      loading = false,
      loadingText,
      disabled = false,
      disableMotion = false,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const isIconOnly = size === 'icon' || size === 'icon-sm' || size === 'icon-lg';

    // Content to render
    const content = (
      <>
        {/* Loading spinner or left icon */}
        {loading ? (
          <Loader2
            className={cn(
              'animate-spin',
              isIconOnly ? 'w-5 h-5' : 'w-4 h-4'
            )}
            aria-hidden="true"
          />
        ) : leftIcon ? (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {/* Button text (hidden when icon-only or loading icon-only) */}
        {!isIconOnly && (
          <span className={loading ? 'ml-0' : ''}>
            {loading && loadingText ? loadingText : children}
          </span>
        )}

        {/* Right icon (hidden when loading) */}
        {rightIcon && !loading && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </>
    );

    // Use regular button if motion is disabled or user prefers reduced motion
    if (disableMotion) {
      return (
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={cn(buttonVariants({ variant, size, fullWidth }), className)}
          aria-busy={loading}
          aria-disabled={isDisabled}
          {...props}
        >
          {content}
        </button>
      );
    }

    // Motion button with animations
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        whileHover={!isDisabled ? buttonHover : undefined}
        whileTap={!isDisabled ? buttonTap : undefined}
        transition={transitions.spring}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// ─────────────────────────────────────────────────────────────────────────────
// Icon Button Variant
// ─────────────────────────────────────────────────────────────────────────────

export interface IconButtonProps
  extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children' | 'size'> {
  /** Icon to render */
  icon: ReactNode;
  /** Accessible label for screen readers */
  'aria-label': string;
  /** Size variant */
  size?: 'icon' | 'icon-sm' | 'icon-lg';
}

/**
 * Icon-only button with proper accessibility.
 * 
 * @example
 * ```tsx
 * <IconButton
 *   icon={<Settings />}
 *   aria-label="Open settings"
 *   variant="ghost"
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn('rounded-full', className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// ─────────────────────────────────────────────────────────────────────────────
// Button Group
// ─────────────────────────────────────────────────────────────────────────────

export interface ButtonGroupProps {
  /** Button elements */
  children: ReactNode;
  /** Orientation of the group */
  orientation?: 'horizontal' | 'vertical';
  /** Additional class names */
  className?: string;
}

/**
 * Group multiple buttons together with connected styling.
 * 
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="secondary">Left</Button>
 *   <Button variant="secondary">Center</Button>
 *   <Button variant="secondary">Right</Button>
 * </ButtonGroup>
 * ```
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  className,
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex',
        orientation === 'horizontal'
          ? '[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:-ml-px'
          : 'flex-col [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:-mt-px',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { buttonVariants };
export type { ButtonVariants };
