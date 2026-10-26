import { useState } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import {Mail, Lock, Eye, EyeOff} from 'lucide-react'

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
          <Mail className="w-4 h-4"/>
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
          <Lock className="w-4 h-4"/>
        }
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            className="text-[#86868B] hover:text-[#1D1D1F] transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4"/>
            ) : (
              <Eye className="w-4 h-4"/>
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