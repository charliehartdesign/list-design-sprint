export function Icon({ src, size = 16, alt = "" }) {
  return (
    <span
      className="icon"
      style={{ width: size, height: size }}
      aria-hidden={alt ? undefined : true}
    >
      <img src={src} alt={alt} width={size} height={size} />
    </span>
  )
}
