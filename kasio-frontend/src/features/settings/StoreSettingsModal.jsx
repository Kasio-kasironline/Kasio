import { useState, useRef } from 'react'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

/**
 * StoreSettingsModal component:
 * Modal for UMKM merchant to configure static QRIS payment image
 * and manage product categories with a maximum 5-category limit.
 * Follows Apple HIG aesthetic with clean segmented controls and clear feedback.
 */
export default function StoreSettingsModal({
  isOpen,
  onClose,
  business,
  categoryList = [],
  menuItems = [],
  onAddCategory,
  onDeleteCategory,
  onUpdateBusinessQris,
}) {
  const [activeTab, setActiveTab] = useState('qris') // 'qris' | 'categories'

  // QRIS Tab State
  const [qrisPreview, setQrisPreview] = useState(business?.qris_image_url || '')
  const [qrisUrlInput, setQrisUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isSavingQris, setIsSavingQris] = useState(false)
  const [qrisMessage, setQrisMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)

  // Category Tab State
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [categoryMessage, setCategoryMessage] = useState({ type: '', text: '' })

  if (!isOpen) return null

  // --- Handlers for QRIS ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setQrisMessage({ type: 'error', text: 'File harus berupa gambar (PNG, JPG, atau WebP).' })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setQrisMessage({ type: 'error', text: 'Ukuran file maksimal 2 MB.' })
      return
    }

    setSelectedFile(file)
    setQrisMessage({ type: '', text: '' })

    const reader = new FileReader()
    reader.onload = (event) => {
      setQrisPreview(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveQris = async () => {
    if (!business?.id) {
      setQrisMessage({ type: 'error', text: 'Data usaha belum siap.' })
      return
    }

    let targetUrl = qrisPreview

    // Jika user menginput URL manual
    if (qrisUrlInput.trim()) {
      targetUrl = qrisUrlInput.trim()
    }

    if (!targetUrl && !selectedFile) {
      setQrisMessage({ type: 'error', text: 'Silakan pilih gambar atau masukkan URL gambar QRIS.' })
      return
    }

    setIsSavingQris(true)
    setQrisMessage({ type: '', text: '' })

    try {
      let finalPublicUrl = targetUrl

      // Coba upload ke Supabase Storage jika ada file
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop() || 'png'
        const filePath = `qris/${business.id}/qris_${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('merchant-assets')
          .upload(filePath, selectedFile, {
            upsert: true,
            contentType: selectedFile.type,
          })

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('merchant-assets')
            .getPublicUrl(filePath)
          if (publicUrlData?.publicUrl) {
            finalPublicUrl = publicUrlData.publicUrl
          }
        } else {
          // Fallback: Jika bucket belum dibuat di dashboard, gunakan base64 data URL
          // agar QRIS tetap dapat disimpan langsung tanpa hambatan konfigurasi bucket
          console.warn('Storage bucket upload fallback to Data URL:', uploadError?.message)
          finalPublicUrl = qrisPreview
        }
      }

      await onUpdateBusinessQris(finalPublicUrl)
      setQrisPreview(finalPublicUrl)
      setSelectedFile(null)
      setQrisUrlInput('')
      setQrisMessage({ type: 'success', text: 'Foto QRIS toko berhasil disimpan!' })
    } catch (err) {
      console.error('Gagal menyimpan QRIS:', err)
      setQrisMessage({ type: 'error', text: err.message || 'Gagal menyimpan QRIS.' })
    } finally {
      setIsSavingQris(false)
    }
  }

  const handleDeleteQris = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto QRIS toko?')) return

    setIsSavingQris(true)
    setQrisMessage({ type: '', text: '' })

    try {
      await onUpdateBusinessQris(null)
      setQrisPreview('')
      setSelectedFile(null)
      setQrisUrlInput('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setQrisMessage({ type: 'success', text: 'Foto QRIS toko berhasil dihapus.' })
    } catch (err) {
      console.error('Gagal menghapus QRIS:', err)
      setQrisMessage({ type: 'error', text: err.message || 'Gagal menghapus QRIS.' })
    } finally {
      setIsSavingQris(false)
    }
  }

  // --- Handlers for Category Management ---
  const handleAddNewCategory = async (e) => {
    e.preventDefault()
    const trimmed = newCategoryName.trim()

    if (!trimmed) return
    if (categoryList.length >= 5) {
      setCategoryMessage({ type: 'error', text: 'Maksimal 5 kategori telah tercapai.' })
      return
    }

    setIsAddingCategory(true)
    setCategoryMessage({ type: '', text: '' })

    try {
      await onAddCategory(trimmed)
      setNewCategoryName('')
      setCategoryMessage({ type: 'success', text: `Kategori "${trimmed}" berhasil ditambahkan!` })
    } catch (err) {
      console.error('Gagal menambah kategori:', err)
      setCategoryMessage({ type: 'error', text: err.message || 'Gagal menambah kategori.' })
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleDeleteCategoryItem = async (cat) => {
    const count = menuItems.filter(
      (m) => m.categoryId === cat.id || m.category?.toLowerCase() === cat.name.toLowerCase()
    ).length

    const confirmMsg =
      count > 0
        ? `Kategori "${cat.name}" memiliki ${count} menu terkait. Jika dihapus, menu tersebut akan berstatus "Tanpa Kategori". Lanjutkan?`
        : `Hapus kategori "${cat.name}"?`

    if (!confirm(confirmMsg)) return

    setDeletingId(cat.id)
    setCategoryMessage({ type: '', text: '' })

    try {
      await onDeleteCategory(cat.id, cat.name)
      setCategoryMessage({ type: 'success', text: `Kategori "${cat.name}" telah dihapus.` })
    } catch (err) {
      console.error('Gagal menghapus kategori:', err)
      setCategoryMessage({ type: 'error', text: err.message || 'Gagal menghapus kategori.' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-black/6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-[#1D1D1F]">
              ⚙️
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#1D1D1F] tracking-tight">
                Pengaturan Tambahan
              </h2>
              <p className="text-[12px] text-[#86868B]">
                {business?.name || 'Kelola QRIS dan Kategori Toko'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Apple-style Segmented Navigation Tabs */}
        <div className="px-5 pt-3">
          <div className="flex items-center p-1 bg-black/4 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('qris')
                setQrisMessage({ type: '', text: '' })
              }}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'qris'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <span>📱</span>
              <span>QRIS Pembayaran</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('categories')
                setCategoryMessage({ type: '', text: '' })
              }}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              <span>🏷️</span>
              <span>Kategori Produk ({categoryList.length}/5)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: QRIS SETTINGS */}
          {activeTab === 'qris' && (
            <div className="space-y-4 text-left">
              <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-3 text-[12px] text-blue-900 leading-relaxed">
                Foto QRIS ini akan otomatis ditampilkan pada modal pembayaran kasir saat pelanggan memilih metode <strong>QRIS</strong>.
              </div>

              {qrisMessage.text && (
                <div
                  className={`p-3 rounded-xl text-[13px] font-medium ${
                    qrisMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {qrisMessage.text}
                </div>
              )}

              {/* QRIS Image Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-black/[0.02] border border-black/8 rounded-2xl">
                {qrisPreview ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-52 h-52 bg-white rounded-xl border border-black/10 shadow-sm p-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={qrisPreview}
                        alt="QRIS Toko"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[#34C759] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                      QRIS Toko Siap Digunakan
                    </span>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center text-center">
                    <span className="text-4xl">📱</span>
                    <p className="font-semibold text-[14px] text-[#1D1D1F] mt-2">
                      Belum ada QRIS toko
                    </p>
                    <p className="text-[12px] text-[#86868B] mt-0.5 max-w-[240px]">
                      Unggah gambar QRIS statis toko Anda dari galeri atau file komputer.
                    </p>
                  </div>
                )}
              </div>

              {/* File Upload Controls */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1D1D1F] uppercase tracking-wider block">
                  Pilih Foto QRIS Baru
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-[13px] text-[#86868B] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[12px] file:font-semibold file:bg-black/5 file:text-[#1D1D1F] hover:file:bg-black/10 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>

              {/* Or Direct Image URL */}
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[#86868B] block">
                  Atau masukkan URL gambar QRIS online:
                </label>
                <input
                  type="url"
                  value={qrisUrlInput}
                  onChange={(e) => setQrisUrlInput(e.target.value)}
                  placeholder="https://.../qris.jpg"
                  className="w-full px-3 py-2 text-[13px] bg-white rounded-xl border border-black/10 focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-black/6">
                {qrisPreview ? (
                  <button
                    type="button"
                    onClick={handleDeleteQris}
                    disabled={isSavingQris}
                    className="text-[13px] font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Hapus QRIS
                  </button>
                ) : (
                  <div />
                )}

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveQris}
                  disabled={isSavingQris || (!selectedFile && !qrisUrlInput.trim() && !qrisPreview)}
                  isLoading={isSavingQris}
                >
                  {isSavingQris ? 'Menyimpan...' : 'Simpan QRIS'}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORY MANAGEMENT (MAX 5) */}
          {activeTab === 'categories' && (
            <div className="space-y-4 text-left">
              {/* Limit Counter Banner */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  categoryList.length >= 5
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-black/[0.02] border-black/6 text-[#1D1D1F]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{categoryList.length >= 5 ? '🔒' : '🏷️'}</span>
                  <div>
                    <span className="text-[13px] font-bold block">
                      Jumlah Kategori: {categoryList.length} / 5
                    </span>
                    <span className="text-[11px] text-[#86868B]">
                      {categoryList.length >= 5
                        ? 'Batas maksimal 5 kategori telah tercapai.'
                        : 'Maksimal 5 kategori agar tampilan POS tetap bersih.'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    categoryList.length >= 5
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-[#34C759]/10 text-[#34C759]'
                  }`}
                >
                  {categoryList.length >= 5 ? 'Penuh' : 'Tersedia'}
                </span>
              </div>

              {categoryMessage.text && (
                <div
                  className={`p-3 rounded-xl text-[13px] font-medium ${
                    categoryMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {categoryMessage.text}
                </div>
              )}

              {/* Add New Category Form (Disabled if >= 5) */}
              <form onSubmit={handleAddNewCategory} className="space-y-2">
                <label className="text-[12px] font-bold text-[#1D1D1F] uppercase tracking-wider block">
                  Tambah Kategori Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    disabled={categoryList.length >= 5 || isAddingCategory}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={
                      categoryList.length >= 5
                        ? 'Batas 5 kategori tercapai'
                        : 'Contoh: Makanan, Minuman, Snack...'
                    }
                    className="flex-1 px-3.5 py-2 text-[14px] bg-white rounded-xl border border-black/10 focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none disabled:bg-neutral-100 disabled:text-[#86868B] disabled:cursor-not-allowed"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={categoryList.length >= 5 || !newCategoryName.trim() || isAddingCategory}
                    isLoading={isAddingCategory}
                  >
                    + Tambah
                  </Button>
                </div>
              </form>

              {/* Category List */}
              <div className="space-y-2 pt-2">
                <label className="text-[12px] font-bold text-[#1D1D1F] uppercase tracking-wider block">
                  Daftar Kategori Saat Ini
                </label>

                {categoryList.length === 0 ? (
                  <div className="p-6 text-center bg-neutral-50 rounded-2xl border border-black/4 text-[#86868B]">
                    <p className="text-[13px]">Belum ada kategori yang ditambahkan.</p>
                    <p className="text-[11px] mt-0.5">Tambahkan kategori pertama Anda di atas.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-black/6 border border-black/8 rounded-2xl overflow-hidden bg-white">
                    {categoryList.map((cat) => {
                      const count = menuItems.filter(
                        (m) =>
                          m.categoryId === cat.id ||
                          m.category?.toLowerCase() === cat.name.toLowerCase()
                      ).length

                      return (
                        <div
                          key={cat.id}
                          className="p-3 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-[#0071E3]" />
                            <div>
                              <span className="font-semibold text-[14px] text-[#1D1D1F] block">
                                {cat.name}
                              </span>
                              <span className="text-[11px] text-[#86868B]">
                                {count} menu terdaftar
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategoryItem(cat)}
                            disabled={deletingId === cat.id}
                            aria-label={`Hapus kategori ${cat.name}`}
                            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-all cursor-pointer"
                            title="Hapus kategori ini"
                          >
                            {deletingId === cat.id ? (
                              <span className="text-xs">Menghapus...</span>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}