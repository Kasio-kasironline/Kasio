import { useState } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

/**
 * RegisterForm component for UMKM store owner onboarding.
 * Captures owner name, business name, WhatsApp/phone, email, and password.
 * Follows Apple HIG design with client-side validation, demo autofill,
 * password toggle, and interactive registration simulation.
 */
export default function RegisterForm({ onRegisterSuccess }) {
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

  // Quick fill helper for testing UI
  const handleFillDemo = () => {
    setFormData({
      ownerName: 'Budi Santoso',
      businessName: 'Kopi & Snack Makmur',
      phone: '081234567890',
      email: 'budi@kopimakmur.id',
      password: 'Kasio2026!',
      confirmPassword: 'Kasio2026!',
    })
    setAgreeTerms(true)
    setErrors({})
    setRegisterSuccess(false)
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }))
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setRegisterSuccess(false)

    // Simulate API registration delay (UI only)
    setTimeout(() => {
      setIsLoading(false)
      setRegisterSuccess(true)
      if (onRegisterSuccess) {
        setTimeout(onRegisterSuccess, 800)
      }
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
      {/* Success Banner Simulation */}
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
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-[13px] text-[#1D1D1F]">
            <p className="font-semibold text-[#34C759]">Registrasi Berhasil!</p>
            <p className="text-[#86868B] mt-0.5">
              Toko <strong>{formData.businessName}</strong> siap digunakan. Mengalihkan ke kasir...
            </p>
          </div>
        </div>
      )}

      {/* Demo Credentials Helper Pill */}
      <div className="flex items-center justify-between p-2.5 bg-black/[0.03] border border-black/[0.06] rounded-xl text-[12px]">
        <div className="flex items-center gap-1.5 text-[#86868B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
          <span>Isi Cepat Contoh Data Usaha</span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-[#0071E3] font-medium hover:underline cursor-pointer"
        >
          Gunakan Contoh
        </button>
      </div>

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
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
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
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
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