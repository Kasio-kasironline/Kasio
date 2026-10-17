/**
 * Button component designed following Apple Human Interface Guidelines.
 * Features rounded squircle edges, tactile active press scale, and loading spinner state.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon = null,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]'

  const variantStyles = {
    primary:
      'bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062C4] text-white shadow-sm focus-visible:ring-[#0071E3]',
    secondary:
      'bg-black/[0.05] hover:bg-black/[0.08] active:bg-black/[0.12] text-[#1D1D1F] focus-visible:ring-black/20',
    ghost:
      'text-[#0071E3] hover:bg-[#0071E3]/10 active:bg-[#0071E3]/20 focus-visible:ring-[#0071E3]',
    destructive:
      'bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 active:bg-[#FF3B30]/30 text-[#FF3B30] focus-visible:ring-[#FF3B30]',
  }

  const sizeStyles = {
    sm: 'text-[13px] px-3.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-[15px] px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-[16px] px-5 py-3 rounded-xl gap-2.5',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Memproses...</span>
        </>
      ) : (
        <>
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}