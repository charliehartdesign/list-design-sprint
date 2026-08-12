import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AiOrangeSquare } from './AiOrangeSquare'
import { motionTokens } from '../motion/tokens'
import mediaRunner from '../assets/price-comps/embroidered-runner.png'
import mediaTowel from '../assets/price-comps/sardine-towel.png'
import './PriceTip.css'

const RANGE_LISTINGS = [
  {
    id: 'cmp-1',
    src: mediaRunner,
    title: 'Vintage embroidered table runner retro',
    price: '$23.00',
  },
  {
    id: 'cmp-2',
    src: mediaTowel,
    title: 'Handprinted sardine tea towel, peach blush',
    price: '$27.00',
  },
]

/**
 * Pricing guidance tip — hover/focus the range to preview
 * comparable listings in that band (Figma Set your price).
 * Popover portals to body so it stacks above neighboring questions.
 */
export function PriceTip() {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const tipId = useId()
  const rootRef = useRef(null)
  const rangeRef = useRef(null)
  const closeTimer = useRef(null)
  const reducedMotion = useReducedMotion()
  const { duration, ease } = motionTokens

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const placePopover = () => {
    const range = rangeRef.current
    if (!range) return
    const rect = range.getBoundingClientRect()
    const popoverWidth = Math.min(340, window.innerWidth - 48)
    // Anchor under the "$20 to $25" range, nudged right like Figma
    let left = rect.left + rect.width * 0.15
    left = Math.min(left, window.innerWidth - popoverWidth - 24)
    left = Math.max(24, left)
    setCoords({
      top: rect.bottom + 12,
      left,
      width: popoverWidth,
    })
  }

  const show = () => {
    clearClose()
    placePopover()
    setOpen(true)
  }

  const hideSoon = () => {
    clearClose()
    closeTimer.current = setTimeout(() => setOpen(false), 140)
  }

  useLayoutEffect(() => {
    if (!open) return undefined
    placePopover()
    const onReposition = () => placePopover()
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [open])

  useEffect(
    () => () => {
      clearClose()
    },
    [],
  )

  const popover = createPortal(
    <AnimatePresence>
      {open && coords ? (
        <motion.div
          key="price-tip-popover"
          id={tipId}
          className="price-tip__popover"
          role="tooltip"
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
          }}
          initial={
            reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
          }
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
          transition={{
            duration: reducedMotion ? 0 : duration.fast,
            ease: ease.soft,
          }}
          onMouseEnter={show}
          onMouseLeave={hideSoon}
        >
          {RANGE_LISTINGS.map((listing) => (
            <article key={listing.id} className="price-tip__listing">
              <img src={listing.src} alt="" className="price-tip__thumb" />
              <p className="price-tip__title">{listing.title}</p>
              <p className="price-tip__price">{listing.price}</p>
            </article>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )

  return (
    <div
      ref={rootRef}
      className="price-tip"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onFocusCapture={show}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) hideSoon()
      }}
    >
      <p className="price-tip__text body-base">
        Listings like yours usually go for{' '}
        <button
          ref={rangeRef}
          type="button"
          className="price-tip__range"
          aria-describedby={open ? tipId : undefined}
          aria-expanded={open}
        >
          $20 to $25
        </button>
        .
        <AiOrangeSquare size={10} className="price-tip__mark" />
      </p>
      {popover}
    </div>
  )
}
