"use client";

import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import { type ReactNode } from "react";

// Emil/Linear-style spring config - smooth and responsive
const smoothSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// Fade up animation variants
const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothSpring,
  },
};

// Stagger container variants
const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Slide variants for directional transitions
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: smoothSpring,
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      x: smoothSpring,
      opacity: { duration: 0.15 },
    },
  }),
};

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Single element fade-up animation
 * Respects prefers-reduced-motion by disabling transform animations
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: prefersReducedMotion
            ? { duration: 0.01 }
            : { ...smoothSpring, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Container that staggers children animations
 */
export function StaggerContainer({
  children,
  className,
  delay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

// Reduced motion variants - opacity only, no transforms
const fadeUpVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

/**
 * Child item for StaggerContainer - fades up
 * Respects prefers-reduced-motion by disabling transform animations
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? fadeUpVariantsReduced : fadeUpVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  id: string | number;
  direction: number; // positive = forward, negative = back
  className?: string;
}

// Reduced motion slide variants - opacity only
const slideVariantsReduced: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

/**
 * Directional slide transition wrapper
 * Use with AnimatePresence for step transitions
 * Respects prefers-reduced-motion by disabling transform animations
 */
export function SlideTransition({
  children,
  id,
  direction,
  className,
}: SlideTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={id}
        custom={direction}
        variants={prefersReducedMotion ? slideVariantsReduced : slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Wrapper component for AnimatePresence - use around SlideContent
 */
export function SlideContainer({
  children,
  direction,
}: {
  children: ReactNode;
  direction: number;
}) {
  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      {children}
    </AnimatePresence>
  );
}

interface SlideContentProps {
  children: ReactNode;
  id: string | number;
  direction: number;
  className?: string;
}

/**
 * Content that slides in/out - use inside SlideContainer
 * Respects prefers-reduced-motion by disabling transform animations
 */
export function SlideContent({
  children,
  id,
  direction,
  className,
}: SlideContentProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={id}
      custom={direction}
      variants={prefersReducedMotion ? slideVariantsReduced : slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation for success elements
const scaleInSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Scale-in animation for success icons and badges
 * Respects prefers-reduced-motion
 */
export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ scale: prefersReducedMotion ? 1 : 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.01 }
          : { ...scaleInSpring, delay }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCheckmarkProps {
  size?: number;
  className?: string;
}

/**
 * Animated checkmark with scale-in circle and stroke draw
 * Respects prefers-reduced-motion
 */
export function AnimatedCheckmark({ size = 64, className }: AnimatedCheckmarkProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ scale: prefersReducedMotion ? 1 : 0 }}
      animate={{ scale: 1 }}
      transition={prefersReducedMotion ? { duration: 0.01 } : scaleInSpring}
      className={className}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle background */}
        <circle cx="32" cy="32" r="32" className="fill-primary" />
        {/* Checkmark path with stroke animation */}
        <motion.path
          d="M20 32L28 40L44 24"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : { duration: 0.3, ease: "easeOut", delay: 0.2 }
          }
        />
      </svg>
    </motion.div>
  );
}

// Export variants for custom use
export { fadeUpVariants, staggerContainerVariants, slideVariants, smoothSpring, scaleInSpring };



