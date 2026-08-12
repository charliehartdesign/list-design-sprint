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
  const [focused, setFocused] = useState(false)
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

    const peek = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--neighbor-peek'),
    ) || 132
    const inset = Math.round(peek * 0.55)

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting && entry.intersectionRatio >= 0.4
        setFocused(next)
        onFocusChange?.(id, next)
      },
      {
        threshold: [0.2, 0.4, 0.6, 0.8],
        rootMargin: `-${inset}px 0px -${inset}px 0px`,
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [id, onFocusChange, contracted])

  useEffect(() => {
    if (!focused || contracted) return undefined

    const isTypingTarget = (target) => {
      const tag = target?.tagName
      return tag === 'TEXTAREA' || tag === 'INPUT' || target?.isContentEditable
    }

    const onKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        if (event.target?.tagName === 'TEXTAREA') return
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
      <QuestionFocusContext.Provider value={stepActive}>
        <div className="question-step__inner">{children}</div>
      </QuestionFocusContext.Provider>
    </motion.section>
  )
}
