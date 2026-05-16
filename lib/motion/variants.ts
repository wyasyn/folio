export const motionEase = [0.22, 1, 0.36, 1] as const

export const fadeUpTransition = {
  duration: 0.65,
  ease: motionEase,
} as const

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: fadeUpTransition,
  },
}

export function createStaggerContainer(baseDelay = 0.08, stagger = 0.12) {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: baseDelay,
        staggerChildren: stagger,
      },
    },
  }
}

export const defaultInViewViewport = { once: true, amount: 0.2 } as const
