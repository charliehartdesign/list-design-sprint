import './LoadingSpinner.css'

/** Collage-style indeterminate spinner — light track, dark arc. */
export function LoadingSpinner({ size = 24, className = '', label = 'Loading' }) {
  return (
    <span
      className={`loading-spinner ${className}`.trim()}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <span className="loading-spinner__arc" aria-hidden="true" />
    </span>
  )
}
