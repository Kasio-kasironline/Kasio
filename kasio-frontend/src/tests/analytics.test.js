import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Logika default saat data transaksi kosong (mencerminkan getEmptyAnalytics)
 */
function getEmptyAnalytics(period = 'today') {
  const chartData =
    period === 'today'
      ? [
          { key: '06-09', dayName: '06-09', dayLabel: '06:00 - 09:00', revenue: 0, orderCount: 0 },
          { key: '09-12', dayName: '09-12', dayLabel: '09:00 - 12:00', revenue: 0, orderCount: 0 },
          { key: '12-15', dayName: '12-15', dayLabel: '12:00 - 15:00', revenue: 0, orderCount: 0 },
          { key: '15-18', dayName: '15-18', dayLabel: '15:00 - 18:00', revenue: 0, orderCount: 0 },
          { key: '18-21', dayName: '18-21', dayLabel: '18:00 - 21:00', revenue: 0, orderCount: 0 },
          { key: '21-24', dayName: '21-24', dayLabel: '21:00 - 24:00', revenue: 0, orderCount: 0 },
        ]
      : []

  return {
    period,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    cashRevenue: 0,
    qrisRevenue: 0,
    cashCount: 0,
    qrisCount: 0,
    topSellingItems: [],
    chartData,
    dailyChartData: chartData,
    recentTransactions: [],
  }
}

/**
 * Logika agregasi metrik penjualan analitik (mencerminkan fetchAnalyticsData)
 */
function aggregateSalesData(orders) {
  const completedOrders = orders.filter((o) => o.payment_status === 'completed')

  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0
  )
  const totalOrders = completedOrders.length
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  let cashRevenue = 0
  let qrisRevenue = 0
  let cashCount = 0
  let qrisCount = 0

  completedOrders.forEach((o) => {
    const amount = Number(o.total_amount || 0)
    if (o.payment_method === 'cash') {
      cashRevenue += amount
      cashCount += 1
    } else {
      qrisRevenue += amount
      qrisCount += 1
    }
  })

  // Agregasi Menu Terlaris (Top Selling Items)
  const itemMap = {}
  completedOrders.forEach((o) => {
    if (Array.isArray(o.order_items)) {
      o.order_items.forEach((item) => {
        const name = item.item_name
        if (!itemMap[name]) {
          itemMap[name] = { name, quantity: 0, revenue: 0 }
        }
        itemMap[name].quantity += Number(item.quantity || 0)
        itemMap[name].revenue += Number(item.subtotal || 0)
      })
    }
  })

  const topSellingItems = Object.values(itemMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0,
    }))

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    cashRevenue,
    qrisRevenue,
    cashCount,
    qrisCount,
    topSellingItems,
  }
}

describe('4. Sales Analytics & Aggregation Engine', () => {
  describe('Penanganan Data Kosong (Initial State)', () => {
    it('getEmptyAnalytics() mengembalikan struktur default bernilai 0 yang aman', () => {
      const empty = getEmptyAnalytics('today')
      assert.strictEqual(empty.totalRevenue, 0)
      assert.strictEqual(empty.totalOrders, 0)
      assert.strictEqual(empty.averageOrderValue, 0)
      assert.strictEqual(empty.cashRevenue, 0)
      assert.strictEqual(empty.qrisRevenue, 0)
      assert.deepStrictEqual(empty.topSellingItems, [])
      assert.ok(Array.isArray(empty.chartData))
    })
  })

  describe('Agregasi Transaksi Penjualan', () => {
    const sampleOrders = [
      {
        id: 'ord-1',
        total_amount: 30000,
        payment_method: 'cash',
        payment_status: 'completed',
        order_items: [
          { item_name: 'Kopi Susu', quantity: 2, subtotal: 30000 },
        ],
      },
      {
        id: 'ord-2',
        total_amount: 45000,
        payment_method: 'qris',
        payment_status: 'completed',
        order_items: [
          { item_name: 'Kopi Susu', quantity: 1, subtotal: 15000 },
          { item_name: 'Croissant', quantity: 1, subtotal: 30000 },
        ],
      },
      {
        id: 'ord-3',
        total_amount: 100000,
        payment_method: 'cash',
        payment_status: 'cancelled', // Order batal, tidak boleh dihitung ke omzet
        order_items: [
          { item_name: 'Biji Kopi 1kg', quantity: 1, subtotal: 100000 },
        ],
      },
    ]

    it('menghitung total omzet hanya dari transaksi yang berstatus completed', () => {
      const stats = aggregateSalesData(sampleOrders)
      // ord-1 (30.000) + ord-2 (45.000) = 75.000. ord-3 dibatalkan jadi diabaikan
      assert.strictEqual(stats.totalRevenue, 75000)
      assert.strictEqual(stats.totalOrders, 2)
    })

    it('menghitung Rata-rata Nilai Pesanan (AOV) dengan benar', () => {
      const stats = aggregateSalesData(sampleOrders)
      // 75.000 / 2 pesanan = 37.500
      assert.strictEqual(stats.averageOrderValue, 37500)
    })

    it('memisahkan omzet dan kuantitas transaksi antara Cash dan QRIS secara akurat', () => {
      const stats = aggregateSalesData(sampleOrders)
      assert.strictEqual(stats.cashRevenue, 30000)
      assert.strictEqual(stats.cashCount, 1)
      assert.strictEqual(stats.qrisRevenue, 45000)
      assert.strictEqual(stats.qrisCount, 1)
    })

    it('mengagregasikan menu terlaris dan mengurutkannya berdasarkan kuantitas terbanyak', () => {
      const stats = aggregateSalesData(sampleOrders)
      const topItems = stats.topSellingItems

      // Kopi Susu terjual 2 + 1 = 3 porsi (Peringkat #1)
      // Croissant terjual 1 porsi (Peringkat #2)
      assert.strictEqual(topItems.length, 2)
      assert.strictEqual(topItems[0].name, 'Kopi Susu')
      assert.strictEqual(topItems[0].quantity, 3)
      assert.strictEqual(topItems[0].revenue, 45000)
      assert.strictEqual(topItems[0].percentage, 60) // (45000 / 75000) * 100 = 60%

      assert.strictEqual(topItems[1].name, 'Croissant')
      assert.strictEqual(topItems[1].quantity, 1)
      assert.strictEqual(topItems[1].percentage, 40) // (30000 / 75000) * 100 = 40%
    })
  })
})

