import { useState, useMemo } from 'react'
import { formatIDR } from '../../utils/formatters'
import { Search, QrCode, Banknote, Receipt, X } from 'lucide-react'

/**
 * TransactionHistoryTable component.
 * Displays daily/periodic transaction records with search, filter,
 * and an Apple-inspired receipt inspection modal.
 */
export default function TransactionHistoryTable({ transactions = [], period = 'today' }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('Semua')
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      const matchMethod =
        methodFilter === 'Semua' || tx.paymentMethod === methodFilter
      const query = searchQuery.trim().toLowerCase()
      const matchQuery =
        !query ||
        tx.orderNumber.toLowerCase().includes(query) ||
        tx.items.some((item) => item.name.toLowerCase().includes(query))

      return matchMethod && matchQuery
    })
  }, [transactions, methodFilter, searchQuery])

  // Format date helper
  const formatDateTime = (isoString) => {
    try {
      const d = new Date(isoString)
      return {
        date: d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        }),
        time: d.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
    } catch {
      return { date: '-', time: '-' }
    }
  }

  const periodLabel =
    period === 'today'
      ? '24 Jam Terakhir'
      : period === 'week'
      ? '7 Hari Terakhir'
      : '30 Hari Terakhir'

  return (
    <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-left">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-black/[0.04]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#1D1D1F] tracking-tight">
              Riwayat Transaksi Penjualan
            </h3>
          </div>
          <p className="text-[12px] text-[#86868B] mt-0.5">
            Log data transaksi kasir ({periodLabel}) • {filteredList.length} transaksi ditemukan
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Method Filter Pills */}
          <div className="flex items-center bg-black/4 p-1 rounded-xl">
            {['Semua', 'QRIS Statis', 'Tunai'].map((method) => {
              const isActive = methodFilter === method
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setMethodFilter(method)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#1D1D1F] shadow-xs'
                      : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  {method === 'QRIS Statis' ? 'QRIS' : method}
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no. invoice / menu..."
              className="w-full sm:w-56 pl-8 pr-7 py-1.5 bg-black/4 hover:bg-black/6 focus:bg-white rounded-xl border border-transparent focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 text-[12px] text-[#1D1D1F] placeholder-[#86868B] transition-all outline-none"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] text-[11px] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table for Desktop / Large Screens */}
      <div className="hidden md:block overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.04] text-[11px] font-bold uppercase tracking-wider text-[#86868B]">
              <th className="py-3 px-3">Waktu</th>
              <th className="py-3 px-3">No. Invoice</th>
              <th className="py-3 px-3">Rincian Menu</th>
              <th className="py-3 px-3">Metode</th>
              <th className="py-3 px-3 text-right">Total</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03] text-[13px]">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#86868B]">
                  Tidak ada transaksi yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filteredList.map((tx) => {
                const { date, time } = formatDateTime(tx.createdAt)
                const isQRIS = tx.paymentMethod === 'QRIS Statis'

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-black/[0.015] transition-colors group"
                  >
                    {/* Waktu */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-[#1D1D1F]">{time} WIB</div>
                      <div className="text-[11px] text-[#86868B]">{date}</div>
                    </td>

                    {/* Invoice */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[12px] font-semibold text-[#1D1D1F]">
                      {tx.orderNumber}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-3 max-w-xs truncate text-[#1D1D1F]">
                      {tx.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>

                    {/* Payment Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isQRIS
                            ? 'bg-[#0071E3]/10 text-[#0071E3]'
                            : 'bg-[#34C759]/10 text-[#34C759]'
                        }`}
                      >
                        {isQRIS ? <QrCode className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                        <span>{tx.paymentMethod}</span>
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-right font-bold text-[#1D1D1F]">
                      {formatIDR(tx.totalAmount)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(tx)}
                        className="text-[12px] font-semibold text-[#0071E3] hover:text-[#0077ED] bg-[#0071E3]/6 hover:bg-[#0071E3]/12 px-3 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        Lihat Struk
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile Screens */}
      <div className="md:hidden divide-y divide-black/[0.04] mt-2">
        {filteredList.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[#86868B]">
            Tidak ada transaksi yang cocok.
          </div>
        ) : (
          filteredList.map((tx) => {
            const { date, time } = formatDateTime(tx.createdAt)
            const isQRIS = tx.paymentMethod === 'QRIS Statis'

            return (
              <div key={tx.id} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-mono font-bold text-[#1D1D1F]">
                    {tx.orderNumber}
                  </span>
                  <span className="text-[#86868B]">
                    {date} • {time} WIB
                  </span>
                </div>

                <div className="text-[13px] text-[#1D1D1F] line-clamp-2">
                  {tx.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      isQRIS
                        ? 'bg-[#0071E3]/10 text-[#0071E3]'
                        : 'bg-[#34C759]/10 text-[#34C759]'
                    }`}
                  >
                    {isQRIS ? <QrCode className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                    <span>{tx.paymentMethod}</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-bold text-[#1D1D1F]">
                      {formatIDR(tx.totalAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(tx)}
                      className="text-[12px] font-semibold text-[#0071E3] bg-[#0071E3]/8 px-2.5 py-1 rounded-lg"
                    >
                      Struk
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Struk Modal Popup (Apple HIG sheet) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-black/[0.08] relative text-left">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] cursor-pointer"
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-dashed border-black/15">
              <h4 className="text-base font-extrabold text-[#1D1D1F] tracking-tight mt-1">
                Kasio POS
              </h4>
              <p className="text-[11px] text-[#86868B]">Kopi & Rasa Nusantara</p>
              <div className="mt-2 text-[11px] text-[#86868B] font-mono">
                {selectedReceipt.orderNumber}
              </div>
              <div className="text-[11px] text-[#86868B]">
                {new Date(selectedReceipt.createdAt).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Receipt Items */}
            <div className="py-4 space-y-2 max-h-56 overflow-y-auto divide-y divide-black/[0.04]">
              {selectedReceipt.items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex justify-between text-[12px]">
                  <div>
                    <span className="font-semibold text-[#1D1D1F]">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="block text-[10px] text-[#86868B]">
                      @{formatIDR(item.price)}
                    </span>
                  </div>
                  <span className="font-bold text-[#1D1D1F]">
                    {formatIDR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Receipt Totals */}
            <div className="pt-3 border-t border-dashed border-black/15 space-y-1.5 text-[12px]">
              <div className="flex justify-between font-bold text-[14px] text-[#1D1D1F]">
                <span>Total Bayar</span>
                <span>{formatIDR(selectedReceipt.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[#86868B]">
                <span>Metode Pembayaran</span>
                <span className="font-semibold text-[#1D1D1F]">
                  {selectedReceipt.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-[#86868B]">
                <span>Status</span>
                <span className="text-[#34C759] font-bold">LUNAS</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm"
              >
                Tutup Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}