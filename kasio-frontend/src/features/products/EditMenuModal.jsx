import { useEffect, useState, useRef } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { getInitials } from '../../utils/formatters'
import { compressImage } from '../../utils/imageCompressor'
import { supabase } from '../../lib/supabase'
import { Trash, Camera } from 'lucide-react'

/**
 * EditMenuModal component:
 * Modal untuk mengedit menu (nama, harga, kategori, deskripsi, foto,
 * status ketersediaan, serta aksi hapus menu).
 * Mengikuti Apple HIG aesthetic dengan tata letak bersih dan kontrol intuitif.
 */
export default function EditMenuModal({
  isOpen,
  onClose,
  menuItem,
  onUpdateMenu,
  onDeleteMenu,
  categories = [],
  business,
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  // Inisialisasi data form saat menuItem berubah
  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name || '')
      setPrice(menuItem.price !== undefined ? menuItem.price.toString() : '')
      setDescription(menuItem.description || '')
      setIsAvailable(menuItem.isAvailable !== false)

      // Jika data lama hanya emoji, abaikan agar otomatis memakai inisial produk
      const hasRealImage =
        menuItem.image &&
        (menuItem.image.startsWith('http') || menuItem.image.startsWith('data:'))
      setImagePreview(hasRealImage ? menuItem.image : '')

      setImageFile(null)
      setImageUrlInput('')
      setShowUrlInput(false)
      setIsConfirmingDelete(false)
      setIsDeleting(false)
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

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        image: 'File harus berupa gambar (PNG, JPG, atau WebP).',
      }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Ukuran foto maksimal 10 MB.',
      }))
      return
    }

    try {
      setErrors((prev) => ({ ...prev, image: undefined }))
      const { file: compressedFile, dataUrl } = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.8,
      })

      setImageFile(compressedFile)
      setImagePreview(dataUrl)
    } catch (err) {
      console.error('Gagal mengompresi gambar:', err)
      setErrors((prev) => ({ ...prev, image: 'Gagal memproses gambar.' }))
    }
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
          const fileExt = imageFile.name.split('.').pop() || 'jpg'
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
        isAvailable,
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

  const handleDelete = async () => {
    if (!onDeleteMenu || !menuItem?.id) return
    setIsDeleting(true)
    try {
      await onDeleteMenu(menuItem.id)
      setIsConfirmingDelete(false)
      onClose()
    } catch (err) {
      console.error('Gagal menghapus menu:', err)
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Gagal menghapus menu.',
      }))
      setIsConfirmingDelete(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const existingCategories = categories.filter((c) => c !== 'Semua')

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
        <div
          className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/8 relative max-h-[92vh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Modal */}
          <div className="flex items-center justify-between pb-4 border-b border-black/6">
            <div>
              <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
                Edit Menu
              </h2>
              <p className="text-[13px] text-[#86868B] mt-0.5">
                Ubah rincian, status ketersediaan, atau hapus menu dari katalog.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-all cursor-pointer disabled:opacity-50"
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

            {/* Status Ketersediaan Menu (Switch Toggle Apple HIG) */}
            <div className="flex items-center justify-between p-3.5 bg-[#F5F5F7] rounded-2xl border border-black/4">
              <div className="text-left">
                <span className="block text-[13px] font-semibold text-[#1D1D1F]">
                  Status Ketersediaan
                </span>
                <span className="block text-[12px] text-[#86868B] mt-0.5">
                  {isAvailable
                    ? 'Tersedia untuk dipesan di kasir'
                    : 'Stok habis (tidak dapat dipesan di kasir)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? 'bg-[#34C759]' : 'bg-[#D1D1D6]'
                }`}
                role="switch"
                aria-checked={isAvailable}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

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
                      <Camera className="text-[#0071E3] w-4 h-4"/>
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
                    Format JPG, PNG, atau WebP. Maksimal 10 MB (otomatis dikompresi).
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

            {/* Tombol Aksi: Hapus di kiri, Batal & Simpan di kanan */}
            <div className="pt-3 flex items-center justify-between gap-2.5 border-t border-black/6">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isSaving || isDeleting}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#FF3B30] hover:text-[#D70015] hover:bg-[#FF3B30]/10 px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Trash className="w-4 h-4"/>
                <span>Hapus Menu</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSaving || isDeleting}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-black/8 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center mx-auto">
              <Trash className="w-4 h-4"/>
            </div>

            <div>
              <h3 className="text-[17px] font-bold text-[#1D1D1F]">
                Hapus Menu?
              </h3>
              <p className="text-[13px] text-[#86868B] mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus menu{' '}
                <strong className="text-[#1D1D1F]">{name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 font-semibold text-[13px] text-[#1D1D1F] hover:bg-black/5 transition-all cursor-pointer"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FF3B30] hover:bg-[#D70015] font-semibold text-[13px] text-white transition-all shadow-sm shadow-[#FF3B30]/20 cursor-pointer disabled:opacity-60"
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}