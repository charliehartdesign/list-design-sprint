import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { QuestionStep } from './QuestionStep'
import { MediaSection } from './MediaSection'
import { AiOrangeSquare } from './AiOrangeSquare'
import { Button } from './Button'
import { Icon } from './Icon'
import { motionTokens } from '../motion/tokens'
import copy from '../assets/icons/copy.svg'
import aiWrite from '../assets/icons/ai-write.svg'
import close from '../assets/icons/close.svg'
import add from '../assets/icons/add.svg'
import chevron from '../assets/icons/chevron.svg'
import edit from '../assets/icons/edit.svg'
import './ListingForm.css'
import './ui.css'

const SWATCHES = ['#f08933', '#d0a089', '#8c8d56', '#b06378']

const TITLE_SUGGESTIONS = [
  'Lead with ‘Handthrown’ for craft signal',
  'Add ‘wabi sabi’ for searchability',
  'Include finish options in title',
]

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'pricing', label: 'Pricing & Inventory' },
  { id: 'discoverability', label: 'Discoverability' },
  { id: 'shipping', label: 'Shipping & Processing' },
  { id: 'settings', label: 'Settings' },
]

const QUESTION_STEPS = [
  'about',
  'category',
  'description',
  'title',
  'pricing',
  'options',
  'quantity',
  'discoverability',
  'shipping',
  'settings',
]

export { QUESTION_STEPS }

function questionLinks(id) {
  const index = QUESTION_STEPS.indexOf(id)
  return {
    prevId: QUESTION_STEPS[index - 1],
    nextId: QUESTION_STEPS[index + 1],
  }
}

function Chip({ label, selected, onRemove, onAdd }) {
  if (selected) {
    return (
      <span className="chip chip--selected">
        <span>{label}</span>
        <button type="button" className="chip__remove" onClick={onRemove} aria-label={`Remove ${label}`}>
          <Icon src={close} size={16} />
        </button>
      </span>
    )
  }

  return (
    <button type="button" className="chip chip--suggest" onClick={onAdd}>
      <Icon src={add} size={12} />
      <span>{label}</span>
    </button>
  )
}

function SelectableCard({ label, selected, onClick }) {
  return (
    <button
      type="button"
      className={`selectable-card${selected ? ' selectable-card--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {label}
    </button>
  )
}

function InfoRow({ title, primary, secondary, onEdit }) {
  return (
    <div className="info-row">
      <p className="info-row__label">{title}</p>
      <div className="info-row__card">
        <div className="info-row__text">
          <p className="info-row__primary">{primary}</p>
          {secondary ? <p className="info-row__secondary">{secondary}</p> : null}
        </div>
        <button type="button" className="btn btn--ghost-icon" aria-label={`Edit ${title}`} onClick={onEdit}>
          <Icon src={edit} size={16} />
        </button>
      </div>
    </div>
  )
}

export function ListingForm({
  activeNav = 'about',
  onNavChange,
  onActiveQuestionChange,
  onPreviewChange,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [tags, setTags] = useState(['hand printed', 'boho'])
  const [materials, setMaterials] = useState(['linen', 'non-toxic ink'])
  const [whoMade, setWhoMade] = useState('I did')
  const [whatIsIt, setWhatIsIt] = useState('A finished product')
  const [showPreview, setShowPreview] = useState(false)
  const [mediaItems, setMediaItems] = useState([])
  const handleQuestionFocus = useCallback(
    (id, focused) => {
      if (focused) onActiveQuestionChange?.(id)
    },
    [onActiveQuestionChange],
  )
  const mediaRef = useRef(null)
  const previewSrc = mediaItems.find((item) => item.kind === 'image')?.src

  const { duration, ease } = motionTokens

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Lock preview only once media tiles have left the viewport
        const visible = !entry.isIntersecting && mediaItems.length > 0
        setShowPreview(visible)
        onPreviewChange?.(visible)
      },
      { threshold: 0, rootMargin: '0px' },
    )

    observer.observe(media)
    return () => observer.disconnect()
  }, [mediaItems.length, onPreviewChange])

  // Keep preview hidden if media was cleared while locked
  useEffect(() => {
    if (!mediaItems.length) {
      setShowPreview(false)
      onPreviewChange?.(false)
    }
  }, [mediaItems.length, onPreviewChange])

  return (
    <>
      {/* Fixed bottom-left preview (Figma 819:128638) — page margin 24 */}
      <div className="listing-preview-slot">
        <AnimatePresence>
          {showPreview ? (
            <motion.div
              className="listing-preview"
              aria-hidden="true"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: duration.base, ease: ease.soft }}
            >
              <div
                className="listing-preview__media"
                style={
                  previewSrc
                    ? {
                        backgroundImage: `url(${previewSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              />
              <div className="listing-preview__meta">
                <p className="listing-preview__title">
                  {title || 'Hand block printed table r...'}
                </p>
                <p className="listing-preview__price">{price ? `$${price}` : 'Price'}</p>
                <p className="listing-preview__desc">
                  {description ||
                    'This table runner features my hand-carved, block printed Floral Dots pattern in ...'}
                </p>
                <div className="listing-preview__swatches" aria-hidden="true">
                  {SWATCHES.map((color) => (
                    <span
                      key={color}
                      className="listing-preview__swatch"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="listing-layout">
        <aside className="side-nav" aria-label="Listing sections">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`side-nav__item${activeNav === item.id ? ' side-nav__item--active' : ''}`}
              onClick={() => {
                onNavChange?.(item.id)
                document
                  .getElementById(item.id)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div className="listing-main">
          <form className="listing-form" onSubmit={(e) => e.preventDefault()}>
            <QuestionStep
              id="about"
              {...questionLinks('about')}
              onFocusChange={handleQuestionFocus}
            >
              <MediaSection mediaRef={mediaRef} onMediaChange={setMediaItems} />
            </QuestionStep>

          <QuestionStep
            id="category"
            {...questionLinks('category')}
            onFocusChange={handleQuestionFocus}
          >
            <div className="category-line">
              <AiOrangeSquare size={12.5} className="category-line__mark" />
              <p className="category-line__text wt-text-heading-base">
                It looks like this product’s category is{' '}
                <button type="button" className="dotted-link">
                  Table Runner
                </button>
              </p>
              <Button
                variant="tertiary"
                size="small"
                iconEnd={<Icon src={chevron} size={16} />}
              >
                Choose a different category
              </Button>
            </div>
          </QuestionStep>

          <QuestionStep
            id="description"
            {...questionLinks('description')}
            onFocusChange={handleQuestionFocus}
          >
            <div className="field-block">
              <label className="section-title" htmlFor="description">
                Describe your item
              </label>
              <p className="field-help">Tell buyers what makes this item special.</p>
              <div className="textarea-shell">
                <textarea
                  id="description"
                  rows={8}
                  placeholder="Describe the details of your item"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="textarea-actions">
                  <button type="button" className="text-action">
                    <Icon src={copy} size={16} />
                    Copy from listing
                  </button>
                  <button type="button" className="text-action">
                    <Icon src={aiWrite} size={16} />
                    Help me write
                  </button>
                </div>
              </div>
            </div>
          </QuestionStep>

          <QuestionStep
            id="title"
            {...questionLinks('title')}
            onFocusChange={handleQuestionFocus}
          >
            <div className="field-block field-block--display">
              <label className="section-title" htmlFor="title">
                Give your listing a title
              </label>
              <input
                id="title"
                className="display-input display-input--title wt-text-display-large"
                placeholder=""
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
              <div className="suggest-row">
                <div className="suggest-label">
                  <span>Suggested</span>
                  <AiOrangeSquare size={8} />
                </div>
                <div className="suggest-chips">
                  {TITLE_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="chip chip--soft"
                      onClick={() => setTitle((t) => (t ? `${t} ${s}` : s))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </QuestionStep>

          <QuestionStep
            id="pricing"
            {...questionLinks('pricing')}
            onFocusChange={handleQuestionFocus}
          >
            <div className="field-block field-block--display">
              <label className="section-title" htmlFor="price">
                Set your price
              </label>
              <div className="display-input-wrap">
                <span className="display-input display-input--figure" aria-hidden="true">
                  $
                </span>
                <input
                  id="price"
                  className="display-input display-input--figure"
                  inputMode="decimal"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
                />
              </div>
              <p className="body-base">Listings like yours usually go for...</p>
            </div>
          </QuestionStep>

          <QuestionStep
            id="options"
            {...questionLinks('options')}
            onFocusChange={handleQuestionFocus}
          >
            <div className="field-block">
              <h2 className="section-title">Does your item have different options?</h2>
              <p className="field-help">Let buyers know what choices are available for this item</p>

              <div className="subblock">
                <h3 className="subsection-title">Variations</h3>
                <div className="variation-row">
                  <div className="swatches">
                    {SWATCHES.map((color) => (
                      <span key={color} className="swatch" style={{ background: color }} />
                    ))}
                    <button type="button" className="btn btn--ghost-icon" aria-label="Edit variations">
                      <Icon src={edit} size={16} />
                    </button>
                  </div>
                  <p className="body-small">4 variants detected based on your media</p>
                </div>
                <Button variant="secondary" size="base" iconStart={<Icon src={add} size={12} />}>
                  Add variation
                </Button>
              </div>

              <div className="subblock">
                <h3 className="subsection-title">Custom options</h3>
                <p className="body-base">
                  Let buyers customize your item with text, options, or images. These do not affect
                  your inventory quantities.
                </p>
                <Button variant="secondary" size="base" iconStart={<Icon src={add} size={12} />}>
                  Add custom option
                </Button>
              </div>
            </div>
          </QuestionStep>

          <QuestionStep
            id="quantity"
            {...questionLinks('quantity')}
            onFocusChange={handleQuestionFocus}
          >
            <div className="field-block">
              <label className="section-title" htmlFor="quantity">
                How many of this item do you have?
              </label>
              <input
                id="quantity"
                className="display-input display-input--quantity"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ''))}
              />
            </div>
          </QuestionStep>

          <QuestionStep
            id="discoverability"
            {...questionLinks('discoverability')}
            onFocusChange={handleQuestionFocus}
          >
            <h2 className="section-title">Help buyers find your item</h2>

            <div className="field-block">
              <p className="field-label">Tags</p>
              <div className="typeahead">
                <div className="typeahead__chips">
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      selected
                      onRemove={() => setTags((t) => t.filter((x) => x !== tag))}
                    />
                  ))}
                  <span className="typeahead__placeholder">Add an option</span>
                </div>
                <Icon src={chevron} size={24} />
              </div>
              <div className="suggest-row">
                <p className="suggest-label-text">Suggested</p>
                <div className="suggest-chips">
                  {['tabletop', 'housewarming']
                    .filter((t) => !tags.includes(t))
                    .map((t) => (
                      <Chip key={t} label={t} onAdd={() => setTags((prev) => [...prev, t])} />
                    ))}
                </div>
              </div>
            </div>

            <div className="field-block">
              <p className="field-label">Materials</p>
              <div className="typeahead">
                <div className="typeahead__chips">
                  {materials.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      selected
                      onRemove={() => setMaterials((t) => t.filter((x) => x !== m))}
                    />
                  ))}
                  <span className="typeahead__placeholder">Add an option</span>
                </div>
                <Icon src={chevron} size={24} />
              </div>
            </div>

            <Button variant="tertiary" size="base" className="btn--block">
              Show 12 more
            </Button>
          </QuestionStep>

          <QuestionStep
            id="shipping"
            {...questionLinks('shipping')}
            onFocusChange={handleQuestionFocus}
          >
            <h2 className="section-title">Shipping, processing, and returns</h2>
            <InfoRow
              title="Processing"
              primary="Made to order"
              secondary="2 weeks processing time"
            />
            <InfoRow
              title="Shipping profile"
              primary="Basic Ship"
              secondary="From 95817 · 87 active listings"
            />
            <InfoRow title="Weight and dimensions" primary="2x8’ · 1lb" />
          </QuestionStep>

          <QuestionStep
            id="settings"
            {...questionLinks('settings')}
            onFocusChange={handleQuestionFocus}
          >
            <div className="field-block">
              <h2 className="section-title">Give us a few final details on how your item’s made</h2>
              <p className="field-help">We made some suggestions based on info you told us</p>
            </div>

            <div className="field-block field-block--cards">
              <p className="field-label">Who made this item?</p>
              <div className="card-row">
                {['I did', 'A member of my shop', 'Another firm or person'].map((option) => (
                  <SelectableCard
                    key={option}
                    label={option}
                    selected={whoMade === option}
                    onClick={() => setWhoMade(option)}
                  />
                ))}
              </div>
            </div>

            <div className="field-block field-block--cards">
              <p className="field-label">What is it?</p>
              <div className="card-row">
                {['A finished product', 'A supply or tool to make things'].map((option) => (
                  <SelectableCard
                    key={option}
                    label={option}
                    selected={whatIsIt === option}
                    onClick={() => setWhatIsIt(option)}
                  />
                ))}
              </div>
            </div>
          </QuestionStep>
        </form>
        </div>
      </div>
    </>
  )
}
