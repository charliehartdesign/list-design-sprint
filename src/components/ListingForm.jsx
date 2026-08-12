import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { QuestionStep } from './QuestionStep'
import { MediaSection } from './MediaSection'
import {
  MediaPreviewSwoop,
  getPreviewMediaDest,
  snapshotMediaTiles,
} from './MediaPreviewSwoop'
import { DescriptionSection } from './DescriptionSection'
import { ReviewForm } from './ReviewForm'
import { AiOrangeSquare } from './AiOrangeSquare'
import { Button } from './Button'
import { Icon } from './Icon'
import { motionTokens } from '../motion/tokens'
import close from '../assets/icons/close.svg'
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
  const [previewSwooping, setPreviewSwooping] = useState(false)
  const [swoopTiles, setSwoopTiles] = useState([])
  const [swoopDest, setSwoopDest] = useState(null)
  const [mediaItems, setMediaItems] = useState([])
  const previewLockedRef = useRef(false)
  const lastTilesRef = useRef([])
  const previewSlotRef = useRef(null)
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

  // Keep a fresh snapshot of grid tiles while media is on-screen
  useEffect(() => {
    if (density === 'contracted' || !mediaNode || !mediaItems.length) return undefined

    const capture = () => {
      const tiles = snapshotMediaTiles(mediaNode, mediaItems)
      if (tiles.length) lastTilesRef.current = tiles
    }

    capture()
    window.addEventListener('scroll', capture, { passive: true })
    window.addEventListener('resize', capture)
    return () => {
      window.removeEventListener('scroll', capture)
      window.removeEventListener('resize', capture)
    }
  }, [mediaNode, mediaItems, density])

  // Lock the bottom-left preview once media scrolls out of view (Focus mode only).
  useEffect(() => {
    if (density === 'contracted') {
      previewLockedRef.current = false
      setShowPreview(false)
      setPreviewSwooping(false)
      onPreviewChange?.(false)
      return undefined
    }

    if (!mediaItems.length || !mediaNode) {
      previewLockedRef.current = false
      setShowPreview(false)
      setPreviewSwooping(false)
      onPreviewChange?.(false)
      return undefined
    }

    const sync = (isIntersecting) => {
      const locked = !isIntersecting

      if (locked && !previewLockedRef.current) {
        // Prefer the last on-screen scroll snapshot so tiles still feel nearby
        const live = snapshotMediaTiles(mediaNode, mediaItems)
        const tiles = lastTilesRef.current.length
          ? lastTilesRef.current
          : live
        const dest = getPreviewMediaDest(previewSlotRef.current)

        if (!reducedMotion && tiles.length) {
          setSwoopTiles(tiles)
          setSwoopDest(dest)
          setPreviewSwooping(true)
        } else {
          setPreviewSwooping(false)
        }
      }

      if (!locked) {
        setPreviewSwooping(false)
      }

      previewLockedRef.current = locked
      setShowPreview(locked)
      onPreviewChange?.(locked)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Lock once the grid is mostly gone — still early enough for a visible swoop
        sync(entry.intersectionRatio > 0.12)
      },
      { threshold: [0, 0.08, 0.12, 0.25, 0.5, 1], rootMargin: '0px' },
    )

    observer.observe(mediaNode)
    const rect = mediaNode.getBoundingClientRect()
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    const ratio = rect.height > 0 ? Math.max(0, visibleHeight) / rect.height : 0
    sync(ratio > 0.12)

    return () => observer.disconnect()
  }, [mediaItems, mediaNode, onPreviewChange, density, reducedMotion])

  const handleSwoopComplete = useCallback(() => {
    setPreviewSwooping(false)
  }, [])

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
        <>
          <MediaPreviewSwoop
            active={previewSwooping}
            tiles={swoopTiles}
            dest={swoopDest}
            onComplete={handleSwoopComplete}
          />
          <div className="listing-preview-slot" ref={previewSlotRef}>
            <AnimatePresence>
              {showPreview ? (
                <motion.div
                  className="listing-preview"
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: duration.fast, ease: ease.soft }}
                >
                  <motion.div
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
                    initial={
                      previewSwooping || reducedMotion
                        ? { opacity: previewSwooping ? 0 : 1 }
                        : { opacity: 0, scale: 0.92 }
                    }
                    animate={{ opacity: previewSwooping ? 0 : 1, scale: 1 }}
                    transition={{
                      duration: duration.fast,
                      ease: ease.soft,
                      delay: previewSwooping ? 0 : 0.05,
                    }}
                  />
                  <motion.div
                    className="listing-preview__meta"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: previewSwooping ? 0 : 1,
                      y: previewSwooping ? 10 : 0,
                    }}
                    transition={{
                      duration: duration.base,
                      ease: ease.soft,
                      delay: previewSwooping ? 0 : 0.12,
                    }}
                  >
                    <p className="listing-preview__title">
                      {title || 'Hand block printed table r...'}
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
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </>
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
              <p className="body-base">Listings like yours usually go for...</p>
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
