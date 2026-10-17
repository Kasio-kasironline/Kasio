import { formatIDR } from '../../utils/formatters'

/**
 * MenuCard component representing a single menu item in the POS catalog.
 * Follows Apple HIG aesthetic with clean squircle container, crisp typography,
 * availability status, and intuitive quantity adjustment controls.
 */
export default function MenuCard({
  item,
  quantityInCart = 0,
  onAddToCart,
  onUpdateQuantity,
}) {
  const { id, name, category, price, description, image, isAvailable } = item

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border p-4 transition-all duration-200 ${
        isAvailable
          ? 'border-black/[0.06] hover:border-black/[0.12] hover:shadow-md'
          : 'border-black/[0.04] bg-neutral-50/60 opacity-60'
      }`}
    >
      <div>
        {/* Top Header: Category Tag & Availability Badge */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/[0.04] text-[#86868B]">
            {category}
          </span>
          {!isAvailable && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FF3B30]/10 text-[#FF3B30]">
              Habis
            </span>
          )}
        </div>

        {/* Thumbnail and Title Row */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-center text-2xl shrink-0 select-none">
            {image || '🍽️'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] text-[#1D1D1F] tracking-tight truncate leading-snug">
              {name}
            </h3>
            <p className="text-[12px] text-[#86868B] line-clamp-2 mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Price & Add/Qty Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/[0.04]">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-[#86868B] uppercase font-medium tracking-wider">
            Harga
          </span>
          <span className="text-[15px] font-bold text-[#1D1D1F] tracking-tight">
            {formatIDR(price)}
          </span>
        </div>

        {/* Action Controls */}
        <div>
          {!isAvailable ? (
            <button
              type="button"
              disabled
              className="text-[12px] font-medium px-3 py-1.5 rounded-xl bg-black/[0.04] text-[#86868B] cursor-not-allowed"
            >
              Tidak Tersedia
            </button>
          ) : quantityInCart === 0 ? (
            <button
              type="button"
              onClick={() => onAddToCart(item)}
              className="inline-flex items-center gap-1 text-[13px] font-medium px-3.5 py-1.5 rounded-xl bg-[#0071E3]/10 hover:bg-[#0071E3]/20 active:bg-[#0071E3]/30 text-[#0071E3] transition-all active:scale-[0.97] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tambah</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-[#0071E3] text-white rounded-xl px-1.5 py-1 shadow-sm shadow-[#0071E3]/20">
              <button
                type="button"
                onClick={() => onUpdateQuantity(id, quantityInCart - 1)}
                aria-label={`Kurangi ${name}`}
                className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <span className="w-6 text-center text-[13px] font-bold select-none">
                {quantityInCart}
              </span>

              <button
                type="button"
                onClick={() => onUpdateQuantity(id, quantityInCart + 1)}
                aria-label={`Tambah ${name}`}
                className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}