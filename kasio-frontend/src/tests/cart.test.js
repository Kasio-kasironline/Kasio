import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Helper logika perhitungan kasir POS (mencerminkan logika di PosPage & PaymentModal)
 */
function calculateCartTotals(cart) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const grandTotal = cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  )
  return { totalItems, grandTotal }
}

function calculateCashChange(grandTotal, tenderedAmount) {
  const tendered = Number(tenderedAmount) || 0
  const isSufficient = tendered >= grandTotal
  const change = isSufficient ? tendered - grandTotal : 0
  return { isSufficient, change, shortfall: isSufficient ? 0 : grandTotal - tendered }
}

describe('2. POS Cart & Cashier Calculations', () => {
  const dummyItemA = { id: 'item-1', name: 'Kopi Susu Gula Aren', price: 18000 }
  const dummyItemB = { id: 'item-2', name: 'Roti Bakar Cokelat', price: 15000 }

  describe('Perhitungan Total Keranjang Belanja', () => {
    it('mengembalikan total 0 jika keranjang kosong', () => {
      const { totalItems, grandTotal } = calculateCartTotals([])
      assert.strictEqual(totalItems, 0)
      assert.strictEqual(grandTotal, 0)
    })

    it('menghitung subtotal item tunggal dengan kuantitas lebih dari 1', () => {
      const cart = [{ item: dummyItemA, quantity: 3 }]
      const { totalItems, grandTotal } = calculateCartTotals(cart)

      assert.strictEqual(totalItems, 3)
      assert.strictEqual(grandTotal, 54000) // 18000 * 3
    })

    it('menghitung akumulasi grand total dari beberapa macam produk', () => {
      const cart = [
        { item: dummyItemA, quantity: 2 }, // 36000
        { item: dummyItemB, quantity: 1 }, // 15000
      ]
      const { totalItems, grandTotal } = calculateCartTotals(cart)

      assert.strictEqual(totalItems, 3)
      assert.strictEqual(grandTotal, 51000)
    })

    it('memperbarui total secara akurat saat item dihapus dari keranjang', () => {
      let cart = [
        { item: dummyItemA, quantity: 2 },
        { item: dummyItemB, quantity: 1 },
      ]

      // Hapus item B
      cart = cart.filter((line) => line.item.id !== dummyItemB.id)
      const { totalItems, grandTotal } = calculateCartTotals(cart)

      assert.strictEqual(totalItems, 2)
      assert.strictEqual(grandTotal, 36000)
    })
  })

  describe('Perhitungan Pembayaran Tunai & Uang Kembalian (Cash Change)', () => {
    const totalTagihan = 42000

    it('menghitung uang pas (kembalian Rp 0)', () => {
      const { isSufficient, change, shortfall } = calculateCashChange(totalTagihan, 42000)
      assert.strictEqual(isSufficient, true)
      assert.strictEqual(change, 0)
      assert.strictEqual(shortfall, 0)
    })

    it('menghitung kembalian uang lebih dengan presisi', () => {
      const { isSufficient, change, shortfall } = calculateCashChange(totalTagihan, 50000)
      assert.strictEqual(isSufficient, true)
      assert.strictEqual(change, 8000) // 50000 - 42000
      assert.strictEqual(shortfall, 0)
    })

    it('mendeteksi jika uang tunai yang diberikan kurang (pembayaran belum cukup)', () => {
      const { isSufficient, change, shortfall } = calculateCashChange(totalTagihan, 30000)
      assert.strictEqual(isSufficient, false)
      assert.strictEqual(change, 0)
      assert.strictEqual(shortfall, 12000) // Kurang 12000
    })

    it('menolak nilai input nominal bayar yang tidak valid atau negatif', () => {
      const { isSufficient, change } = calculateCashChange(totalTagihan, -10000)
      assert.strictEqual(isSufficient, false)
      assert.strictEqual(change, 0)
    })
  })
})

