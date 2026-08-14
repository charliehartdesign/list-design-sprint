/**
 * Tweak motion here first — components read from these tokens.
 * Focused step is crisp; neighbors stay readable but “background.”
 */
export const motionTokens = {
  duration: {
    fast: 0.2,
    base: 0.45,
    slow: 0.55,
  },
  ease: {
    soft: [0.22, 1, 0.36, 1],
    exit: [0.4, 0, 0.2, 1],
    standard: [0.2, 0, 0, 1],
  },
  // Focused question vs obscured neighbor (still clearly suggested)
  question: {
    focused: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    peeking: { opacity: 0.34, y: 0, scale: 0.992, filter: 'blur(1.25px)' },
  },
  section: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  stagger: 0,
}
