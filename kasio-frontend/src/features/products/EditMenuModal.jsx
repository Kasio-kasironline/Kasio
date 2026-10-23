import { useEffect, useState, useRef } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { getInitials } from '../../utils/formatters'
import { supabase } from '../../lib/supabase'

/**
 * EditMenuModal component:
 * Modal untuk mengedit menu yang sudah ada (nama, harga, kategori, deskripsi, dan foto).
 * Mengikuti Apple HIG aesthetic dengan tata letak bersih dan data terisi otomatis.
 */
export default function EditMenuModal({
  isOpen,
  onClose,
  menuItem,
  onUpdateMenu,
  categories = [],
  business,
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  // Inisialisasi data form saat menuItem berubah
  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name || '')
      setPrice(menuItem.price !== undefined ? menuItem.price.toString() : '')
      setDescription(menuItem.description || '')

      // Jika data lama hanya emoji, abaikan agar otomatis memakai inisial produk
      const hasRealImage =
        menuItem.image &&
        (menuItem.image.startsWith('http') || menuItem.image.startsWith('data:'))
      setImagePreview(hasRealImage ? menuItem.image : '')

      setImageFile(null)
      setImageUrlInput('')
      setShowUrlInput(false)
      setErrors({})

      const availableCategories = categories.filter((c) => c !== 'Semua')
      if (menuItem.category && availableCategories.includes(menuItem.category)) {
        setCategory(menuItem.category)
        setCustomCategory('')
      } else if (menuItem.category) {
        setCategory('new')
        setCustomCategory(menuItem.category)
      } else {
        setCategory(availableCategories[0] || 'new')
        setCustomCategory('')
      }
    }
  }, [menuItem, categories])

  if (!isOpen || !menuItem) return null

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        image: 'File harus berupa gambar (PNG, JPG, atau WebP).',
      }))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Ukuran foto maksimal 2 MB.',
      }))
      return
    }

    setErrors((prev) => ({ ...prev, image: undefined }))
    setImageFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return
    setImagePreview(imageUrlInput.trim())
    setImageFile(null)
    setShowUrlInput(false)
    setErrors((prev) => ({ ...prev, image: undefined }))
  }

  const validate = () => {
    const nextErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Nama menu wajib diisi.'
    }

    const availableCategories = categories.filter((c) => c !== 'Semua')
    const isNewCategory = category === 'new'
    const finalCategoryName = isNewCategory ? customCategory.trim() : category

    if (!finalCategoryName) {
      nextErrors.category = 'Kategori wajib dipilih atau diisi.'
    } else if (
      isNewCategory &&
      availableCategories.length >= 5 &&
      !availableCategories.some(
        (c) => c.toLowerCase() === finalCategoryName.toLowerCase()
      )
    ) {
      nextErrors.category =
        'Maksimal 5 kategori telah tercapai. Pilih kategori yang ada atau kelola kategori di Pengaturan Tambahan.'
    }

    const numericPrice = Number(price)
    if (!price || isNaN(numericPrice) || numericPrice < 0) {
      nextErrors.price = 'Harga harus berupa angka yang valid.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)

    try {
      let finalImageUrl = imagePreview

      // Unggah gambar baru jika ada file lokal yang dipilih
      if (imageFile && business?.id) {
        try {
          const fileExt = imageFile.name.split('.').pop()
          const fileName = `${business.id}/menu-${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('menu-images')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: true,
            })

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('menu-images')
              .getPublicUrl(fileName)
            finalImageUrl = publicUrlData?.publicUrl || imagePreview
          }
        } catch (uploadErr) {
          console.warn(
            'Upload Supabase Storage gagal, menggunakan Data URL:',
            uploadErr
          )
        }
      }

      const finalCategory =
        category === 'new' ? customCategory.trim() : category

      await onUpdateMenu({
        id: menuItem.id,
        name: name.trim(),
        category: finalCategory,
        price: Number(price),
        description: description.trim(),
        image: finalImageUrl || null,
      })

      onClose()
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Gagal menyimpan perubahan menu.',
      }))
    } finally {
      setIsSaving(false)
    }
  }

  const existingCategories = categories.filter((c) => c !== 'Semua')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/8 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-black/6">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Edit Menu
            </h2>
            <p className="text-[13px] text-[#86868B] mt-0.5">
              Ubah rincian informasi dan foto untuk menu ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Edit */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errors.submit && (
            <div className="p-3 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[13px] font-medium">
              {errors.submit}
            </div>
          )}

          {/* Nama Menu */}
          <Input
            label="Nama Menu"
            placeholder="Contoh: Kopi Susu Gula Aren"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            error={errors.name}
            required
            autoFocus
          />

          {/* Kategori */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[13px] font-medium text-[#1D1D1F]">
              Kategori <span className="text-[#FF3B30]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (errors.category)
                    setErrors((prev) => ({ ...prev, category: undefined }))
                }}
                className="w-full px-3.5 py-2.5 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/15 text-[14px] text-[#1D1D1F] transition-all outline-none"
              >
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="new">+ Kategori Baru</option>
              </select>

              {category === 'new' && (
                <input
                  type="text"
                  placeholder="Nama kategori..."
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value)
                    if (errors.category)
                      setErrors((prev) => ({ ...prev, category: undefined }))
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/15 text-[14px] text-[#1D1D1F] transition-all outline-none"
                />
              )}
            </div>
            {errors.category && (
              <p className="text-[12px] text-[#FF3B30] font-medium mt-1">
                {errors.category}
              </p>
            )}
          </div>

          {/* Harga */}
          <Input
            label="Harga (Rp)"
            type="number"
            placeholder="Contoh: 18000"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value)
              if (errors.price)
                setErrors((prev) => ({ ...prev, price: undefined }))
            }}
            error={errors.price}
            required
            min="0"
          />

          {/* Deskripsi */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[13px] font-medium text-[#1D1D1F]">
              Deskripsi Singkat{' '}
              <span className="text-[#86868B] font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Espresso ganda dengan susu segar dan gula aren asli..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5F5F7] rounded-xl border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/15 text-[14px] text-[#1D1D1F] transition-all outline-none resize-none placeholder-[#86868B]"
            />
          </div>

          {/* Bagian Foto Produk */}
          <div className="space-y-2 text-left pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[13px] font-medium text-[#1D1D1F]">
                Foto Menu{' '}
                <span className="text-[#86868B] font-normal">
                  (Jika kosong otomatis menggunakan inisial)
                </span>
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview('')
                    setImageUrlInput('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-[12px] font-semibold text-[#FF3B30] hover:underline cursor-pointer"
                >
                  Hapus Foto
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 p-3.5 bg-[#F5F5F7] rounded-2xl border border-black/4">
              {/* Box Preview: Foto atau Inisial */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-black/8 shadow-xs flex items-center justify-center overflow-hidden shrink-0 relative">
                {imagePreview &&
                (imagePreview.startsWith('http') ||
                  imagePreview.startsWith('data:')) ? (
                  <img
                    src={imagePreview}
                    alt="Preview Menu"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0071E3]/10 to-[#0071E3]/25 border border-[#0071E3]/15 flex flex-col items-center justify-center text-[#0071E3] select-none p-1">
                    <span className="font-extrabold text-lg sm:text-xl tracking-wider">
                      {getInitials(name)}
                    </span>
                    <span className="text-[9px] text-[#86868B] mt-0.5 uppercase tracking-tight font-medium">
                      Inisial
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="edit-menu-photo-input"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="edit-menu-photo-input"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1D1D1F] bg-white hover:bg-neutral-50 border border-black/10 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <svg
                      className="w-4 h-4 text-[#0071E3]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Ganti Foto</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[12px] font-medium text-[#0071E3] hover:underline px-1 py-1 cursor-pointer"
                  >
                    {showUrlInput ? 'Tutup URL' : 'Gunakan URL Foto'}
                  </button>
                </div>

                <p className="text-[11px] text-[#86868B] leading-tight">
                  Format JPG, PNG, atau WebP. Maksimal ukuran 2 MB.
                </p>
              </div>
            </div>

            {showUrlInput && (
              <div className="flex items-center gap-2 pt-1 animate-fade-in">
                <input
                  type="url"
                  placeholder="https://contoh.com/foto-kopi.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#F5F5F7] rounded-xl border border-black/10 text-[13px] text-[#1D1D1F] outline-none focus:border-[#0071E3]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleApplyUrl}
                >
                  Terapkan
                </Button>
              </div>
            )}

            {errors.image && (
              <p className="text-[12px] text-[#FF3B30] font-medium mt-1">
                {errors.image}
              </p>
            )}
          </div>

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
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}