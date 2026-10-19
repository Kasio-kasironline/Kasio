import { formatIDR } from '../../utils/formatters'

/**
 * MetricCards component for sales analytics overview.
 * Follows Apple HIG design: clean elevated cards, subtle borders,
 * clear typography hierarchy, and key performance indicators.
 */
export default function MetricCards({ data }) {
  const {
    totalRevenue = 0,
    totalOrders = 0,
    averageOrderValue = 0,
    cashRevenue = 0,
    qrisRevenue = 0,
    cashCount = 0,
    qrisCount = 0,
    period = 'today',
  } = data

  const periodLabel =
    period === 'today'
      ? '24 jam terakhir'
      : period === 'week'
      ? '7 hari terakhir'
      : '30 hari terakhir'

  const qrisPercentage =
    totalRevenue > 0 ? Math.round((qrisRevenue / totalRevenue) * 100) : 0
  const cashPercentage =
    totalRevenue > 0 ? 100 - qrisPercentage : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Omzet */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between text-left">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868B]">
            Total Omzet
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-sm">
            💰
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            {formatIDR(totalRevenue)}
          </h3>
          <p className="text-[12px] text-[#34C759] font-medium mt-1 flex items-center gap-1">
            <span>●</span> Transaksi berstatus selesai ({periodLabel})
          </p>
        </div>
      </div>

      {/* 2. Total Transaksi */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between text-left">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868B]">
            Total Transaksi
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-sm">
            🧾
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            {totalOrders} <span className="text-base font-semibold text-[#86868B]">Order</span>
          </h3>
          <p className="text-[12px] text-[#86868B] mt-1">
            Pesanan tercatat di kasir
          </p>
        </div>
      </div>

      {/* 3. Rata-rata Transaksi (AOV) */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between text-left">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868B]">
            Rata-rata Order (AOV)
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center font-bold text-sm">
            📊
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            {formatIDR(averageOrderValue)}
          </h3>
          <p className="text-[12px] text-[#86868B] mt-1">
            Rata-rata belanja per pelanggan
          </p>
        </div>
      </div>

      {/* 4. Pembayaran (QRIS vs Tunai) */}
      <div className="bg-white rounded-3xl p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between text-left">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868B]">
            Metode Bayar
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            📱
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {/* Progress bar split */}
          <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden flex">
            <div
              style={{ width: `${qrisPercentage}%` }}
              className="bg-[#0071E3] h-full transition-all"
              title={`QRIS: ${qrisPercentage}% (${formatIDR(qrisRevenue)})`}
            />
            <div
              style={{ width: `${cashPercentage}%` }}
              className="bg-[#34C759] h-full transition-all"
              title={`Tunai: ${cashPercentage}% (${formatIDR(cashRevenue)})`}
            />
          </div>

          <div className="flex justify-between text-[11px] font-semibold pt-0.5">
            <span className="text-[#0071E3]">
              QRIS: {qrisPercentage}% ({qrisCount}x)
            </span>
            <span className="text-[#34C759]">
              Tunai: {cashPercentage}% ({cashCount}x)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}