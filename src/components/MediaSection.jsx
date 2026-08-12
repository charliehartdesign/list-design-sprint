import { useCallback, useRef, useState } from 'react'
import { Icon } from './Icon'
import { AiOrangeSquare } from './AiOrangeSquare'
import addphoto from '../assets/icons/addphoto.svg'
import add from '../assets/icons/add.svg'
import chevron from '../assets/icons/chevron.svg'
import check from '../assets/icons/check.svg'
import scoreClose from '../assets/icons/score-close.svg'
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
 */
export function MediaSection({ mediaRef, onMediaChange }) {
  const [items, setItems] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const commit = useCallback(
    (next) => {
      setItems(next)
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
            <div className="tip">
              <div className="tip__heading">
                <span>Tip</span>
                <AiOrangeSquare size={12.5} />
              </div>
              <p>Start with media and get help filling out the rest</p>
            </div>
          </>
        ) : (
          <div
            className="media-grid"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {items.map((item) => (
              <div key={item.id} className="media-grid__tile">
                {item.kind === 'video' ? (
                  <video src={item.src} className="media-grid__img" muted playsInline />
                ) : (
                  <img src={item.src} alt="" className="media-grid__img" />
                )}
              </div>
            ))}
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

      {filled ? (
        <aside className="media-practices" aria-label="Best practices">
          <p className="media-practices__heading">Best practices</p>
          <ul className="media-practices__list">
            {practices.map((practice) => (
              <li key={practice.id} className="media-practices__row">
                <Icon
                  src={practice.done ? check : scoreClose}
                  size={16}
                  alt={practice.done ? 'Complete' : 'Incomplete'}
                />
                <span>{practice.label}</span>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  )
}
