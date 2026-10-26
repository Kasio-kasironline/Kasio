import { useState } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import {Phone, Mail, Eye, EyeOff} from 'lucide-react'

/**
 * RegisterForm component for UMKM store owner onboarding.
 * Captures owner name, business name, WhatsApp/phone, email, and password.
 * Connects directly to Supabase Auth and registers business details.
 * Follows Apple HIG design with client-side validation, error handling, and demo autofill.
 */
export default function RegisterForm({ onRegisterSuccess }) {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    if (errors[id] || errors.general) {
      setErrors((prev) => ({ ...prev, [id]: '', general: '' }))
    }
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.ownerName.trim()) {
      nextErrors.ownerName = 'Nama pemilik wajib diisi'
    }

    if (!formData.businessName.trim()) {
      nextErrors.businessName = 'Nama usaha wajib diisi'
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Nomor WhatsApp wajib diisi'
    } else if (!/^[0-9+-\s]{8,15}$/.test(formData.phone.trim())) {
      nextErrors.phone = 'Nomor telepon tidak valid'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email tidak boleh kosong'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Format email tidak valid'
    }

    if (!formData.password) {
      nextErrors.password = 'Kata sandi tidak boleh kosong'
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Kata sandi minimal 6 karakter'
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi tidak cocok'
    }

    if (!agreeTerms) {
      nextErrors.agreeTerms = 'Anda harus menyetujui syarat & ketentuan'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setRegisterSuccess(false)
    setErrors({})

    const res = await register({
      email: formData.email,
      password: formData.password,
      ownerName: formData.ownerName,
      businessName: formData.businessName,
      phone: formData.phone,
    })

    if (!res.success) {
      setIsLoading(false)
      setErrors({ general: res.error })
      return
    }

    setIsLoading(false)
    setRegisterSuccess(true)

    if (res.needsConfirmation) {
      setSuccessMessage(
        'Pendaftaran berhasil! Tautan konfirmasi telah dikirim ke email Anda. Silakan verifikasi untuk mulai menggunakan Kasio.'
      )
    } else {
      setSuccessMessage(
        `Toko ${formData.businessName} berhasil didaftarkan! Mengalihkan ke kasir...`
      )
      if (onRegisterSuccess) {
        setTimeout(onRegisterSuccess, 800)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
      {/* Error Alert Banner */}
      {errors.general && (
        <div
          role="alert"
          className="p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/25 rounded-2xl flex items-start gap-2.5 transition-all"
        >
          <span className="text-[#FF3B30] text-base shrink-0 mt-0.5">⚠️</span>
          <div className="text-[13px] text-[#1D1D1F]">
            <p className="font-semibold text-[#FF3B30]">Gagal Mendaftar</p>
            <p className="text-[#86868B] mt-0.5">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {registerSuccess && (
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
            <p className="font-semibold text-[#34C759]">Registrasi Berhasil!</p>
            <p className="text-[#86868B] mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Two Column Row: Owner Name & Business Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Nama Pemilik"
          id="ownerName"
          type="text"
          value={formData.ownerName}
          onChange={handleChange}
          placeholder="Contoh: Budi Santoso"
          error={errors.ownerName}
          required
        />

        <Input
          label="Nama Usaha / Toko"
          id="businessName"
          type="text"
          value={formData.businessName}
          onChange={handleChange}
          placeholder="Contoh: Kopi Makmur"
          error={errors.businessName}
          required
        />
      </div>

      {/* Two Column Row: WhatsApp & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="No. WhatsApp / HP"
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="08123456789"
          error={errors.phone}
          required
          icon={
            <Phone className="w-4 h-4"/>
          }
        />

        <Input
          label="Email Usaha"
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="nama@tokoanda.com"
          error={errors.email}
          required
          icon={
            <Mail className="w-4 h-4"/>
          }
        />
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Kata Sandi"
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          placeholder="Min. 6 karakter"
          error={errors.password}
          required
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

        <Input
          label="Ulangi Kata Sandi"
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Ulangi kata sandi"
          error={errors.confirmPassword}
          required
        />
      </div>

      {/* Terms Agreement Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-[12px] text-[#86868B]">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked)
              if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: '' }))
            }}
            className="w-4 h-4 mt-0.5 rounded-md border-black/[0.16] text-[#0071E3] focus:ring-[#0071E3]/20 accent-[#0071E3]"
          />
          <span className="leading-snug">
            Saya menyetujui bahwa data usaha saya disimpan dengan aman dan terisolasi untuk operasional kasir Kasio.
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="text-[12px] font-medium text-[#FF3B30] mt-1">{errors.agreeTerms}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2 font-semibold"
      >
        Daftar & Mulai Jualan
      </Button>
    </form>
  )
}