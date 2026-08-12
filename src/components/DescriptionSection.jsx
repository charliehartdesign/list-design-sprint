import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { FieldPractices } from './FieldPractices'
import copy from '../assets/icons/copy.svg'
import aiWrite from '../assets/icons/ai-write.svg'
import './DescriptionSection.css'

export const SAMPLE_DESCRIPTION = `This table runner features my hand-carved, block printed Floral Dots pattern in orange ink on a blush pink linen blend. Every piece has been hand-printed in non-toxic fabric inks with my original illustrations.

Linen is a great, ecofriendly material that softens & becomes better with age. This size fits standard tables - but please reach out if you need a custom size. These turn even the most boring Tuesday night dinner into a classy affair - and is packaged with a hangtag to make a perfect hostess/housewarming gift!

- 55% Linen / 45% Cotton
- Standard 15" width - multiple lengths available.
- Machine wash cold & tumble dry low - iron as needed
- Packaged with belly band
- All orders are wrapped in Julie Peach Palm Sunset tissue paper & sticker - ready for gifting!
- Ships in compostable mailer

This pattern is available in a variety of ink and fabric colors - custom projects always welcome. Please reach out with any inquiries.`

const DESC_PRACTICES = [
  {
    id: 'dimensions',
    label: 'Include dimensions',
    test: (text) => /\d+\s*"/.test(text) || /width|length|size/i.test(text),
  },
  {
    id: 'pattern',
    label: 'Include pattern description',
    test: (text) => /pattern|print|floral|block/i.test(text),
  },
  {
    id: 'care',
    label: 'Include care instructions',
    test: (text) => /wash|dry|iron|care/i.test(text),
  },
  {
    id: 'materials',
    label: 'Include materials',
    test: (text) => /linen|cotton|material|fabric/i.test(text),
  },
]

/**
 * Description question — tap empty field to “type” the sample copy,
 * then Best practices evaluates in on the right.
 */
export function DescriptionSection({ value, onChange }) {
  const [evaluating, setEvaluating] = useState(false)
  const [evaluateKey, setEvaluateKey] = useState(0)
  const typingRef = useRef(null)
  const filledOnce = useRef(false)

  useEffect(() => () => {
    if (typingRef.current) clearInterval(typingRef.current)
  }, [])

  const practices = DESC_PRACTICES.map((def) => ({
    id: def.id,
    label: def.label,
    done: def.test(value),
  }))

  const startEvaluation = () => {
    setEvaluateKey((k) => k + 1)
    setEvaluating(true)
  }

  const typeSample = () => {
    if (value.trim() || filledOnce.current) return
    filledOnce.current = true
    setEvaluating(false)

    let i = 0
    const full = SAMPLE_DESCRIPTION
    // Chunked typewriter so it feels typed but finishes in ~2.5s
    const step = Math.max(2, Math.ceil(full.length / 90))

    if (typingRef.current) clearInterval(typingRef.current)
    typingRef.current = setInterval(() => {
      i = Math.min(full.length, i + step)
      onChange(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(typingRef.current)
        typingRef.current = null
        startEvaluation()
      }
    }, 28)
  }

  return (
    <div className="description-section">
      <div className="field-block">
        <label className="section-title" htmlFor="description-input">
          Describe your item
        </label>
        <p className="field-help">Tell buyers what makes this item special.</p>
        <div className="textarea-shell">
          <textarea
            id="description-input"
            rows={8}
            placeholder="Describe the details of your item"
            value={value}
            onChange={(e) => {
              filledOnce.current = true
              const next = e.target.value
              onChange(next)
              if (!next.trim()) {
                setEvaluating(false)
                return
              }
              if (!evaluating) startEvaluation()
            }}
            onFocus={typeSample}
            onClick={typeSample}
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

      <FieldPractices
        active={evaluating && Boolean(value.trim())}
        evaluateKey={evaluateKey}
        items={practices}
        className="description-section__practices"
        style={{ top: 88 }}
      />
    </div>
  )
}
