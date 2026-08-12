import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './AiOrangeSquare.css'

/**
 * AI Design Language `Ai-Loader-Entry` (60fps):
 * scale up → bounce → un-tilt from −90° into the resting orange square.
 * Replays whenever the mark re-enters the viewport.
 */
export function AiOrangeSquare({
  size = 12.5,
  className = '',
  'aria-hidden': ariaHidden = true,
}) {
  const rootRef = useRef(null)
  const [playKey, setPlayKey] = useState(0)
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const node = rootRef.current
    if (!node) return undefined

    let wasVisible = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting && entry.intersectionRatio >= 0.4
        if (next && !wasVisible) {
          setVisible(true)
          setPlayKey((k) => k + 1)
        } else if (!next && wasVisible) {
          setVisible(false)
        }
        wasVisible = next
      },
      { threshold: [0, 0.4, 0.75] },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Artboard bounce (−60px) relative to the 150px Lottie square
  const bounce = -0.4 * size

  return (
    <span
      ref={rootRef}
      className={`ai-orange-square ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden={ariaHidden}
    >
      {visible ? (
        <motion.span
          key={playKey}
          className="ai-orange-square__mark"
          style={{ width: size, height: size }}
          initial={
            reducedMotion
              ? { scale: 1, y: 0, rotate: 0 }
              : { scale: 0, y: 0, rotate: -90 }
          }
          animate={
            reducedMotion
              ? { scale: 1, y: 0, rotate: 0 }
              : { scale: 1, y: [0, bounce, 0], rotate: 0 }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  scale: {
                    duration: 10 / 60,
                    ease: [0.167, 0.167, 0.217, 1],
                  },
                  y: {
                    duration: 20 / 60,
                    times: [0, 5.217 / 20, 1],
                    ease: [
                      [0.333, 0, 0.667, 1],
                      [0.33, 0, 0.217, 1],
                    ],
                  },
                  rotate: {
                    duration: 21 / 60,
                    delay: 10 / 60,
                    ease: [0.597, 0, 0.103, 1],
                  },
                }
          }
        />
      ) : null}
    </span>
  )
}
