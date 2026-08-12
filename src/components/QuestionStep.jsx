import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../motion/tokens'
import { scrollToQuestion } from './QuestionNav'
import './QuestionStep.css'

export function QuestionStep({
  id,
  nextId,
  prevId,
  className = '',
  children,
  onFocusChange,
}) {
  const ref = useRef(null)
  const [focused, setFocused] = useState(false)
  const { duration, ease, question } = motionTokens

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

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
  }, [id, onFocusChange])

  useEffect(() => {
    if (!focused) return undefined

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
  }, [focused, nextId, prevId])

  const activate = () => {
    if (focused) return
    scrollToQuestion(id)
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`question-step${focused ? ' question-step--focused' : ''} ${className}`.trim()}
      initial={question.peeking}
      animate={focused ? question.focused : question.peeking}
      transition={{ duration: duration.slow, ease: ease.soft }}
      onClick={activate}
      aria-current={focused ? 'step' : undefined}
    >
      <div className="question-step__inner">{children}</div>
    </motion.section>
  )
}
