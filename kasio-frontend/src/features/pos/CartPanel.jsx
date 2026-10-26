import { formatIDR } from '../../utils/formatters'
import Button from '../../components/ui/Button'
import {ScrollText, ShoppingBasket, Trash, MoveRight} from 'lucide-react'

/**
 * CartPanel component displaying the active order docket.
 * Follows Apple-inspired layout with clean item cards, live quantity adjusters,
 * order subtotal summary, and prominent "Lanjut ke Pembayaran" checkout button.
 */
export default function CartPanel({
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
  onOpenPayment,
}) {
  // Dukung kedua nama prop agar tidak pernah gagal membuka modal
  const handleProceed = onProceedToPayment || onOpenPayment
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const grandTotal = cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  )

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-sm">
            <ScrollText className="w-4 h-4"/>
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-[#1D1D1F] leading-tight">
              Pesanan Aktif
            </h2>
            <span className="text-[12px] text-[#86868B]">
              {totalItems} item dipilih
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[12px] font-medium text-[#FF3B30] hover:text-[#D70015] hover:bg-[#FF3B30]/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Kosongkan
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 divide-y divide-black/[0.04]">
        {cart.length === 0 ? (
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 text-[#86868B]">
            <ShoppingBasket className="w-16 h-16"/>
            <p className="font-semibold text-[#1D1D1F] text-[15px]">
              Keranjang masih kosong
            </p>
            <p className="text-[13px] text-[#86868B] max-w-[220px] mt-1 leading-relaxed">
              Pilih menu di katalog untuk mulai mencatat pesanan pelanggan.
            </p>
          </div>
        ) : (
          cart.map(({ item, quantity }) => {
            const itemSubtotal = item.price * quantity

            return (
              <div key={item.id} className="py-3.5 first:pt-1 last:pb-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-[#1D1D1F] truncate leading-tight">
                      {item.name}
                    </p>
                    <span className="text-[12px] text-[#86868B]">
                      {formatIDR(item.price)} / porsi
                    </span>
                  </div>

                  <span className="text-[14px] font-bold text-[#1D1D1F]">
                    {formatIDR(itemSubtotal)}
                  </span>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Hapus ${item.name}`}
                    className="text-[#86868B] hover:text-[#FF3B30] p-1 text-[12px] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5"/>
                    <span>Hapus</span>
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#F5F5F7] rounded-xl p-1 border border-black/[0.04]">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                      aria-label="Kurangi kuantitas"
                      className="w-6 h-6 rounded-lg bg-white shadow-xs text-[#1D1D1F] flex items-center justify-center font-bold text-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-[13px] font-bold text-[#1D1D1F] select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                      aria-label="Tambah kuantitas"
                      className="w-6 h-6 rounded-lg bg-white shadow-xs text-[#1D1D1F] flex items-center justify-center font-bold text-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Cart Summary & Checkout Action */}
      <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-neutral-50/50 space-y-3">
        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between text-[#86868B]">
            <span>Subtotal Produk</span>
            <span className="font-semibold text-[#1D1D1F]">{formatIDR(grandTotal)}</span>
          </div>
          <div className="flex justify-between text-[#86868B]">
            <span>Pajak Resto (PB1)</span>
            <span className="font-medium text-[#34C759]">Rp 0 (Bebas PB1)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-black/[0.06] flex items-baseline justify-between">
          <span className="text-[14px] font-semibold text-[#1D1D1F]">
            Total Pembayaran
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
            {formatIDR(grandTotal)}
          </span>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={cart.length === 0}
          onClick={handleProceed}
          className="w-full font-semibold shadow-sm justify-between px-5"
        >
          <span>Lanjut ke Pembayaran</span>
          <MoveRight className="w-4 h-4"/>
        </Button>
      </div>
    </div>
  )
}