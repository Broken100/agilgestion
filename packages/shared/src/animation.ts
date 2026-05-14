import type { Variants } from "motion"

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export const slideInUp: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export const slideInDown: Variants = {
  hidden: { y: "-100%" },
  visible: { y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export const slideInLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export const slideInRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

export const counterAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: { scale: 1, transition: { repeat: Infinity, duration: 2 } },
  pulse: { scale: [1, 1.05, 1], transition: { duration: 0.5 } },
}

export const shimmer: Variants = {
  hidden: { opacity: 0.5 },
  visible: { opacity: [0.5, 1, 0.5], transition: { repeat: Infinity, duration: 1.5 } },
}

export const rotate: Variants = {
  hidden: { rotate: 0 },
  visible: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: "linear" } },
}

export const hoverLift: Variants = {
  rest: { y: 0, transition: { duration: 0.2 } },
  hover: { y: -4, transition: { duration: 0.2 } },
}

export const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
}

export const scaleOnTap: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
}

export const bounceIcon: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 10 } },
}

export const layoutIndicator: Variants = {
  initial: { x: "var(--from)", opacity: 0 },
  animate: { x: "var(--to)", opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
}

export const cartItemAdd: Variants = {
  hidden: { opacity: 0, height: 0, margin: 0, padding: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    margin: "inherit",
    padding: "inherit",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    margin: 0,
    padding: 0,
    transition: { duration: 0.2 },
  },
}

export const successCelebration: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
}