import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../motion/tokens'
import { scrollToQuestion } from './QuestionNav'
import './QuestionStep.css'

/** True when this question is the focused/active step in Focus mode. */
export const QuestionFocusContext = createContext(false)

export function useQuestionFocused() {
  return useContext(QuestionFocusContext)
}

export function QuestionStep({
  id,
  nextId,
  prevId,
  className = '',
  children,
  onFocusChange,
  density = 'expanded',
}) {
  const ref = useRef(null)
  const sentinelRef = useRef(null)
  const isFirst = !prevId
  const [focused, setFocused] = useState(isFirst)
  const { duration, ease, question } = motionTokens
  const contracted = density === 'contracted'

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (contracted) {
      // All steps fully visible; still track the active section for the side nav
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            onFocusChange?.(id, true)
          }
        },
        { threshold: [0.25, 0.45, 0.6] },
      )
      observer.observe(node)
      return () => observer.disconnect()
    }

    // First question starts focused — never leave it peeking at page top
    if (isFirst) {
      setFocused(true)
      onFocusChange?.(id, true)
    }

    /*
     * Observe a 1px sentinel at the step’s top (not the whole tall section).
     * A short strip under the chrome is the “active line”. Ratio checks on
     * #about were failing and leaving the first title in peeking opacity
     * (~0.34 + blur), which looked like a white wash over the heading.
     */
    const styles = getComputedStyle(document.documentElement)
    const chromeTop =
      Number.parseFloat(styles.getPropertyValue('--chrome-top')) || 96
    const peek =
      Number.parseFloat(styles.getPropertyValue('--neighbor-peek')) || 132
    // Cover both natural page-top (sentinel ~chromeTop) and snap align
    // (sentinel ~chromeTop + peek from scroll-padding-top).
    const band = peek + 48
    const bottomCut = Math.max(0, window.innerHeight - chromeTop - band)
    const target = sentinelRef.current ?? node

    const applyFocus = (next) => {
      // Hard lock: first step stays fully opaque while the page is at the top
      if (isFirst && window.scrollY <= 8) {
        setFocused(true)
        onFocusChange?.(id, true)
        return
      }
      setFocused(next)
      onFocusChange?.(id, next)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        applyFocus(entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: `-${chromeTop}px 0px -${bottomCut}px 0px`,
      },
    )

    observer.observe(target)

    const onScroll = () => {
      if (isFirst && window.scrollY <= 8) {
        setFocused(true)
        onFocusChange?.(id, true)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [id, onFocusChange, contracted, isFirst])

  useEffect(() => {
    if (!focused || contracted) return undefined

    const isTypingTarget = (target) => {
      const tag = target?.tagName
      return tag === 'TEXTAREA' || tag === 'INPUT' || target?.isContentEditable
    }

    const onKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        // Don’t advance while typing in a field (tags, materials, price, etc.)
        if (isTypingTarget(event.target)) return
        if (event.target?.tagName === 'BUTTON') return
        if (!nextId) return
        event.preventDefault()
        scrollToQuestion(nextId)
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (isTypingTarget(event.target)) return
        const targetId = event.key === 'ArrowDown' ? nextId : prevId
        if (!targetId) return
        event.preventDefault()
        scrollToQuestion(targetId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focused, nextId, prevId, contracted])

  const activate = () => {
    if (focused || contracted) return
    scrollToQuestion(id)
  }

  const stepActive = focused || contracted

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`question-step${stepActive ? ' question-step--focused' : ''}${contracted ? ' question-step--contracted' : ''} ${className}`.trim()}
      initial={false}
      animate={stepActive ? question.focused : question.peeking}
      transition={{ duration: duration.slow, ease: ease.soft }}
      onClick={activate}
      aria-current={stepActive ? 'step' : undefined}
    >
      <div ref={sentinelRef} className="question-step__sentinel" aria-hidden="true" />
      <QuestionFocusContext.Provider value={stepActive}>
        <div className="question-step__inner">{children}</div>
      </QuestionFocusContext.Provider>
    </motion.section>
  )
}
