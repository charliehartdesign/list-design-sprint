import { useEffect, useState } from 'react'
import { ListingForm, QUESTION_STEPS } from './components/ListingForm'
import { QuestionNav } from './components/QuestionNav'
import { Button } from './components/Button'
import { Icon } from './components/Icon'
import { scrollToQuestion } from './components/QuestionNav'
import etsy from './assets/icons/etsy.svg'
import contractIcon from './assets/icons/contract.svg'
import expandIcon from './assets/icons/expand.svg'
import closeIcon from './assets/icons/close-nav.svg'
import './App.css'
import './components/ui.css'

/** @typedef {'expanded' | 'contracted'} DensityMode */

const SECTION_TO_QUESTION = {
  about: 'about',
  pricing: 'pricing',
  options: 'options',
  discoverability: 'discoverability',
  shipping: 'shipping',
  settings: 'settings',
}

export default function App() {
  const [activeNav, setActiveNav] = useState('about')
  const [activeQuestion, setActiveQuestion] = useState(QUESTION_STEPS[0])
  const [previewLocked, setPreviewLocked] = useState(false)
  /** Default launch: expanded (Typeform / zoomed-in) */
  const [density, setDensity] = useState(/** @type {DensityMode} */ ('expanded'))
  const contracted = density === 'contracted'

  useEffect(() => {
    const root = document.documentElement
    root.dataset.density = density
    return () => {
      delete root.dataset.density
    }
  }, [density])

  const toggleDensity = () => {
    setDensity((prev) => (prev === 'expanded' ? 'contracted' : 'expanded'))
  }

  const handleRequestExpand = (sectionId) => {
    const questionId = SECTION_TO_QUESTION[sectionId] ?? sectionId
    setDensity('expanded')
    // Wait a tick for Typeform layout to mount, then scroll
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollToQuestion(questionId)
        setActiveQuestion(questionId)
        onNavFromSection(questionId)
      }, 50)
    })
  }

  const onNavFromSection = (questionId) => {
    if (['about', 'category', 'description', 'title'].includes(questionId)) {
      setActiveNav('about')
    } else if (['pricing', 'options', 'quantity'].includes(questionId)) {
      setActiveNav('pricing')
    } else if (questionId === 'discoverability') {
      setActiveNav('discoverability')
    } else if (questionId === 'shipping') {
      setActiveNav('shipping')
    } else if (questionId === 'settings') {
      setActiveNav('settings')
    }
  }

  const stepIndex = Math.max(0, QUESTION_STEPS.indexOf(activeQuestion))
  const isLastStep = stepIndex >= QUESTION_STEPS.length - 1
  const canPublish = contracted || isLastStep

  const goToQuestion = (questionId) => {
    if (!questionId) return
    scrollToQuestion(questionId)
    setActiveQuestion(questionId)
    onNavFromSection(questionId)
  }

  const handlePrimaryAction = () => {
    if (canPublish) return
    const nextId = QUESTION_STEPS[stepIndex + 1]
    goToQuestion(nextId)
  }

  return (
    <div className={`app${contracted ? ' app--contracted' : ' app--expanded'}`}>
      <header className="top-bar">
        <a className="top-bar__logo" href="/" aria-label="Etsy">
          <Icon src={etsy} size={48} alt="Etsy" />
        </a>

        <div className="top-bar__actions">
          <button
            type="button"
            className="top-bar__density"
            aria-label={contracted ? 'Expand form view' : 'Contract form view'}
            aria-pressed={contracted}
            title={contracted ? 'Expand' : 'Contract'}
            onClick={toggleDensity}
          >
            <Icon src={contracted ? expandIcon : contractIcon} size={20} />
          </button>
          <button
            type="button"
            className="top-bar__close"
            aria-label="Save and exit"
            title="Save and exit"
          >
            <Icon src={closeIcon} size={20} />
          </button>
        </div>
      </header>

      <main className="app__main">
        <ListingForm
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onActiveQuestionChange={setActiveQuestion}
          onPreviewChange={setPreviewLocked}
          density={density}
          onRequestExpand={handleRequestExpand}
        />
      </main>

      {!contracted && stepIndex > 0 ? (
        <div className="question-veil question-veil--top" aria-hidden="true" />
      ) : null}
      {!contracted ? (
        <div className="question-veil question-veil--bottom" aria-hidden="true" />
      ) : null}

      <footer className={`bottom-bar${contracted ? ' bottom-bar--review' : ''}`}>
        <p
          className={`bottom-bar__score${previewLocked || contracted ? ' bottom-bar__score--visible' : ''}`}
          aria-hidden={!(previewLocked || contracted)}
        >
          Your listing score: <span>Great</span>
        </p>
        <div className="bottom-bar__actions">
          {!contracted ? (
            <QuestionNav
              stepIds={QUESTION_STEPS}
              activeId={activeQuestion}
              onNavigate={goToQuestion}
            />
          ) : null}
          <Button variant="primary" size="base" onClick={handlePrimaryAction}>
            {canPublish ? 'Publish listing' : 'Next'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
