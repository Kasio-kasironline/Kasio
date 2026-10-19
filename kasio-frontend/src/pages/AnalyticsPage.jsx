import { useState, useMemo } from 'react'
import { getAnalyticsData } from '../data/dummyTransactions'
import MetricCards from '../features/analytics/MetricCards'
import SalesBarChart from '../features/analytics/SalesBarChart'
import TopSellingTable from '../features/analytics/TopSellingTable'
import TransactionHistoryTable from '../features/analytics/TransactionHistoryTable'

/**
 * AnalyticsPage component.
 * Dashboard displaying sales analytics, daily 24h history, top selling items,
 * and period filtering (Hari Ini, 7 Hari, 30 Hari).
 * Follows Apple Human Interface Guidelines: calm canvas, frosted header,
 * clean typography hierarchy, and content-first layout.
 */
export default function AnalyticsPage({ onNavigateToPos }) {
  // Period filter state: 'today' | 'week' | 'month'
  const [period, setPeriod] = useState('today')

  // Compute analytics data memoized by period
  const analyticsData = useMemo(() => {
    return getAnalyticsData(period)
  }, [period])

  const periodOptions = [
    { id: 'today', label: 'Hari Ini (24 Jam)' },
    { id: 'week', label: '7 Hari Terakhir' },
    { id: 'month', label: '30 Hari Terakhir' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans">
      {/* Top Navigation Bar (Apple HIG sticky frosted glass) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Back Button & Title */}
          <div className="flex items-center gap-3">
            {onNavigateToPos && (
              <button
                type="button"
                onClick={onNavigateToPos}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1D1D1F] bg-black/5 hover:bg-black/10 active:scale-95 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <span>←</span>
                <span>Kasir POS</span>
              </button>
            )}

            <div className="h-5 w-px bg-black/10 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1D1D1F]">
                  Analitik & Laporan Penjualan
                </h1>
              </div>
              <p className="text-[11px] text-[#86868B]">
                Kopi & Rasa Nusantara • Pantau performa bisnis secara realtime
              </p>
            </div>
          </div>

          {/* Right: Apple-style Period Segmented Control */}
          <div className="flex items-center bg-black/5 p-1 rounded-2xl self-start md:self-auto">
            {periodOptions.map((opt) => {
              const isActive = period === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1D1D1F] shadow-sm'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Architecture & Performance Tip Callout */}
        <div className="bg-gradient-to-r from-[#0071E3]/5 to-transparent border border-[#0071E3]/15 rounded-2xl p-4 flex items-start gap-3 text-left">
          <span className="text-xl shrink-0">💡</span>
          <div className="text-[12px] text-[#1D1D1F] leading-relaxed">
            <strong className="font-semibold text-[#0071E3]">
              Optimalisasi Database & Riwayat 24 Jam:
            </strong>{' '}
            Data transaksi kasir tidak perlu di-reset atau dihapus setiap 24 jam agar pembukuan, rekonsiliasi kas, dan laporan bulanan tetap akurat. Sistem menggunakan query rentang waktu dengan index (misal <code>idx_orders_analytics</code>) sehingga beban query tetap sangat ringan & instan.
          </div>
        </div>

        {/* Section 1: KPI Metric Cards */}
        <section>
          <MetricCards data={analyticsData} />
        </section>

        {/* Section 2: Visual Chart & Top Selling Items */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <SalesBarChart
              chartData={analyticsData.chartData}
              period={period}
            />
          </div>
          <div className="lg:col-span-1">
            <TopSellingTable items={analyticsData.topSellingItems} />
          </div>
        </section>

        {/* Section 3: Detailed Transaction Log Table */}
        <section>
          <TransactionHistoryTable
            transactions={analyticsData.recentTransactions}
            period={period}
          />
        </section>
      </main>
    </div>
  )
}