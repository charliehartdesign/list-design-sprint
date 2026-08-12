import { Icon } from './Icon'
import edit from '../assets/icons/edit.svg'
import './ReviewForm.css'

const DEFAULT_DESC =
  'This table runner features my hand-carved, block printed Floral Dots pattern in orange ink on a blush pink linen blend. Every piece has been hand-printed in non-toxic fabric inks with my original...'

function SectionHeader({ title, onEdit }) {
  return (
    <div className="review-section__header">
      <h2 className="review-section__title">{title}</h2>
      <button
        type="button"
        className="review-section__edit"
        aria-label={`Edit ${title}`}
        onClick={onEdit}
      >
        <Icon src={edit} size={16} />
      </button>
    </div>
  )
}

function FieldRow({ label, children, muted }) {
  return (
    <div className="review-row">
      <p className="review-row__label">{label}</p>
      <div className={`review-row__value${muted ? ' review-row__value--muted' : ''}`}>
        {children}
      </div>
    </div>
  )
}

/**
 * Figma 666:75480 “Review - From scratch” — contracted density view.
 */
export function ReviewForm({
  mediaItems = [],
  title,
  description,
  price,
  quantity,
  tags = [],
  materials = [],
  whoMade,
  whatIsIt,
  onEditSection,
}) {
  const images = mediaItems.filter((item) => item.kind !== 'video')
  const hero = images[0]
  const thumbs = images.slice(1, 13)
  const descText = description?.trim() || DEFAULT_DESC
  const truncated =
    descText.length > 160 ? `${descText.slice(0, 160).trimEnd()}...` : descText
  const showMore = !description?.trim() || description.length > 160

  const priceDisplay = price
    ? `$${Number.parseFloat(price).toFixed(2)} USD`
    : '$0.00 USD'

  return (
    <div className="review-form">
      <section className="review-section" id="about">
        <SectionHeader title="Item details" onEdit={() => onEditSection?.('about')} />

        <FieldRow label="Media">
          <div className="review-media">
            <div className="review-media__hero">
              {hero ? (
                <img src={hero.src} alt="" />
              ) : (
                <div className="review-media__empty" />
              )}
            </div>
            <div className="review-media__grid">
              {thumbs.map((item) => (
                <div key={item.id} className="review-media__thumb">
                  <img src={item.src} alt="" />
                </div>
              ))}
              {Array.from({ length: Math.max(0, 12 - thumbs.length) }).map((_, i) => (
                <div key={`pad-${i}`} className="review-media__thumb review-media__thumb--empty" />
              ))}
            </div>
          </div>
        </FieldRow>

        <FieldRow label="Category">Table Runners</FieldRow>
        <FieldRow label="Title">{title || 'Orange Table Runner'}</FieldRow>
        <FieldRow label="Description">
          <p className="review-desc">
            {truncated}
            {showMore ? (
              <button type="button" className="review-desc__more">
                more
              </button>
            ) : null}
          </p>
        </FieldRow>
      </section>

      <section className="review-section" id="pricing">
        <SectionHeader
          title="Price & Inventory"
          onEdit={() => onEditSection?.('pricing')}
        />
        <FieldRow label="Price">{priceDisplay}</FieldRow>
        <FieldRow label="Quantity">{quantity || '1'}</FieldRow>
        <FieldRow label="SKU" muted>
          None
        </FieldRow>
      </section>

      <section className="review-section" id="options">
        <SectionHeader title="Item options" onEdit={() => onEditSection?.('options')} />
        <FieldRow label="Variations" muted>
          None
        </FieldRow>
        <FieldRow label="Custom options" muted>
          None
        </FieldRow>
      </section>

      <section className="review-section" id="discoverability">
        <SectionHeader
          title="Attributes"
          onEdit={() => onEditSection?.('discoverability')}
        />
        <FieldRow label="Tags">
          <div className="review-chips">
            {tags.map((tag) => (
              <span key={tag} className="review-chip">
                {tag}
              </span>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Materials">
          <div className="review-chips">
            {materials.map((m) => (
              <span key={m} className="review-chip">
                {m}
              </span>
            ))}
          </div>
        </FieldRow>
      </section>

      <section className="review-section" id="shipping">
        <SectionHeader
          title="Shipping, processing, and returns"
          onEdit={() => onEditSection?.('shipping')}
        />
        <FieldRow label="Processing">Made to order</FieldRow>
        <FieldRow label="Shipping profile">Basic ship</FieldRow>
        <FieldRow label="Item weight">0 lb 6 oz</FieldRow>
        <FieldRow label="Item size">12 in. × 8 in. × 1 in.</FieldRow>
      </section>

      <section className="review-section" id="made">
        <SectionHeader title="How it’s made" onEdit={() => onEditSection?.('settings')} />
        <FieldRow label="Who made it?">{whoMade}</FieldRow>
        <FieldRow label="What is it?">{whatIsIt}</FieldRow>
      </section>

      <section className="review-section" id="settings">
        <SectionHeader title="Settings" onEdit={() => onEditSection?.('settings')} />
        <FieldRow label="Shop section">Table Runners</FieldRow>
        <FieldRow label="Feature this listing">Yes</FieldRow>
        <FieldRow label="Renewal options">Automatic</FieldRow>
      </section>
    </div>
  )
}
