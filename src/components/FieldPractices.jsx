import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './Icon'
import check from '../assets/icons/check.svg'
import scoreClose from '../assets/icons/score-close.svg'
import { motionTokens } from '../motion/tokens'
import './FieldPractices.css'

/**
 * Right-rail Best practices — staggers in with a brief “thinking” beat
 * before resolving each row to check / incomplete.
 *
 * Animation runs when `active` becomes true (or `evaluateKey` changes).
 * Subsequent `items` updates swap icons without restarting the sequence.
 */
export function FieldPractices({
  heading = 'Best practices',
  items = [],
  active = false,
  evaluateKey,
  className = '',
  style,
}) {
  const { duration, ease } = motionTokens
  const [revealed, setRevealed] = useState(0)
  const [resolved, setResolved] = useState(0)
  const timers = useRef([])
  const wasActive = useRef(false)
  const prevKey = useRef(evaluateKey)
  const itemCount = items.length

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []

    const justActivated = active && !wasActive.current
    const keyChanged =
      evaluateKey !== undefined && evaluateKey !== prevKey.current
    wasActive.current = active
    prevKey.current = evaluateKey

    if (!active || !itemCount) {
      setRevealed(0)
      setResolved(0)
      return undefined
    }

    const shouldReplay = justActivated || keyChanged

    if (!shouldReplay) {
      setRevealed((n) => (n > 0 ? itemCount : n))
      setResolved((n) => (n > 0 ? itemCount : n))
      return undefined
    }

    setRevealed(0)
    setResolved(0)

    for (let index = 0; index < itemCount; index += 1) {
      const revealAt = 280 + index * 520
      const resolveAt = revealAt + 380
      timers.current.push(
        setTimeout(() => setRevealed((n) => Math.max(n, index + 1)), revealAt),
      )
      timers.current.push(
        setTimeout(() => setResolved((n) => Math.max(n, index + 1)), resolveAt),
      )
    }

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [active, itemCount, evaluateKey])

  return (
    <AnimatePresence>
      {active ? (
        <motion.aside
          className={`field-practices ${className}`.trim()}
          style={style}
          aria-label={heading}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: duration.base, ease: ease.soft }}
        >
          <motion.p
            className="field-practices__heading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: duration.fast, delay: 0.12 }}
          >
            {heading}
          </motion.p>
          <ul className="field-practices__list">
            {items.map((item, index) => {
              const show = index < revealed
              const doneResolving = index < resolved
              return (
                <li key={item.id} className="field-practices__row-slot">
                  <AnimatePresence>
                    {show ? (
                      <motion.div
                        className={`field-practices__row${doneResolving ? '' : ' field-practices__row--thinking'}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: duration.fast, ease: ease.soft }}
                      >
                        {doneResolving ? (
                          <Icon
                            src={item.done ? check : scoreClose}
                            size={16}
                            alt={item.done ? 'Complete' : 'Incomplete'}
                          />
                        ) : (
                          <span className="field-practices__pulse" aria-hidden="true" />
                        )}
                        <span>{item.label}</span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
