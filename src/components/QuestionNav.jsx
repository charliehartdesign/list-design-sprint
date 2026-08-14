import { Icon } from './Icon'
import chevron from '../assets/icons/chevron.svg'
import './QuestionNav.css'

export function scrollToQuestion(id) {
  if (!id) return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Bottom-bar navigation — Figma node 877:40304.
 * Shows an up-arrow icon button (back) + a dark pill with the next section
 * name and a down arrow (forward / publish).
 */
export function QuestionNav({ stepIds, stepLabels = {}, activeId, onNavigate, onPublish }) {
  const index = Math.max(0, stepIds.indexOf(activeId))
  const isFirst = index === 0
  const isLast = index >= stepIds.length - 1

  const goBack = () => {
    const prev = stepIds[index - 1]
    if (!prev) return
    onNavigate?.(prev)
    scrollToQuestion(prev)
  }

  const goForward = () => {
    if (isLast) {
      onPublish?.()
      return
    }
    const next = stepIds[index + 1]
    onNavigate?.(next)
    scrollToQuestion(next)
  }

  const nextId = stepIds[index + 1]
  const nextLabel = isLast ? 'Publish listing' : (stepLabels[nextId] ?? nextId)

  return (
    <div className="question-nav" role="navigation" aria-label="Section navigation">
      <button
        type="button"
        className="question-nav__up"
        aria-label="Previous section"
        disabled={isFirst}
        onClick={goBack}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        type="button"
        className={`question-nav__next${isLast ? ' question-nav__next--publish' : ''}`}
        onClick={goForward}
      >
        <span>{nextLabel}</span>
        <Icon src={chevron} size={16} />
      </button>
    </div>
  )
}
