import { useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import AddMenuModal from '../features/products/AddMenuModal'
import EditMenuModal from '../features/products/EditMenuModal'
import StoreSettingsModal from '../features/settings/StoreSettingsModal'
import { formatIDR, getInitials } from '../utils/formatters'

/**
 * MenuManagementPage view: Dedicated screen for store owners to manage catalog.
 * Supports adding new menu items, editing items (details, stock availability, and deletion inside modal),
 * live search / category filtering, and store settings (QRIS & max 5 categories).
 * Follows Apple HIG layout principles.
 */
export default function MenuManagementPage({
  menuItems = [],
  onAddMenu,
  onUpdateMenu,
  onDeleteMenu,
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
  const [itemToEdit, setItemToEdit] = useState(null)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

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
              title="Kembali ke Kasir"
              aria-label="Kembali ke Kasir"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0071E3] hover:bg-[#0071E3]/10 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="hidden sm:inline">Kembali ke Kasir</span>
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

          {/* Right Navigation: Additional Settings Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              title="Pengaturan Tambahan (QRIS & Kategori)"
              aria-label="Pengaturan Tambahan"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1D1D1F] bg-black/5 hover:bg-black/8 active:scale-95 px-2.5 sm:px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <svg className="w-4 h-4 text-[#86868B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="hidden sm:inline">Pengaturan Tambahan</span>
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
              Tambah dan kelola katalog produk, harga, ketersediaan, atau foto menu.
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

        {/* Filter and Search Bar Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Categories Pill List */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((category) => {
              const isSelected = selectedCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#0071E3] text-white shadow-xs'
                      : 'bg-white text-[#86868B] hover:text-[#1D1D1F] border border-black/6 hover:bg-neutral-50'
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
            <span className="text-3xl">☕</span>
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
                  {/* Category and Non-clickable Stock Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/4 text-[#86868B]">
                      {item.category}
                    </span>

                    {/* Badge status ketersediaan (hanya tampilan informasi, tidak bisa diklik) */}
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full select-none ${
                        item.isAvailable
                          ? 'bg-[#34C759]/10 text-[#34C759]'
                          : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                      }`}
                    >
                      {item.isAvailable ? '● Tersedia' : '○ Habis'}
                    </span>
                  </div>

                  {/* Thumbnail, Name, and Description */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#F5F5F7] border border-black/8 flex items-center justify-center shrink-0 overflow-hidden select-none shadow-xs">
                      {item.image &&
                      (item.image.startsWith('http') ||
                        item.image.startsWith('data:')) ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0071E3]/10 to-[#0071E3]/20 border border-[#0071E3]/15 flex items-center justify-center text-[#0071E3] font-extrabold text-base tracking-wider">
                          {getInitials(item.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-[15px] text-[#1D1D1F] truncate leading-snug"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="text-[12px] text-[#86868B] line-clamp-2 mt-0.5 leading-relaxed"
                        title={item.description}
                      >
                        {item.description || 'Tidak ada deskripsi.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price and Edit Action Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#86868B] uppercase font-medium">
                      Harga
                    </span>
                    <span className="text-[15px] font-bold text-[#1D1D1F]">
                      {formatIDR(item.price)}
                    </span>
                  </div>

                  {/* Tombol tunggal: Edit Menu */}
                  <button
                    type="button"
                    onClick={() => setItemToEdit(item)}
                    className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-[#1D1D1F] bg-black/5 hover:bg-black/10 active:bg-black/15 px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                    title="Edit rincian, stok, atau hapus menu"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-[#86868B]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Edit Menu</span>
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

      {/* Modal Edit Menu (mengurus edit, ketersediaan, dan hapus) */}
      {itemToEdit && (
        <EditMenuModal
          isOpen={Boolean(itemToEdit)}
          onClose={() => setItemToEdit(null)}
          menuItem={itemToEdit}
          onUpdateMenu={onUpdateMenu}
          onDeleteMenu={onDeleteMenu}
          categories={categories}
          business={business}
        />
      )}

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
    </div>
  )
}