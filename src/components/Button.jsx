export function Button({
  children,
  variant = "secondary",
  size = "base",
  iconStart,
  iconEnd,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      {...props}
    >
      {iconStart}
      <span>{children}</span>
      {iconEnd}
    </button>
  )
}
