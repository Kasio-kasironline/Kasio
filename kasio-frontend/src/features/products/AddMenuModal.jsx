import { useEffect, useState, useRef } from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { getInitials } from '../../utils/formatters'
import { compressImage } from '../../utils/imageCompressor'
import { supabase } from '../../lib/supabase'
import { Camera, ChevronDown, Check } from 'lucide-react'

export default function AddMenuModal({
  isOpen,
  onClose,
  onAddMenu,
  categories = [],
  business,
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[1] || 'new')
  const [customCategory, setCustomCategory] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const categoryDropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  // Tutup dropdown otomatis saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setIsCategoryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

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

    const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'File harus berupa gambar (PNG, JPG, atau WebP).' }))
      return
    }

    // Mendukung ukuran kamera HP hingga 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Ukuran foto maksimal 5 MB.' }))
      return
    }

    try {
      setErrors((prev) => ({ ...prev, image: '' }))

      // Kompres otomatis ke maksimal 600x600 px (menyusut ke ~40-70 KB)
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
    setImageFile(null)
    setImagePreview('')
    setImageUrlInput('')
    setShowUrlInput(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setErrors({})
  }

  // Simpan menu ke Supabase melalui handler di App.jsx.
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSaving || !validate()) return

    const finalCategory =
      category === 'new' ? customCategory.trim() : category

    setIsSaving(true)
    setErrors((prev) => ({ ...prev, submit: '' }))

    try {
      let finalImageUrl = imagePreview || null

      // Jika ada file yang diunggah, coba simpan ke Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop() || 'png'
        const filePath = `menu/${business?.id || 'default'}/menu_${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('merchant-assets')
          .upload(filePath, imageFile, {
            upsert: true,
            contentType: imageFile.type,
          })

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('merchant-assets')
            .getPublicUrl(filePath)
          if (publicUrlData?.publicUrl) {
            finalImageUrl = publicUrlData.publicUrl
          }
        } else {
          // Fallback: Jika bucket belum dibuat di dashboard, gunakan base64 data URL
          console.warn('Storage bucket fallback to Data URL:', uploadError?.message)
          finalImageUrl = imagePreview
        }
      }

      const newItem = {
        name: name.trim(),
        category: finalCategory,
        price: Number(price),
        description: description.trim() || null,
        image: finalImageUrl,
        isAvailable: true,
      }

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
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-6 sm:p-7 text-left max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/6 shrink-0">
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1">
          {/* Foto Menu & Inisial Placeholder */}
          <div className="flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#1D1D1F]">
                Foto Menu <span className="text-[#86868B] font-normal">(Opsional)</span>
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
              {/* Box Preview: Foto atau Inisial (w-20 h-20 sm:w-24 sm:h-24) */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-black/8 shadow-xs flex items-center justify-center overflow-hidden shrink-0 relative">
                {imagePreview ? (
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
                  id="menu-photo-input"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="menu-photo-input"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#1D1D1F] bg-white hover:bg-neutral-50 border border-black/10 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Camera className="text-[#0071E3] w-4 h-4"/>
                    <span>Pilih Foto</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[12px] font-medium text-[#0071E3] hover:underline cursor-pointer"
                  >
                    {showUrlInput ? 'Tutup URL' : 'Gunakan Link URL'}
                  </button>
                </div>

                <p className="text-[11px] text-[#86868B] leading-tight">
                  Format PNG, JPG, WebP (maks 2MB). Jika tanpa foto, inisial produk otomatis digunakan.
                </p>

                {showUrlInput && (
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value)
                      setImagePreview(e.target.value)
                      setImageFile(null)
                    }}
                    placeholder="https://.../foto-menu.jpg"
                    className="w-full px-3 py-1.5 text-[12px] bg-white rounded-xl border border-black/10 focus:border-[#0071E3] outline-none"
                  />
                )}
              </div>
            </div>

            {errors.image && (
              <p className="text-[12px] font-medium text-[#FF3B30] mt-0.5">
                {errors.image}
              </p>
            )}
          </div>

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
            placeholder="Contoh: Kopi Gula Aren"
            error={errors.name}
            required
          />

          {/* Kategori dan Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 text-left relative" ref={categoryDropdownRef}>
              <label className="text-[13px] font-medium text-[#1D1D1F]">
                Kategori <span className="text-[#FF3B30]">*</span>
              </label>

              {/* Tombol Pemicu Dropdown */}
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className={`w-full py-2.5 px-3.5 text-[14px] text-[#1D1D1F] bg-white rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isCategoryDropdownOpen
                    ? 'border-[#0071E3] ring-4 ring-[#0071E3]/15'
                    : 'border-black/12 hover:border-black/24'
                }`}
              >
                <span className="truncate font-medium">
                  {category === 'new' ? '+ Kategori Baru' : category || 'Pilih Kategori'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#86868B] transition-transform duration-200 shrink-0 ${
                    isCategoryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Popover Menu Dropdown (Terkunci presisi di dalam modal) */}
              {isCategoryDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-black/8 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-48 overflow-y-auto no-scrollbar">
                  {categories
                    .filter((item) => item !== 'Semua')
                    .map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setCategory(item)
                          setIsCategoryDropdownOpen(false)
                          if (errors.category) {
                            setErrors((prev) => ({ ...prev, category: '' }))
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-[13px] text-left transition-colors cursor-pointer ${
                          category === item
                            ? 'bg-[#0071E3]/10 text-[#0071E3] font-semibold'
                            : 'text-[#1D1D1F] hover:bg-black/5'
                        }`}
                      >
                        <span className="truncate">{item}</span>
                        {category === item && <Check className="w-4 h-4 text-[#0071E3] shrink-0" />}
                      </button>
                    ))}

                  {categories.filter((item) => item !== 'Semua').length < 5 && (
                    <>
                      <div className="h-px bg-black/6 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setCategory('new')
                          setIsCategoryDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-[13px] font-semibold text-[#0071E3] hover:bg-[#0071E3]/8 transition-colors cursor-pointer ${
                          category === 'new' ? 'bg-[#0071E3]/10' : ''
                        }`}
                      >
                        <span>+ Kategori Baru...</span>
                        {category === 'new' && <Check className="w-4 h-4 text-[#0071E3] shrink-0" />}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Input Kategori Baru (Muncul jika user memilih + Kategori Baru) */}
              {category === 'new' && (
                <input
                  type="text"
                  value={customCategory}
                  autoFocus
                  onChange={(e) => {
                    setCustomCategory(e.target.value)
                    setErrors((prev) => ({
                      ...prev,
                      category: '',
                      submit: '',
                    }))
                  }}
                  placeholder="Ketik nama kategori baru..."
                  className="mt-1 w-full py-2 px-3.5 text-[13px] bg-white rounded-xl border border-black/12 focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none transition-all"
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