import { useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import AddMenuModal from '../features/products/AddMenuModal'
import StoreSettingsModal from '../features/settings/StoreSettingsModal'
import { formatIDR, getInitials } from '../utils/formatters'

/**
 * MenuManagementPage view: Dedicated screen for store owners to manage catalog.
 * Supports adding new menu items, deleting existing items, toggling stock availability,
 * live search / category filtering, and store settings (QRIS & max 5 categories).
 * Follows Apple HIG layout principles.
 */
export default function MenuManagementPage({
  menuItems = [],
  onAddMenu,
  onDeleteMenu,
  onToggleAvailability,
  onNavigateToPos,
  categories = ['Semua'],
  categoryList = [],
  business,
  onAddCategory,
  onDeleteCategory,
  onUpdateBusinessQris,
  isLoading = false,
  error = '',
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))

      return matchCategory && matchQuery
    })
  }, [menuItems, selectedCategory, searchQuery])

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await onDeleteMenu(itemToDelete.id)
      setItemToDelete(null)
    } catch (error) {
      console.error('Gagal menghapus menu:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/6 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Back to POS Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToPos}
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0071E3] hover:bg-[#0071E3]/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Kembali ke Kasir</span>
            </button>

            <span className="text-[#86868B] hidden sm:inline">|</span>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[15px] font-bold text-[#1D1D1F] tracking-tight leading-tight">
                Kelola Menu & Katalog
              </span>
              <span className="text-[11px] text-[#86868B]">
                {business?.name || 'Toko Saya'}
              </span>
            </div>
          </div>

          {/* Right Navigation: Additional Settings Button (replaces logout) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1D1D1F] bg-black/5 hover:bg-black/8 active:scale-95 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#86868B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Pengaturan Tambahan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Gagal memproses data menu: {error}
          </div>
        )}

        {isLoading && (
          <div
            role="status"
            className="rounded-xl border border-black/6 bg-white p-6 text-center text-sm text-[#86868B]"
          >
            Memuat data menu dari database...
          </div>
        )}

        {/* Action Header: Title and Add Menu Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
              Daftar Menu Produk
            </h1>
            <p className="text-[13px] text-[#86868B] mt-0.5">
              Tambah, edit status ketersediaan, atau hapus menu dari katalog toko.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Menu Baru</span>
          </Button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((category) => {
              const isActive = selectedCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all shrink-0 cursor-pointer ${isActive
                    ? 'bg-[#1D1D1F] text-white shadow-sm'
                    : 'bg-white hover:bg-black/4 text-[#86868B] hover:text-[#1D1D1F] border border-black/6'
                    }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <svg
              className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama menu..."
              className="w-full pl-10 pr-9 py-2 bg-white rounded-xl border border-black/10 focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 text-[14px] text-[#1D1D1F] placeholder-[#86868B] transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] p-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Menu Items Table / Card Grid */}
        {isLoading ? null : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-black/6 text-[#86868B]">
            <span className="text-3xl">🍽️</span>
            <p className="font-semibold text-[#1D1D1F] text-[15px] mt-2">
              Tidak ada menu yang sesuai
            </p>
            <p className="text-[13px] text-[#86868B] mt-1">
              {searchQuery
                ? 'Coba gunakan kata kunci pencarian yang lain.'
                : 'Belum ada menu di kategori ini. Klik "Tambah Menu Baru" di atas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-black/6 p-4 flex flex-col justify-between hover:shadow-md transition-all text-left"
              >
                <div>
                  {/* Category and Stock Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/4 text-[#86868B]">
                      {item.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleAvailability(item.id)}
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${item.isAvailable
                        ? 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20'
                        : 'bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20'
                        }`}
                      title="Klik untuk ubah status ketersediaan"
                    >
                      {item.isAvailable ? '● Tersedia' : '○ Habis'}
                    </button>
                  </div>

                  {/* Thumbnail, Name, and Description */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#F5F5F7] border border-black/8 flex items-center justify-center shrink-0 overflow-hidden select-none shadow-xs">
                      {item.image && (item.image.startsWith('http') || item.image.startsWith('data:')) ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : item.image && item.image.length <= 4 && !item.image.includes('/') ? (
                        <span className="text-2xl">{item.image}</span>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0071E3]/10 to-[#0071E3]/20 border border-[#0071E3]/15 flex items-center justify-center text-[#0071E3] font-extrabold text-base tracking-wider">
                          {getInitials(item.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] text-[#1D1D1F] truncate leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-[12px] text-[#86868B] line-clamp-2 mt-0.5 leading-relaxed">
                        {item.description || 'Tidak ada deskripsi.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price and Delete Action Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868B] uppercase font-medium">Harga</span>
                    <span className="text-[15px] font-bold text-[#1D1D1F]">
                      {formatIDR(item.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#FF3B30] hover:text-[#D70015] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Add Menu */}
      <AddMenuModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMenu={onAddMenu}
        categories={categories}
        business={business}
      />

      {/* Store Settings Modal: QRIS & Categories */}
      <StoreSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        business={business}
        categoryList={categoryList}
        menuItems={menuItems}
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
        onUpdateBusinessQris={onUpdateBusinessQris}
      />

      {/* Confirmation Modal for Delete */}
      {itemToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-black/8 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] mx-auto flex items-center justify-center text-xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1D1D1F]">Hapus Menu?</h3>
              <p className="text-[13px] text-[#86868B] mt-1">
                Apakah Anda yakin ingin menghapus <strong>&quot;{itemToDelete.name}&quot;</strong>? Menu ini tidak akan tampil lagi di kasir POS.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setItemToDelete(null)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="md"
                onClick={confirmDelete}
                className="flex-1 bg-[#FF3B30] text-white hover:bg-[#e00f24]"
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}