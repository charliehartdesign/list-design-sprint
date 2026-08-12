import { useState } from 'react'
import { ListingForm, QUESTION_STEPS } from './components/ListingForm'
import { QuestionNav } from './components/QuestionNav'
import { Button } from './components/Button'
import { Icon } from './components/Icon'
import etsy from './assets/icons/etsy.svg'
import './App.css'
import './components/ui.css'

export default function App() {
  const [activeNav, setActiveNav] = useState('about')
  const [activeQuestion, setActiveQuestion] = useState(QUESTION_STEPS[0])
  const [previewLocked, setPreviewLocked] = useState(false)

  return (
    <div className="app">
      <header className="top-bar">
        <a className="top-bar__logo" href="/" aria-label="Etsy">
          <Icon src={etsy} size={48} alt="Etsy" />
        </a>
        <div className="top-bar__actions">
          <Button variant="tertiary" size="base">
            Save & exit
          </Button>
        </div>
      </header>

      <main className="app__main">
        <ListingForm
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onActiveQuestionChange={setActiveQuestion}
          onPreviewChange={setPreviewLocked}
        />
      </main>

      {activeQuestion !== QUESTION_STEPS[0] ? (
        <div className="question-veil question-veil--top" aria-hidden="true" />
      ) : null}
      <div className="question-veil question-veil--bottom" aria-hidden="true" />

      <footer className="bottom-bar">
        <p
          className={`bottom-bar__score${previewLocked ? ' bottom-bar__score--visible' : ''}`}
          aria-hidden={!previewLocked}
        >
          Your listing score: <span>Great</span>
        </p>
        <div className="bottom-bar__actions">
          <QuestionNav stepIds={QUESTION_STEPS} activeId={activeQuestion} />
          <Button variant="primary" size="base">
            Publish listing
          </Button>
        </div>
      </footer>
    </div>
  )
}
