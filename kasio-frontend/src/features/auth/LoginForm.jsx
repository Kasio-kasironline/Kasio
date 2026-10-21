import { useState } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'

/**
 * LoginForm component with Apple-inspired visuals and Supabase Auth integration.
 * Includes email validation, password visibility toggle, remember-me toggle,
 * demo credentials filler, and error/success feedback.
 */
export default function LoginForm({ onLoginSuccess }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [authSuccess, setAuthSuccess] = useState(false)

  // Quick fill helper for quick UI testing
  const handleFillDemo = () => {
    setEmail('pemilik@kopimakmur.id')
    setPassword('Kasio2026!')
    setErrors({})
    setAuthSuccess(false)
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!email.trim()) {
      nextErrors.email = 'Email tidak boleh kosong'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Format email tidak valid'
    }

    if (!password) {
      nextErrors.password = 'Kata sandi tidak boleh kosong'
    } else if (password.length < 6) {
      nextErrors.password = 'Kata sandi minimal 6 karakter'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setAuthSuccess(false)
    setErrors({})

    const res = await login(email, password)

    if (!res.success) {
      setIsLoading(false)
      setErrors({ general: res.error })
      return
    }

    setIsLoading(false)
    setAuthSuccess(true)
    if (onLoginSuccess) {
      setTimeout(onLoginSuccess, 500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      {/* Error Alert Banner */}
      {errors.general && (
        <div
          role="alert"
          className="p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/25 rounded-2xl flex items-start gap-2.5 transition-all"
        >
          <span className="text-[#FF3B30] text-base shrink-0 mt-0.5">⚠️</span>
          <div className="text-[13px] text-[#1D1D1F]">
            <p className="font-semibold text-[#FF3B30]">Gagal Masuk</p>
            <p className="text-[#86868B] mt-0.5">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {authSuccess && (
        <div
          role="status"
          className="p-3.5 bg-[#34C759]/10 border border-[#34C759]/25 rounded-2xl flex items-start gap-2.5 transition-all"
        >
          <svg
            className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-[13px] text-[#1D1D1F]">
            <p className="font-semibold text-[#34C759]">Login Berhasil!</p>
            <p className="text-[#86868B] mt-0.5">
              Mengarahkan Anda ke halaman kasir...
            </p>
          </div>
        </div>
      )}

      {/* Demo Credentials Helper Pill */}
      <div className="flex items-center justify-between p-2.5 bg-black/[0.03] border border-black/[0.06] rounded-xl text-[12px]">
        <div className="flex items-center gap-1.5 text-[#86868B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
          <span>Akun Demo Kasir UMKM</span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-[#0071E3] font-medium hover:underline cursor-pointer"
        >
          Gunakan Demo
        </button>
      </div>

      {/* Email Input */}
      <Input
        label="Email Usaha / Kasir"
        id="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
        }}
        placeholder="nama@tokoanda.com"
        error={errors.email}
        autoComplete="email"
        required
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        }
      />

      {/* Password Input */}
      <Input
        label="Kata Sandi"
        id="password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
        }}
        placeholder="Masukkan kata sandi"
        error={errors.password}
        autoComplete="current-password"
        required
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            className="text-[#86868B] hover:text-[#1D1D1F] transition-colors p-1"
          >
            {showPassword ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        }
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-[13px] pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded-md border-black/16 text-[#0071E3] focus:ring-[#0071E3]/20 accent-[#0071E3]"
          />
          <span className="text-[#1D1D1F]">Ingat saya</span>
        </label>

        <a
          href="#forgot-password"
          onClick={(e) => {
            e.preventDefault()
            alert('Fitur reset kata sandi akan dihubungkan dengan Supabase Auth.')
          }}
          className="text-[#0071E3] hover:underline"
        >
          Lupa kata sandi?
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2 font-semibold"
      >
        Masuk ke Kasir
      </Button>
    </form>
  )
}