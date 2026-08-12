import { Icon } from './Icon'
import chevron from '../assets/icons/chevron.svg'
import './QuestionNav.css'

export function scrollToQuestion(id) {
  if (!id) return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Up/down question navigation — sits in the footer beside Publish. */
export function QuestionNav({ stepIds, activeId, onNavigate }) {
  const index = Math.max(0, stepIds.indexOf(activeId))
  const canUp = index > 0
  const canDown = index < stepIds.length - 1 && index >= 0

  const go = (delta) => {
    const next = stepIds[index + delta]
    if (!next) return
    onNavigate?.(next)
    scrollToQuestion(next)
  }

  return (
    <div className="question-nav" role="navigation" aria-label="Question navigation">
      <span className="question-nav__progress" aria-live="polite">
        {index + 1} / {stepIds.length}
      </span>
      <div className="question-nav__controls">
        <button
          type="button"
          className="question-nav__btn question-nav__btn--up"
          aria-label="Previous question"
          disabled={!canUp}
          onClick={() => go(-1)}
        >
          <Icon src={chevron} size={16} />
        </button>
        <button
          type="button"
          className="question-nav__btn question-nav__btn--down"
          aria-label="Next question"
          disabled={!canDown}
          onClick={() => go(1)}
        >
          <Icon src={chevron} size={16} />
        </button>
      </div>
    </div>
  )
}
