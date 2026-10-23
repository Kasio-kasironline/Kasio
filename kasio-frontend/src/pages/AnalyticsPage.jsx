import { useState, useEffect } from 'react'
import { fetchAnalyticsData, getEmptyAnalytics } from '../services/analyticsService'
import { useAuth } from '../hooks/useAuth'
import MetricCards from '../features/analytics/MetricCards'
import SalesBarChart from '../features/analytics/SalesBarChart'
import TopSellingTable from '../features/analytics/TopSellingTable'
import TransactionHistoryTable from '../features/analytics/TransactionHistoryTable'

/**
 * AnalyticsPage component connected to Supabase PostgreSQL database.
 * Displays real-time sales analytics, 24h history, top selling items,
 * and period filtering (Hari Ini, 7 Hari, 30 Hari).
 * Follows Apple Human Interface Guidelines: calm canvas, frosted header,
 * clean typography hierarchy, and content-first layout.
 */
export default function AnalyticsPage({ onNavigateToPos }) {
  const { business } = useAuth()

  // Filter periode: 'today' | 'week' | 'month'
  const [period, setPeriod] = useState('today')
  const [analyticsData, setAnalyticsData] = useState(() => getEmptyAnalytics('today'))
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Ambil data analitik secara otomatis dari Supabase setiap kali periode atau toko berubah
  useEffect(() => {
    let isCancelled = false

    async function loadData() {
      if (!business?.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await fetchAnalyticsData(business.id, period)
        if (!isCancelled) {
          setAnalyticsData(data)
        }
      } catch (err) {
        console.error('Gagal mengambil data analitik:', err)
        if (!isCancelled) {
          setErrorMessage(err.message || 'Gagal memuat data transaksi dari database.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isCancelled = true
    }
  }, [business?.id, period, refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

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
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0071E3] hover:bg-[#0071E3]/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Kembali ke Kasir</span>
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
                {business?.name || 'Kasio POS'} • Terhubung langsung dengan database transaksi
              </p>
            </div>
          </div>

          {/* Right: Controls (Refresh & Period Segmented Control) */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Tombol Segarkan Realtime */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Segarkan data transaksi terbaru"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#1D1D1F] bg-black/5 hover:bg-black/10 active:scale-95 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            {/* Apple-style Period Segmented Control */}
            <div className="flex items-center bg-black/5 p-1 rounded-2xl">
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
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert Banner if fetch fails */}
        {errorMessage && (
          <div className="p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/25 rounded-2xl flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">⚠️</span>
              <div className="text-[13px] text-[#1D1D1F]">
                <strong className="text-[#FF3B30]">Gagal memuat analitik:</strong> {errorMessage}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3 py-1 bg-white rounded-lg text-[12px] font-semibold text-[#1D1D1F] border border-black/10 hover:bg-black/5 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Realtime Sync Callout */}
        <div className="bg-gradient-to-r from-[#0071E3]/5 to-transparent border border-[#0071E3]/15 rounded-2xl p-4 flex items-start gap-3 text-left">
          <span className="text-xl shrink-0">⚡</span>
          <div className="text-[12px] text-[#1D1D1F] leading-relaxed">
            <strong className="font-semibold text-[#0071E3]">
              Sinkronisasi Otomatis Kasir:
            </strong>{' '}
            Setiap transaksi yang diselesaikan di kasir POS langsung tercatat di Supabase dan otomatis diagregasikan ke grafik omzet, menu terlaris, serta riwayat transaksi di bawah ini.
          </div>
        </div>

        {/* Section 1: KPI Metric Cards */}
        <section className={isLoading ? 'opacity-60 transition-opacity' : ''}>
          <MetricCards data={analyticsData} />
        </section>

        {/* Section 2: Visual Chart & Top Selling Items */}
        <section className={`grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch ${isLoading ? 'opacity-60 transition-opacity' : ''}`}>
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
        <section className={isLoading ? 'opacity-60 transition-opacity' : ''}>
          <TransactionHistoryTable
            transactions={analyticsData.recentTransactions}
            period={period}
          />
        </section>
      </main>
    </div>
  )
}