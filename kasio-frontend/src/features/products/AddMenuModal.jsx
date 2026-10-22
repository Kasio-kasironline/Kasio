
import { useEffect, useState } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const EMOJI_OPTIONS = [
  '☕', '🧊', '🍵', '🧋', '🍳', '🍜',
  '🥪', '🍟', '🥟', '🍰', '🥤', '🍽️',
]

export default function AddMenuModal({
  isOpen,
  onClose,
  onAddMenu,
  categories = [],
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[1] || 'new')
  const [customCategory, setCustomCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('☕')
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Sesuaikan kategori awal jika data kategori baru selesai dimuat.
  useEffect(() => {
    setCategory((currentCategory) => {
      const availableCategories = categories.filter(
        (item) => item !== 'Semua'
      )

      if (
        currentCategory !== 'new' &&
        availableCategories.includes(currentCategory)
      ) {
        return currentCategory
      }

      if (currentCategory === 'new' && availableCategories.length === 0) {
        return 'new'
      }

      if (
        currentCategory === 'new' &&
        customCategory.trim() !== ''
      ) {
        return 'new'
      }

      return availableCategories[0] || 'new'
    })
  }, [categories, customCategory])

  if (!isOpen) return null

  const validate = () => {
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Nama menu wajib diisi'
    }

    const finalCategory =
      category === 'new' ? customCategory.trim() : category

    if (!finalCategory || finalCategory === 'Semua') {
      nextErrors.category = 'Kategori wajib dipilih atau diisi'
    }

    const numericPrice = Number(price)

    if (
      price.trim() === '' ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      nextErrors.price = 'Harga harus berupa angka dan minimal 0'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleReset = () => {
    setName('')
    setCategory(categories[1] || 'new')
    setCustomCategory('')
    setPrice('')
    setDescription('')
    setSelectedEmoji('☕')
    setErrors({})
  }

  // Simpan menu ke Supabase melalui handler di App.jsx.
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSaving || !validate()) return

    const finalCategory =
      category === 'new' ? customCategory.trim() : category

    const newItem = {
      name: name.trim(),
      category: finalCategory,
      price: Number(price),
      description: description.trim() || null,
      image: selectedEmoji,
      isAvailable: true,
    }

    try {
      setIsSaving(true)
      setErrors((prev) => ({ ...prev, submit: '' }))

      // Tunggu sampai insert ke Supabase berhasil.
      await onAddMenu(newItem)

      handleReset()
      onClose()
    } catch (error) {
      console.error('Gagal menyimpan menu:', error)

      setErrors((prev) => ({
        ...prev,
        submit: error.message || 'Gagal menyimpan menu. Silakan coba lagi.',
      }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-menu-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-6 sm:p-7 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/6">
          <div>
            <h3
              id="add-menu-title"
              className="text-xl font-bold text-[#1D1D1F] tracking-tight"
            >
              Tambah Menu Baru
            </h3>

            <p className="text-[13px] text-[#86868B] mt-0.5">
              Menu baru akan langsung tersedia di kasir POS.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Nama Menu */}
          <Input
            label="Nama Menu"
            id="menu-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: '' }))
              }
            }}
            placeholder="Contoh: Kopi Susu Pandan"
            error={errors.name}
            required
          />

          {/* Kategori dan Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="menu-category"
                className="text-[13px] font-medium text-[#1D1D1F]"
              >
                Kategori <span className="text-[#FF3B30">*</span>
              </label>

              <select
                id="menu-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setErrors((prev) => ({
                    ...prev,
                    category: '',
                    submit: '',
                  }))
                }}
                className="w-full py-2.5 px-3.5 text-[15px] text-[#1D1D1F] bg-white rounded-xl border border-black/12 hover:border-black/24 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all"
              >
                {categories
                  .filter((item) => item !== 'Semua')
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}

                <option value="new">+ Kategori Baru...</option>
              </select>

              {category === 'new' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value)
                    setErrors((prev) => ({
                      ...prev,
                      category: '',
                      submit: '',
                    }))
                  }}
                  placeholder="Ketik kategori baru..."
                  className="mt-1 w-full py-2 px-3 text-[14px] bg-white rounded-xl border border-black/12 focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none"
                />
              )}

              {errors.category && (
                <p className="text-[12px] font-medium text-[#FF3B30] mt-0.5">
                  {errors.category}
                </p>
              )}
            </div>

            <Input
              label="Harga Jual (Rp)"
              id="menu-price"
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                setErrors((prev) => ({
                  ...prev,
                  price: '',
                  submit: '',
                }))
              }}
              placeholder="Contoh: 18000"
              error={errors.price}
              required
              icon={
                <span className="font-bold text-[#86868B] text-xs">
                  Rp
                </span>
              }
            />
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-1.5 text-left">
            <label
              htmlFor="menu-description"
              className="text-[13px] font-medium text-[#1D1D1F]"
            >
              Deskripsi Singkat{' '}
              <span className="text-[#86868B] font-normal">
                (Opsional)
              </span>
            </label>

            <textarea
              id="menu-description"
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan bahan, rasa, atau keistimewaan menu ini..."
              className="w-full py-2 px-3.5 text-[14px] text-[#1D1D1F] placeholder-[#86868B] bg-white rounded-xl border border-black/12 hover:border-black/24 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all resize-none"
            />
          </div>

          {/* Pemilihan Ikon */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[13px] font-medium text-[#1D1D1F]">
              Pilih Ikon Menu
            </label>

            <div className="flex flex-wrap gap-2 p-2.5 bg-[#F5F5F7] rounded-2xl border border-black/4">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  aria-label={`Pilih ikon ${emoji}`}
                  aria-pressed={selectedEmoji === emoji}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                    selectedEmoji === emoji
                      ? 'bg-white shadow-sm ring-2 ring-[#0071E3] scale-105'
                      : 'hover:bg-white/60'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Pesan error dari proses penyimpanan */}
          {errors.submit && (
            <p
              role="alert"
              className="text-sm text-[#FF3B30] bg-red-50 rounded-xl p-3"
            >
              {errors.submit}
            </p>
          )}

          {/* Tombol Aksi */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-black/6">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Menu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
