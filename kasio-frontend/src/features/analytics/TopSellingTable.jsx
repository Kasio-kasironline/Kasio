import { formatIDR } from '../../utils/formatters'

/**
 * TopSellingTable component.
 * Displays the top-selling products by quantity and revenue contribution.
 * Follows Apple HIG: elevated card, subtle rank badges, clean progress bars,
 * and clear typography hierarchy.
 */
export default function TopSellingTable({ items = [] }) {
  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return {
          icon: '🥇',
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          label: '#1',
        }
      case 1:
        return {
          icon: '🥈',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          label: '#2',
        }
      case 2:
        return {
          icon: '🥉',
          bg: 'bg-orange-100 text-orange-900 border-orange-200',
          label: '#3',
        }
      default:
        return {
          icon: null,
          bg: 'bg-black/5 text-[#86868B] border-transparent',
          label: `#${index + 1}`,
        }
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.04]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🔥</span>
            <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] tracking-tight">
              Menu Terlaris
            </h3>
          </div>
          <p className="text-[12px] text-[#86868B] mt-0.5">
            5 produk teratas berdasarkan jumlah terjual
          </p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071E3] bg-[#0071E3]/8 px-2.5 py-1 rounded-full">
          Top 5
        </span>
      </div>

      {/* Content List */}
      <div className="divide-y divide-black/[0.04] py-2 flex-1 flex flex-col justify-around">
        {items.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[#86868B]">
            Belum ada penjualan tercatat di periode ini.
          </div>
        ) : (
          items.map((item, index) => {
            const badge = getRankBadge(index)

            return (
              <div key={item.name} className="py-3.5 first:pt-2 last:pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold border shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>

                    {/* Product Name & Porsi */}
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-semibold text-[#1D1D1F] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#86868B]">
                        {item.quantity} porsi terjual
                      </p>
                    </div>
                  </div>

                  {/* Revenue & Share */}
                  <div className="text-right shrink-0">
                    <span className="text-[13px] font-bold text-[#1D1D1F] block">
                      {formatIDR(item.revenue)}
                    </span>
                    <span className="text-[11px] font-medium text-[#34C759]">
                      {item.percentage}% omzet
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full h-1.5 rounded-full bg-black/[0.05] overflow-hidden">
                  <div
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    className="h-full bg-[#0071E3] rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-black/[0.04] text-[12px] text-[#86868B] flex items-center justify-between">
        <span>Evaluasi stok menu favorit</span>
        <span className="text-[#0071E3] font-medium">Berdasarkan pesanan selesai</span>
      </div>
    </div>
  )
}