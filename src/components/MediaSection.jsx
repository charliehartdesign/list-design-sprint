import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Icon } from './Icon'
import { FieldPractices } from './FieldPractices'
import { LoadingSpinner } from './LoadingSpinner'
import { motionTokens } from '../motion/tokens'
import addphoto from '../assets/icons/addphoto.svg'
import add from '../assets/icons/add.svg'
import chevron from '../assets/icons/chevron.svg'
import media1 from '../assets/media/media-1.png'
import media2 from '../assets/media/media-2.png'
import media3 from '../assets/media/media-3.png'
import media4 from '../assets/media/media-4.png'
import media5 from '../assets/media/media-5.png'
import media6 from '../assets/media/media-6.png'
import './MediaSection.css'

const DEMO_MEDIA = [media1, media2, media3, media4, media5, media6, media1, media2]

const PRACTICE_DEFS = [
  { id: 'in-use', label: 'Shows the item in use', test: (items) => items.length >= 1 },
  { id: 'texture', label: 'Close-up of the texture', test: (items) => items.length >= 2 },
  { id: 'scale', label: 'Size reference for scale', test: (items) => items.length >= 3 },
  {
    id: 'video',
    label: 'Feature at least 1 video',
    test: (items) => items.some((item) => item.kind === 'video'),
  },
]

function filesToMedia(fileList) {
  return [...fileList]
    .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
    .map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      src: URL.createObjectURL(file),
      kind: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name,
    }))
}

/**
 * Empty dropzone → filled 3-col media grid + Best practices panel (Figma 819:132976).
 * Controlled by parent `items` so state survives density switches.
 * While practices evaluate, a few tiles show Collage spinners (~2s).
 */
export function MediaSection({ mediaRef, items = [], onMediaChange }) {
  const [dragging, setDragging] = useState(false)
  const [processingIds, setProcessingIds] = useState(() => new Set())
  const inputRef = useRef(null)
  const ranProcessing = useRef(false)
  const reducedMotion = useReducedMotion()
  const { duration, ease } = motionTokens

  const commit = useCallback(
    (next) => {
      onMediaChange?.(next)
    },
    [onMediaChange],
  )

  const seedDemo = useCallback(() => {
    commit(
      DEMO_MEDIA.map((src, index) => ({
        id: `demo-${index}`,
        src,
        kind: 'image',
        name: `demo-${index + 1}.png`,
      })),
    )
  }, [commit])

  const addFiles = useCallback(
    (fileList) => {
      const incoming = filesToMedia(fileList)
      if (incoming.length) {
        commit([...items, ...incoming].slice(0, 20))
        return
      }
      // Prototype: empty / non-media drop still demos the filled Figma state
      if (!items.length) seedDemo()
    },
    [commit, items, seedDemo],
  )

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer?.files ?? [])
  }

  const filled = items.length > 0
  const practices = PRACTICE_DEFS.map((def) => ({
    ...def,
    done: def.test(items),
  }))

  // Stagger “still processing” overlays while best practices evaluate (~2s)
  useEffect(() => {
    if (!filled) {
      ranProcessing.current = false
      setProcessingIds(new Set())
      return undefined
    }

    if (ranProcessing.current || reducedMotion) return undefined
    ranProcessing.current = true

    // Leave the first couple tiles clear; process mid/late tiles for motion
    const queue = items.slice(2, Math.min(items.length, 6)).map((item) => item.id)
    if (!queue.length) return undefined

    setProcessingIds(new Set(queue))

    const timers = queue.map((id, index) =>
      setTimeout(
        () => {
          setProcessingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        },
        // Align with FieldPractices reveal cadence (~280 + n×520)
        520 + index * 420,
      ),
    )

    return () => timers.forEach(clearTimeout)
  }, [filled, items, reducedMotion])

  return (
    <div className="media-section" ref={mediaRef}>
      <div className={`media-section__main${filled ? ' media-section__main--filled' : ''}`}>
        <h2 className="section-title">First, add photos & videos</h2>

        {!filled ? (
          <>
            <button
              type="button"
              className={`upload-area${dragging ? ' upload-area--dragging' : ''}`}
              onDragEnter={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={seedDemo}
            >
              <Icon src={addphoto} size={24} />
              <div className="upload-area__text">
                <p className="upload-area__title">Drop your files here</p>
                <p className="upload-area__sub">Up to 20 photos and 2 videos</p>
              </div>
              <span className="btn btn--secondary btn--small">
                Add from...
                <Icon src={chevron} size={16} />
              </span>
            </button>
          </>
        ) : (
          <div
            className="media-grid"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {items.map((item) => {
              const processing = processingIds.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`media-grid__tile${processing ? ' media-grid__tile--processing' : ''}`}
                >
                  {item.kind === 'video' ? (
                    <video src={item.src} className="media-grid__img" muted playsInline />
                  ) : (
                    <img src={item.src} alt="" className="media-grid__img" />
                  )}
                  <AnimatePresence>
                    {processing ? (
                      <motion.div
                        className="media-grid__processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: duration.fast, ease: ease.soft }}
                        aria-hidden="true"
                      >
                        <LoadingSpinner size={28} />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}
            <button
              type="button"
              className="media-grid__tile media-grid__tile--add"
              aria-label="Add more media"
              onClick={() => inputRef.current?.click()}
            >
              <Icon src={add} size={16} />
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files ?? [])
            e.target.value = ''
          }}
        />
      </div>

      <FieldPractices
        active={filled}
        items={practices}
        className="media-practices"
        style={{ top: 'calc(32px + 64px)' }}
      />
    </div>
  )
}
