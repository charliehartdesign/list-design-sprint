import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { QuestionStep } from './QuestionStep'
import { MediaSection } from './MediaSection'
import { DescriptionSection } from './DescriptionSection'
import { ReviewForm } from './ReviewForm'
import { AiOrangeSquare } from './AiOrangeSquare'
import { Button } from './Button'
import { Icon } from './Icon'
import { PriceTip } from './PriceTip'
import { ChipInput } from './ChipInput'
import { motionTokens } from '../motion/tokens'
import add from '../assets/icons/add.svg'
import chevron from '../assets/icons/chevron.svg'
import edit from '../assets/icons/edit.svg'
import media1 from '../assets/media/media-1.png'
import media2 from '../assets/media/media-2.png'
import media3 from '../assets/media/media-3.png'
import media4 from '../assets/media/media-4.png'
import media5 from '../assets/media/media-5.png'
import media6 from '../assets/media/media-6.png'
import './ListingForm.css'
import './ui.css'

const SWATCHES = ['#f08933', '#d0a089', '#dfdce0', '#b06378']

/**
 * Title chips: instructional label on the chip, `insert` is what actually
 * lands in the field. `placement: 'start' | 'end'` controls where it goes.
 */
const TITLE_SUGGESTIONS = [
  {
    label: "Lead with ‘Hand block printed’ for craft signal",
    insert: 'Hand block printed',
    placement: 'start',
  },
  {
    label: "Add ‘linen’ for material searchability",
    insert: 'linen',
    placement: 'end',
  },
  {
    label: "Include ‘table runner’ for category clarity",
    insert: 'table runner',
    placement: 'end',
  },
]

function applyTitleSuggestion(current, { insert, placement }) {
  const value = current.trim()
  const needle = insert.toLowerCase()
  if (value.toLowerCase().includes(needle)) return value

  if (placement === 'start') {
    if (!value) return insert
    // Prefer Title Case lead-in; keep the rest of the existing title
    const rest = value.replace(/^[a-z]/, (c) => c.toLowerCase())
    return `${insert} ${rest}`
  }

  return value ? `${value} ${insert}` : insert
}

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
  density = 'expanded',
  onRequestExpand,
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
  const reducedMotion = useReducedMotion()
  const handleQuestionFocus = useCallback(
    (id, focused) => {
      if (focused) onActiveQuestionChange?.(id)
    },
    [onActiveQuestionChange],
  )
  const [mediaNode, setMediaNode] = useState(null)
  const previewSrc = mediaItems.find((item) => item.kind === 'image')?.src

  const setMediaRef = useCallback((node) => {
    setMediaNode(node)
  }, [])

  const { duration, ease } = motionTokens

  // Lock the bottom-left preview once media scrolls out of view (Focus mode only).
  useEffect(() => {
    if (density === 'contracted') {
      setShowPreview(false)
      onPreviewChange?.(false)
      return undefined
    }

    if (!mediaItems.length || !mediaNode) {
      setShowPreview(false)
      onPreviewChange?.(false)
      return undefined
    }

    const sync = (visible) => {
      const locked = !visible
      setShowPreview(locked)
      onPreviewChange?.(locked)
    }

    const observer = new IntersectionObserver(
      ([entry]) => sync(entry.isIntersecting),
      { threshold: 0, rootMargin: '0px' },
    )

    observer.observe(mediaNode)
    const rect = mediaNode.getBoundingClientRect()
    const inView = rect.bottom > 0 && rect.top < window.innerHeight
    sync(inView)

    return () => observer.disconnect()
  }, [mediaItems.length, mediaNode, onPreviewChange, density])

  const handleEditSection = useCallback(
    (sectionId) => {
      onRequestExpand?.(sectionId)
    },
    [onRequestExpand],
  )

  // Prototype: seed demo media once when entering review empty, so the frame matches Figma
  useEffect(() => {
    if (density !== 'contracted' || mediaItems.length) return undefined
    setMediaItems(
      [
        media1,
        media2,
        media3,
        media4,
        media5,
        media6,
        media1,
        media2,
        media3,
        media4,
        media5,
        media6,
        media1,
      ].map((src, index) => ({
        id: `demo-${index}`,
        src,
        kind: 'image',
        name: `demo-${index + 1}.png`,
      })),
    )
    return undefined
  }, [density, mediaItems.length])

  const sideNav = (
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
  )

  const contracted = density === 'contracted'

  return (
    <>
      {/* Fixed bottom-left preview — Focus mode only */}
      {!contracted ? (
        <div className="listing-preview-slot">
          <AnimatePresence>
            {showPreview ? (
              <motion.div
                className="listing-preview"
                aria-hidden="true"
                initial={
                  reducedMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 12 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8 }
                }
                transition={{
                  duration: reducedMotion ? 0 : duration.base,
                  ease: ease.soft,
                }}
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
                  <p className={`listing-preview__title${!title.trim() ? ' listing-preview__title--placeholder' : ''}`}>
                    {title.trim() || 'Title'}
                  </p>
                  <div className="listing-preview__body">
                    <p className="listing-preview__price">
                      {price ? `$${price}` : 'Price'}
                    </p>
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
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      <div className="listing-layout">
        {sideNav}

        <div className="listing-main">
          {contracted ? (
            <ReviewForm
              mediaItems={mediaItems}
              title={title}
              description={description}
              price={price}
              quantity={quantity}
              tags={tags}
              materials={materials}
              whoMade={whoMade}
              whatIsIt={whatIsIt}
              onEditSection={handleEditSection}
            />
          ) : (
          <form className="listing-form" onSubmit={(e) => e.preventDefault()}>
            <QuestionStep
              id="about"
              {...questionLinks('about')}
              onFocusChange={handleQuestionFocus}
              density={density}
            >
              <MediaSection
                mediaRef={setMediaRef}
                items={mediaItems}
                onMediaChange={setMediaItems}
              />
            </QuestionStep>

          <QuestionStep
            id="category"
            {...questionLinks('category')}
            onFocusChange={handleQuestionFocus}
            density={density}
          >
            {mediaItems.length ? (
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
            ) : (
              <div className="category-empty">
                <div className="field-block">
                  <h2 className="section-title">What category is this?</h2>
                  <p className="field-help">
                    Pick a category so buyers can find your item.
                  </p>
                  <Button
                    variant="secondary"
                    size="small"
                    iconEnd={<Icon src={chevron} size={16} />}
                  >
                    Choose a category
                  </Button>
                </div>
                <div className="tip tip--category">
                  <div className="tip__heading">
                    <span>Tip</span>
                    <AiOrangeSquare size={12.5} />
                  </div>
                  <p>Start with media and get help filling out the rest</p>
                </div>
              </div>
            )}
          </QuestionStep>

          <QuestionStep
            id="description"
            {...questionLinks('description')}
            onFocusChange={handleQuestionFocus}
            density={density}
          >
            <DescriptionSection
              value={description}
              onChange={setDescription}
            />
          </QuestionStep>

          <QuestionStep
            id="title"
            {...questionLinks('title')}
            onFocusChange={handleQuestionFocus}
            density={density}
          >
            <div className="field-block field-block--display">
              <label className="section-title" htmlFor="title">
                Give your listing a title
              </label>
              <textarea
                id="title"
                className="display-input display-input--title wt-text-display-large"
                rows={1}
                placeholder=""
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  const el = e.target
                  el.style.height = 'auto'
                  el.style.height = `${el.scrollHeight}px`
                }}
                ref={(el) => {
                  if (!el) return
                  el.style.height = 'auto'
                  el.style.height = `${el.scrollHeight}px`
                }}
                autoComplete="off"
              />
              {title.trim() ? (
                <div className="suggest-row">
                  <div className="suggest-label">
                    <span>Suggested</span>
                    <AiOrangeSquare size={8} />
                  </div>
                  <div className="suggest-chips">
                    {TITLE_SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        className="chip chip--soft"
                        onClick={() => setTitle((t) => applyTitleSuggestion(t, s))}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </QuestionStep>

          <QuestionStep
            id="pricing"
            {...questionLinks('pricing')}
            onFocusChange={handleQuestionFocus}
            density={density}
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
              <PriceTip />
            </div>
          </QuestionStep>

          <QuestionStep
            id="options"
            {...questionLinks('options')}
            onFocusChange={handleQuestionFocus}
            density={density}
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
            density={density}
          >
            <div className="field-block field-block--display">
              <label className="section-title" htmlFor="quantity">
                How many of this item do you have?
              </label>
              <input
                id="quantity"
                className="display-input display-input--figure"
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
            density={density}
          >
            <h2 className="section-title">Help buyers find your item</h2>

            <ChipInput
              id="tags"
              label="Tags"
              values={tags}
              onChange={setTags}
              suggestions={['tabletop', 'housewarming']}
            />

            <ChipInput
              id="materials"
              label="Materials"
              values={materials}
              onChange={setMaterials}
            />
          </QuestionStep>

          <QuestionStep
            id="shipping"
            {...questionLinks('shipping')}
            onFocusChange={handleQuestionFocus}
            density={density}
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
            density={density}
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
          )}
        </div>
      </div>
    </>
  )
}
