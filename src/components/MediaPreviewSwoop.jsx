import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { motionTokens } from '../motion/tokens'
import './MediaPreviewSwoop.css'

const STACK_COUNT = 4
const SWOOP_MS = 680

/**
 * Flying media stack: grid tiles collapse into the bottom-left preview card.
 * `tiles` = snapshot of { src, top, left, width, height } from the grid.
 * `dest` = preview media target rect in viewport coords.
 */
export function MediaPreviewSwoop({ tiles = [], dest, active, onComplete }) {
  const { ease } = motionTokens
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active || !tiles.length || !dest) {
      setDone(false)
      return undefined
    }

    setDone(false)
    const timer = setTimeout(() => {
      setDone(true)
      onComplete?.()
    }, SWOOP_MS + (STACK_COUNT - 1) * 55 - 40)

    return () => clearTimeout(timer)
  }, [active, tiles, dest, onComplete])

  const show = active && !done && tiles.length > 0 && dest

  return (
    <AnimatePresence>
      {show
        ? tiles.slice(0, STACK_COUNT).map((tile, index) => {
            const scaleX = dest.width / Math.max(tile.width, 1)
            const scaleY = dest.height / Math.max(tile.height, 1)
            const dx = dest.left - tile.left
            const dy = dest.top - tile.top
            // Fan slightly mid-flight so the stack reads as multiple cards
            const midRotate = index === 0 ? 0 : index % 2 === 0 ? -10 : 12
            const z = STACK_COUNT - index

            return (
              <motion.div
                key={`${tile.src}-${index}-${tile.left}`}
                className="media-preview-swoop__tile"
                style={{
                  top: tile.top,
                  left: tile.left,
                  width: tile.width,
                  height: tile.height,
                  zIndex: 40 + z,
                  backgroundImage: tile.src ? `url(${tile.src})` : undefined,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scaleX: 1,
                  scaleY: 1,
                  rotate: 0,
                  opacity: 1,
                  borderRadius: 0,
                }}
                animate={{
                  x: dx,
                  y: dy,
                  scaleX,
                  scaleY,
                  rotate: [0, midRotate, 0],
                  opacity: 1,
                  borderRadius: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: SWOOP_MS / 1000,
                  delay: index * 0.055,
                  ease: ease.soft,
                  rotate: {
                    duration: SWOOP_MS / 1000,
                    delay: index * 0.055,
                    times: [0, 0.45, 1],
                    ease: ease.soft,
                  },
                }}
              />
            )
          })
        : null}
    </AnimatePresence>
  )
}

/** Read first N image tiles from the media section DOM. */
export function snapshotMediaTiles(mediaNode, items, count = STACK_COUNT) {
  if (!mediaNode || !items?.length) return []

  const nodes = [
    ...mediaNode.querySelectorAll('.media-grid__tile:not(.media-grid__tile--add)'),
  ].slice(0, count)

  return nodes
    .map((el, index) => {
      const rect = el.getBoundingClientRect()
      const item = items[index]
      if (!item || rect.width < 2 || rect.height < 2) return null
      return {
        src: item.src,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }
    })
    .filter(Boolean)
}

/** Destination rect for the preview’s square media face. */
export function getPreviewMediaDest(slotEl) {
  const size = 200
  const fallbackLeft = 24
  const chromeBottom =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--chrome-bottom'),
    ) || 96

  if (slotEl) {
    const media = slotEl.querySelector('.listing-preview__media')
    if (media) {
      const rect = media.getBoundingClientRect()
      if (rect.width >= 2 && rect.height >= 2) {
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }
      }
    }

    const slot = slotEl.getBoundingClientRect()
    // Empty fixed slot is bottom-anchored with height 0 — square sits above that edge
    const top = slot.height >= 2 ? slot.top : slot.top - size
    return {
      left: slot.left || fallbackLeft,
      top,
      width: size,
      height: size,
    }
  }

  return {
    left: fallbackLeft,
    top: window.innerHeight - (chromeBottom + 24) - size,
    width: size,
    height: size,
  }
}
