/**
 * Form Input component styled according to Apple HIG.
 * Features stacked label, subtle border, Apple-style focus ring, and inline error feedback.
 */
export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon = null,
  rightElement = null,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-[#1D1D1F] flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-[#FF3B30] ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div
        className={`relative flex items-center bg-white rounded-xl border transition-all duration-150 ${
          error
            ? 'border-[#FF3B30] focus-within:border-[#FF3B30] focus-within:ring-4 focus-within:ring-[#FF3B30]/15'
            : 'border-black/[0.12] hover:border-black/[0.24] focus-within:border-[#0071E3] focus-within:ring-4 focus-within:ring-[#0071E3]/15'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-black/[0.02]' : ''}`}
      >
        {icon && (
          <span className="pl-3.5 text-[#86868B] flex items-center pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full py-2.5 text-[15px] text-[#1D1D1F] placeholder-[#86868B] bg-transparent outline-none ${
            icon ? 'pl-2' : 'pl-3.5'
          } ${rightElement ? 'pr-2' : 'pr-3.5'}`}
          {...props}
        />

        {rightElement && (
          <div className="pr-3 flex items-center">{rightElement}</div>
        )}
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          className="text-[12px] font-medium text-[#FF3B30] flex items-center gap-1 mt-0.5"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[12px] text-[#86868B] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
}