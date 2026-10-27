import { Banknote, QrCode } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { formatIDR } from '../../utils/formatters'

/**
 * PaymentModal component for Cashier checkout.
 * Follows Apple Pay / Wallet modal aesthetic.
 * Supports Cash payment (with auto change calculator) and Static QRIS payment.
 */
export default function PaymentModal({
  isOpen,
  onClose,
  cart = [],
  onPaymentSuccess,
  business,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash') // 'cash' | 'qris'
  const [cashTendered, setCashTendered] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [paymentError, setPaymentError] = useState('')

  if (!isOpen) return null

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  )
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const numericCash = parseInt(cashTendered, 10) || 0
  const changeAmount = Math.max(0, numericCash - grandTotal)
  const isCashSufficient = numericCash >= grandTotal

  const handleQuickCash = (amount) => {
    setCashTendered(amount.toString())
  }


  const handleConfirmPayment = async () => {
    if (isProcessing || cart.length === 0) return

    if (paymentMethod === 'cash' && !isCashSufficient) {
      setPaymentError('Uang tunai yang diterima belum mencukupi.')
      return
    }

    setPaymentError('')
    setIsProcessing(true)

    try {
      const { data, error } = await supabase.rpc('create_pos_order', {
        p_items: cart.map(({ item, quantity }) => ({
          menu_item_id: item.id,
          quantity,
        })),
        p_payment_method: paymentMethod === 'cash' ? 'cash' : 'qris',
        p_notes: null,
      })

      if (error) throw error

      if (!data?.id || !data?.order_number) {
        throw new Error('Respons transaksi dari database tidak lengkap.')
      }

      const receipt = {
        orderId: data.id,
        orderNumber: data.order_number,
        date: new Date(data.created_at).toLocaleString('id-ID'),
        items: cart,
        totalAmount: Number(data.total_amount),
        paymentMethod:
          data.payment_method === 'cash'
            ? 'Tunai'
            : 'QRIS Statis (konfirmasi manual)',
        cashTendered:
          paymentMethod === 'cash' ? numericCash : grandTotal,
        change: paymentMethod === 'cash' ? changeAmount : 0,
      }

      setReceiptData(receipt)
      onPaymentSuccess?.(receipt)
    } catch (error) {
      console.error('Gagal menyimpan transaksi:', error)

      setPaymentError(
        error.message ||
        'Transaksi gagal disimpan. Silakan coba kembali.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCloseAll = () => {
    setReceiptData(null)
    setCashTendered('')
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-6 sm:p-7 text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseAll}
          aria-label="Tutup modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#1D1D1F] flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {receiptData ? (
          /* Struk Digital / Receipt View */
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center text-2xl mb-3">
              ✓
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F]">
              Pembayaran Berhasil!
            </h3>
            <p className="text-[13px] text-[#86868B] mt-0.5">
              {receiptData.orderNumber}
            </p>

            <div className="w-full my-5 p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-left text-[13px] space-y-2.5">
              <div className="flex justify-between text-[#86868B]">
                <span>Waktu</span>
                <span className="font-medium text-[#1D1D1F]">{receiptData.date}</span>
              </div>
              <div className="flex justify-between text-[#86868B]">
                <span>Metode Pembayaran</span>
                <span className="font-semibold text-[#0071E3]">{receiptData.paymentMethod}</span>
              </div>

              <div className="pt-2 border-t border-black/[0.06] divide-y divide-black/[0.04]">
                {receiptData.items.map(({ item, quantity }) => (
                  <div key={item.id} className="py-1.5 flex justify-between">
                    <span className="text-[#1D1D1F]">
                      {item.name} <span className="text-[#86868B]">×{quantity}</span>
                    </span>
                    <span className="font-medium text-[#1D1D1F]">
                      {formatIDR(item.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-black/[0.06] space-y-1">
                <div className="flex justify-between text-[14px] font-bold text-[#1D1D1F]">
                  <span>Total Tagihan</span>
                  <span>{formatIDR(receiptData.totalAmount)}</span>
                </div>
                {receiptData.paymentMethod === 'Tunai' && (
                  <>
                    <div className="flex justify-between text-[#86868B] text-[12px]">
                      <span>Uang Diterima</span>
                      <span>{formatIDR(receiptData.cashTendered)}</span>
                    </div>
                    <div className="flex justify-between text-[#34C759] font-semibold text-[13px]">
                      <span>Uang Kembalian</span>
                      <span>{formatIDR(receiptData.change)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleCloseAll}
                className="w-full font-semibold"
              >
                Pesanan Baru
              </Button>
            </div>
          </div>
        ) : (
          /* Checkout Payment Flow */
          <div>
            <div className="mb-4">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-1 rounded-full">
                Selesaikan Pembayaran
              </span>
              <h3 className="text-2xl font-bold text-[#1D1D1F] mt-2 tracking-tight">
                {formatIDR(grandTotal)}
              </h3>
              <p className="text-[13px] text-[#86868B] mt-0.5">
                Total {totalItems} item pesanan pelanggan
              </p>
            </div>

            {/* Apple-style Segmented Control */}
            <div className="p-1 rounded-2xl bg-black/[0.05] grid grid-cols-2 gap-1 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`inline-flex items-center justify-center gap-2 py-2 text-[14px] font-semibold rounded-xl transition-all cursor-pointer ${paymentMethod === 'cash'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
              >
                <Banknote className="w-4 h-4 shrink-0" />
                <span>Tunai (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`inline-flex items-center justify-center gap-2 py-2 text-[14px] font-semibold rounded-xl transition-all cursor-pointer ${paymentMethod === 'qris'
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>QRIS Statis</span>
              </button>

            </div>

            {/* Payment Mode Body */}

            {paymentError && (
              <p role="alert" className="text-sm text-red-600">
                {paymentError}
              </p>
            )}
            {paymentMethod === 'cash' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cash-input" className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">
                    Jumlah Uang Diterima
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#86868B]">
                      Rp
                    </span>
                    <input
                      id="cash-input"
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder="Contoh: 50000"
                      className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-black/[0.12] focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 text-[16px] font-semibold text-[#1D1D1F]"
                    />
                  </div>
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(grandTotal)}
                    className="flex-1 py-1.5 px-2 bg-black/[0.04] hover:bg-black/[0.08] active:scale-95 text-[#1D1D1F] text-[12px] font-medium rounded-xl transition-all cursor-pointer"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(50000)}
                    className="flex-1 py-1.5 px-2 bg-black/[0.04] hover:bg-black/[0.08] active:scale-95 text-[#1D1D1F] text-[12px] font-medium rounded-xl transition-all cursor-pointer"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(100000)}
                    className="flex-1 py-1.5 px-2 bg-black/[0.04] hover:bg-black/[0.08] active:scale-95 text-[#1D1D1F] text-[12px] font-medium rounded-xl transition-all cursor-pointer"
                  >
                    Rp 100.000
                  </button>
                </div>

                {/* Change preview */}
                <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-between text-[14px]">
                  <span className="text-[#86868B]">Uang Kembalian</span>
                  <span className={`font-bold ${numericCash > 0 && !isCashSufficient ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
                    {numericCash > 0 && !isCashSufficient
                      ? `Kurang ${formatIDR(grandTotal - numericCash)}`
                      : formatIDR(changeAmount)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={!isCashSufficient || isProcessing}
                  isLoading={isProcessing}
                  onClick={handleConfirmPayment}
                  className="w-full mt-2 font-semibold bg-[#34C759] hover:bg-[#30B753] active:bg-[#289B46]"
                >
                  Konfirmasi Pembayaran Tunai
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* QRIS Display Container */}
                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-black/[0.08] shadow-inner text-center">
                  {business?.qris_image_url ? (
                    <div className="w-52 h-52 rounded-xl bg-white flex items-center justify-center p-2 border border-black/10 shadow-sm overflow-hidden">
                      <img
                        src={business.qris_image_url}
                        alt={`QRIS ${business.name || 'Toko'}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-xl bg-neutral-900 flex flex-col items-center justify-center text-white p-3 relative overflow-hidden shadow-md">
                      {/* Mock QR graphic */}
                      <div className="w-full h-full bg-white p-2 rounded-lg flex flex-col items-center justify-center">
                        <div className="grid grid-cols-6 gap-1 w-full h-full p-1 border-2 border-black">
                          {Array.from({ length: 36 }).map((_, i) => (
                            <div
                              key={i}
                              className={`rounded-xs ${(i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                                ? 'bg-black'
                                : 'bg-transparent'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <span className="text-[13px] font-bold text-[#1D1D1F] mt-3 uppercase tracking-tight">
                    {business?.name ? `QRIS ${business.name}` : 'QRIS TOKO SAYA'}
                  </span>
                  <p className="text-[12px] text-[#86868B] mt-1 max-w-[260px] leading-relaxed">
                    {business?.qris_image_url
                      ? 'Arahkan pelanggan memindai QRIS di atas melalui mobile banking atau e-wallet (GoPay, OVO, Dana).'
                      : 'Belum ada QRIS toko yang diunggah. Atur foto QRIS Anda melalui menu Kelola Menu > Pengaturan Tambahan.'}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={isProcessing}
                  isLoading={isProcessing}
                  onClick={handleConfirmPayment}
                  className="w-full font-semibold bg-[#34C759] hover:bg-[#30B753] active:bg-[#289B46]"
                >
                  Konfirmasi Pembayaran QRIS Diterima
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}