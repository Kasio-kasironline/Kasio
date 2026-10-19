import { useState } from 'react'
import { formatIDR } from '../../utils/formatters'

/**
 * SalesBarChart component.
 * Displays revenue distribution over time (hourly for today, daily for week/month).
 * Built with Apple HIG design aesthetic: clean bars, subtle backdrop highlights,
 * interactive tooltips, and zero heavy chart library dependencies.
 */
export default function SalesBarChart({ chartData = [], period = 'today' }) {
  const [activeItem, setActiveItem] = useState(null)

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1)
  const totalPeriodRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0)
  const peakItem = chartData.reduce(
    (max, d) => (d.revenue > (max?.revenue || 0) ? d : max),
    null
  )

  const periodSubtitle =
    period === 'today'
      ? 'Distribusi omzet per rentang waktu hari ini'
      : period === 'week'
      ? 'Distribusi omzet per hari dalam 7 hari terakhir'
      : 'Tren omzet harian dalam 14 hari terakhir'

  return (
    <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/[0.04]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">📈</span>
            <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] tracking-tight">
              Grafik Tren Penjualan
            </h3>
          </div>
          <p className="text-[12px] text-[#86868B] mt-0.5">{periodSubtitle}</p>
        </div>

        {peakItem && peakItem.revenue > 0 && (
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-[#0071E3]/8 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#0071E3]">
            <span>⚡ Puncak:</span>
            <span className="font-bold">{formatIDR(peakItem.revenue)}</span>
            <span className="text-[#86868B]">({peakItem.dayLabel || peakItem.dayName})</span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-8 pb-2">
        {/* Subtle background gridlines */}
        <div className="absolute inset-x-0 top-8 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-black/10 w-full" />
          <div className="border-b border-dashed border-black/10 w-full" />
          <div className="border-b border-dashed border-black/10 w-full" />
          <div className="border-b border-black/10 w-full" />
        </div>

        {/* Floating Tooltip Indicator */}
        <div className="h-7 mb-2 flex items-center justify-center">
          {activeItem ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1D1D1F] text-white text-[11px] font-medium rounded-full shadow-md animate-fade-in">
              <span className="text-[#86868B]">{activeItem.dayLabel || activeItem.dayName}:</span>
              <span className="font-bold text-white">{formatIDR(activeItem.revenue)}</span>
              <span className="text-white/70">({activeItem.orderCount} pesanan)</span>
            </div>
          ) : (
            <span className="text-[11px] text-[#86868B]">
              Arahkan atau sentuh batang untuk rincian
            </span>
          )}
        </div>

        {/* Bars Container */}
        <div className="relative h-48 sm:h-56 flex items-end justify-between gap-1.5 sm:gap-3 px-1 z-10">
          {chartData.map((item, index) => {
            const heightPercent =
              maxRevenue > 0
                ? Math.max(Math.round((item.revenue / maxRevenue) * 100), item.revenue > 0 ? 8 : 3)
                : 3
            const isPeak = peakItem && peakItem.revenue === item.revenue && item.revenue > 0
            const isHovered = activeItem?.key === item.key

            return (
              <div
                key={item.key || index}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setActiveItem(item)}
                onMouseLeave={() => setActiveItem(null)}
                onClick={() => setActiveItem(item)}
              >
                {/* Bar Element */}
                <div className="w-full max-w-[42px] flex items-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#0071E3] scale-y-105 shadow-md shadow-[#0071E3]/25'
                        : isPeak
                        ? 'bg-gradient-to-t from-[#0071E3] to-[#42A5F5]'
                        : item.revenue > 0
                        ? 'bg-[#0071E3]/80 hover:bg-[#0071E3]'
                        : 'bg-black/5 hover:bg-black/10'
                    }`}
                  />
                </div>

                {/* X-Axis Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[10px] sm:text-[11px] font-medium transition-colors ${
                      isHovered || isPeak
                        ? 'text-[#0071E3] font-bold'
                        : 'text-[#86868B]'
                    }`}
                  >
                    {item.dayName}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart Summary Footer */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between text-[12px] text-[#86868B]">
        <span>
          Total Terdata: <strong className="text-[#1D1D1F]">{formatIDR(totalPeriodRevenue)}</strong>
        </span>
        <span className="hidden sm:inline">
          Dihitung otomatis per transaksi terselesaikan
        </span>
      </div>
    </div>
  )
}