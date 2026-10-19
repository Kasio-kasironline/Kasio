import { useState } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const EMOJI_OPTIONS = ['☕', '🧊', '🍵', '🧋', '🍳', '🍜', '🥪', '🍟', '🥟', '🍰', '🥤', '🍽️']

let menuIdCounter = 100
function getNextMenuId() {
  menuIdCounter += 1
  return `menu-${menuIdCounter}`
}

/**
 * AddMenuModal component for creating a new menu item.
 * Supports menu name, category, price in IDR, short description,
 * icon/emoji selector, and instant validation.
 */
export default function AddMenuModal({
  isOpen,
  onClose,
  onAddMenu,
  categories = [],
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[1] || 'Kopi')
  const [customCategory, setCustomCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('☕')
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const validate = () => {
    const nextErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Nama menu wajib diisi'
    }

    const finalCategory = category === 'new' ? customCategory.trim() : category
    if (!finalCategory) {
      nextErrors.category = 'Kategori wajib dipilih atau diisi'
    }

    const numericPrice = parseInt(price, 10)
    if (!price || isNaN(numericPrice) || numericPrice < 0) {
      nextErrors.price = 'Harga harus berupa angka dan minimal 0'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleReset = () => {
    setName('')
    setCategory(categories[1] || 'Kopi')
    setCustomCategory('')
    setPrice('')
    setDescription('')
    setSelectedEmoji('☕')
    setErrors({})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const finalCategory = category === 'new' ? customCategory.trim() : category
    const numericPrice = parseInt(price, 10)

    const newItem = {
      id: getNextMenuId(),
      name: name.trim(),
      category: finalCategory,
      price: numericPrice,
      description: description.trim() || 'Menu lezat racikan spesial.',
      image: selectedEmoji,
      isAvailable: true,
    }

    onAddMenu(newItem)
    handleReset()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-6 sm:p-7 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/6">
          <div>
            <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Tambah Menu Baru
            </h3>
            <p className="text-[13px] text-[#86868B] mt-0.5">
              Menu baru akan langsung tersedia di kasir POS.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Menu Name */}
          <Input
            label="Nama Menu"
            id="menu-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
            }}
            placeholder="Contoh: Kopi Susu Pandan"
            error={errors.name}
            required
          />

          {/* Category & Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category Select */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="menu-category" className="text-[13px] font-medium text-[#1D1D1F]">
                Kategori <span className="text-[#FF3B30]">*</span>
              </label>
              <select
                id="menu-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
                }}
                className="w-full py-2.5 px-3.5 text-[15px] text-[#1D1D1F] bg-white rounded-xl border border-black/12 hover:border-black/24 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all"
              >
                {categories
                  .filter((cat) => cat !== 'Semua')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                <option value="new">+ Kategori Baru...</option>
              </select>

              {category === 'new' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ketik kategori baru..."
                  className="mt-1 w-full py-2 px-3 text-[14px] bg-white rounded-xl border border-black/12 focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none"
                />
              )}
              {errors.category && (
                <p className="text-[12px] font-medium text-[#FF3B30] mt-0.5">{errors.category}</p>
              )}
            </div>

            {/* Price Input */}
            <Input
              label="Harga Jual (Rp)"
              id="menu-price"
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (errors.price) setErrors((prev) => ({ ...prev, price: '' }))
              }}
              placeholder="Contoh: 18000"
              error={errors.price}
              required
              icon={<span className="font-bold text-[#86868B] text-xs">Rp</span>}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="menu-description" className="text-[13px] font-medium text-[#1D1D1F]">
              Deskripsi Singkat <span className="text-[#86868B] font-normal">(Opsional)</span>
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

          {/* Emoji / Icon Selector */}
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

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-black/6">
            <Button variant="secondary" size="md" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md">
              Simpan Menu
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}