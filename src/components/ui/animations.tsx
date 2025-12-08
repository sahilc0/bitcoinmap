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
            staggerChildren: 0.1,
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

// Export variants for custom use
export { fadeUpVariants, staggerContainerVariants, slideVariants, smoothSpring };



