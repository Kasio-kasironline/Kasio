import { useState, useMemo } from 'react'
import { CATEGORIES, DUMMY_MENU_ITEMS } from '../data/dummyMenu'
import MenuCard from '../features/pos/MenuCard'
import CartPanel from '../features/pos/CartPanel'
import PaymentModal from '../features/pos/PaymentModal'
import { formatIDR } from '../utils/formatters'

/**
 * PosPage view: the core cashier Point-of-Sale screen.
 * Designed following Apple HIG: clean content-first layout,
 * fast catalog search, category filtering, responsive cart panel,
 * and seamless Cash & QRIS payment modal workflow.
 * Now fully responsive with mobile hamburger menu and full-width search input bar.
 */
export default function PosPage({
  menuItems = DUMMY_MENU_ITEMS,
  categories = CATEGORIES,
  business,
  onNavigateToMenuManagement,
  onNavigateToAnalytics,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [cart, setCart] = useState([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Filtered menu items based on category pill and search query
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

  // Cart operations
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.item.id === item.id)
      if (existing) {
        return prev.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (itemId, nextQty) => {
    if (nextQty <= 0) {
      handleRemoveItem(itemId)
      return
    }
    setCart((prev) =>
      prev.map((line) =>
        line.item.id === itemId ? { ...line, quantity: nextQty } : line
      )
    )
  }

  const handleRemoveItem = (itemId) => {
    setCart((prev) => prev.filter((line) => line.item.id !== itemId))
  }

  const handleClearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const grandTotal = cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  )

  const handlePaymentSuccess = () => {
    setCart([])
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/6 px-4 sm:px-6 py-2.5 md:py-3 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4 relative">
          
          {/* Row 1 di Mobile: Brand & Hamburger Button */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Brand & Store Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-sm shadow-[#0071E3]/25 font-bold text-sm sm:text-base">
                {business?.name ? business.name.charAt(0).toUpperCase() : 'K'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[14px] sm:text-[15px] font-bold text-[#1D1D1F] tracking-tight leading-tight truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
                  {business?.name || 'Kopi & Snack Makmur'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#34C759] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  Kasir Aktif (Online)
                </span>
              </div>
            </div>

            {/* Mobile Hamburger Button (< md) */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/8 active:scale-95 flex items-center justify-center text-[#1D1D1F] transition-all cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Search Input Bar (Turun ke baris ke-2 di Mobile dengan lebar 100%, di tengah pada Desktop) */}
          <div className="w-full md:flex-1 md:max-w-md relative">
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
              placeholder="Cari menu, kopi, atau snack..."
              className="w-full pl-10 pr-9 py-2 bg-black/4 hover:bg-black/6 focus:bg-white rounded-xl border border-transparent focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 text-[14px] text-[#1D1D1F] placeholder-[#86868B] transition-all outline-none"
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

          {/* Desktop Top Actions (Tersembunyi di Mobile, tampil di Desktop >= md) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {onNavigateToAnalytics && (
              <button
                type="button"
                onClick={onNavigateToAnalytics}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1D1D1F] bg-black/5 hover:bg-black/8 active:scale-95 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                <span>📊</span>
                <span>Analitik</span>
              </button>
            )}
            {onNavigateToMenuManagement && (
              <button
                type="button"
                onClick={onNavigateToMenuManagement}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1D1D1F] bg-black/5 hover:bg-black/8 active:scale-95 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#86868B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Kelola Menu</span>
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar Akun"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#FF3B30] bg-[#FF3B30]/8 hover:bg-[#FF3B30]/15 active:scale-95 px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>

          {/* Mobile Dropdown Menu Popover (< md) */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop klik luar untuk menutup dropdown */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <div className="absolute right-4 top-13 z-50 md:hidden w-52 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-black/8 p-1.5 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                {onNavigateToAnalytics && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      onNavigateToAnalytics()
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#1D1D1F] hover:bg-black/5 active:bg-black/10 transition-colors text-left"
                  >
                    <span className="text-base">📊</span>
                    <span>Analitik & Laporan</span>
                  </button>
                )}

                {onNavigateToMenuManagement && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      onNavigateToMenuManagement()
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#1D1D1F] hover:bg-black/5 active:bg-black/10 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-[#86868B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Kelola Menu</span>
                  </button>
                )}

                {onLogout && (
                  <>
                    <div className="h-px bg-black/6 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        onLogout()
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-[#FF3B30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Keluar Akun</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-start">
        {/* Left Section: Category Pills & Menu Catalog */}
        <section className="flex-1 w-full space-y-4">
          {/* Apple-style Category Segmented Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((category) => {
              const isActive = selectedCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0071E3] text-white shadow-sm shadow-[#0071E3]/30 scale-[1.02]'
                      : 'bg-white text-[#1D1D1F] hover:bg-black/5 border border-black/6'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {/* Catalog Grid */}
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-black/6">
              <span className="text-4xl">☕</span>
              <p className="mt-3 text-[16px] font-semibold text-[#1D1D1F]">
                Menu tidak ditemukan
              </p>
              <p className="text-[13px] text-[#86868B] mt-1">
                Coba gunakan kata kunci lain atau pilih kategori Semua.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredItems.map((item) => {
                const lineItem = cart.find((line) => line.item.id === item.id)
                return (
                  <MenuCard
                    key={item.id}
                    item={item}
                    quantityInCart={lineItem ? lineItem.quantity : 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* Right Section: Desktop Sticky Cart Panel */}
        <aside className="w-full md:w-[380px] shrink-0 sticky top-24 hidden md:block">
          <CartPanel
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedToPayment={() => setIsPaymentOpen(true)}
          />
        </aside>
      </main>

      {/* Floating Cart Trigger Bar for Mobile */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-20">
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-[#0071E3] active:bg-[#0077ED] text-white p-4 rounded-2xl shadow-xl shadow-[#0071E3]/30 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
              <span className="font-semibold text-sm">Lihat Pesanan</span>
            </div>
            <span className="font-bold text-base">{formatIDR(grandTotal)}</span>
          </button>
        </div>
      )}

      {/* Mobile Cart Sheet / Modal Drawer */}
      {isMobileCartOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-4 shadow-2xl max-h-[85vh] flex flex-col z-50">
            <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-black/6">
              <h3 className="font-bold text-base">Keranjang Pesanan</h3>
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(false)}
                className="text-xs font-semibold text-[#86868B] p-1"
              >
                Tutup
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-2">
              <CartPanel
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onProceedToPayment={() => {
                  setIsMobileCartOpen(false)
                  setIsPaymentOpen(true)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal (QRIS & Tunai) */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cart={cart}
        onSuccess={handlePaymentSuccess}
        business={business}
      />
    </div>
  )
}