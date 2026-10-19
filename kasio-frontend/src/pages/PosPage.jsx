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
 */
export default function PosPage({
  menuItems = DUMMY_MENU_ITEMS,
  categories = CATEGORIES,
  onNavigateToMenuManagement,
  onNavigateToAnalytics, 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [cart, setCart] = useState([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)

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
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/6 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Store Profile */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-sm shadow-[#0071E3]/25 font-bold">
              K
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[15px] font-bold text-[#1D1D1F] tracking-tight leading-tight">
                Kopi & Snack Makmur
              </span>
              <span className="text-[11px] text-[#34C759] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                Kasir Aktif (Online)
              </span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex-1 max-w-md relative">
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

          {/* Top Actions: Menu Management Settings Button */}
          <div className="flex items-center gap-2 shrink-0">
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
          </div>
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
                      ? 'bg-[#1D1D1F] text-white shadow-sm'
                      : 'bg-white hover:bg-black/4 text-[#86868B] hover:text-[#1D1D1F] border border-black/6'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {/* Section Subhead & Count */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[13px] font-medium text-[#86868B]">
              Menampilkan {filteredItems.length} menu jualan
            </span>
            {searchQuery && (
              <span className="text-[12px] text-[#0071E3] font-medium">
                Hasil pencarian: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-black/6 text-[#86868B]">
              <span className="text-3xl">🔍</span>
              <p className="font-semibold text-[#1D1D1F] text-[15px] mt-2">
                Menu tidak ditemukan
              </p>
              <p className="text-[13px] text-[#86868B] mt-1">
                Coba gunakan kata kunci pencarian yang lain atau ubah kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredItems.map((item) => {
                const cartLine = cart.find((line) => line.item.id === item.id)
                const qty = cartLine ? cartLine.quantity : 0

                return (
                  <MenuCard
                    key={item.id}
                    item={item}
                    quantityInCart={qty}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* Right Section (Desktop/Tablet): Sticky Cart Panel */}
        <aside className="hidden md:block w-96 shrink-0 sticky top-18 h-[calc(100vh-96px)]">
          <CartPanel
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedToPayment={() => setIsPaymentOpen(true)}
          />
        </aside>
      </main>

      {/* Mobile Floating Sticky Cart Pill (<md) */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-40">
          <div className="bg-[#1D1D1F] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="flex flex-col text-left pl-1">
              <span className="text-[12px] text-white/70">
                {totalItems} item di keranjang
              </span>
              <span className="text-[16px] font-bold text-white tracking-tight">
                {formatIDR(grandTotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileCartOpen(true)}
              className="bg-[#0071E3] hover:bg-[#0077ED] text-white px-4 py-2 rounded-xl text-[14px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Lihat & Bayar</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cart Bottom Sheet Modal */}
      {isMobileCartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end"
        >
          <div className="bg-white rounded-t-3xl max-h-[85vh] h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-3 flex justify-center border-b border-black/4">
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(false)}
                className="w-12 h-1.5 rounded-full bg-black/20"
                aria-label="Tutup keranjang"
              />
            </div>
            <div className="flex-1 overflow-hidden p-2">
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

      {/* Payment Modal (Cash & QRIS) */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cart={cart}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}