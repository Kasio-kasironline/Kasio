/**
 * Helper to generate dates relative to today.
 */
function getDateNDaysAgo(daysAgo, hour = 12, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/**
 * Realistic dummy transaction data for UMKM coffee & food business.
 * Seeded across today (last 24 hours), the past 7 days, and the past 30 days.
 */
export const DUMMY_TRANSACTIONS = [
  // --- Transaksi Hari Ini (24 Jam Terakhir) ---
  {
    id: 'tx-001',
    orderNumber: 'INV-20261019-1082',
    createdAt: getDateNDaysAgo(0, 8, 15),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Kopi Susu Gula Aren', price: 18000, quantity: 2 },
      { name: 'Roti Bakar Coklat Keju', price: 16000, quantity: 1 },
    ],
    totalAmount: 52000,
  },
  {
    id: 'tx-002',
    orderNumber: 'INV-20261019-1083',
    createdAt: getDateNDaysAgo(0, 9, 40),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [
      { name: 'Americano Dingin', price: 15000, quantity: 1 },
      { name: 'Pisang Goreng Wijen', price: 15000, quantity: 1 },
    ],
    totalAmount: 30000,
  },
  {
    id: 'tx-003',
    orderNumber: 'INV-20261019-1084',
    createdAt: getDateNDaysAgo(0, 11, 20),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Nasi Goreng Spesial', price: 25000, quantity: 2 },
      { name: 'Lemon Tea Segar', price: 12000, quantity: 2 },
    ],
    totalAmount: 74000,
  },
  {
    id: 'tx-004',
    orderNumber: 'INV-20261019-1085',
    createdAt: getDateNDaysAgo(0, 13, 0),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [
      { name: 'Mie Nyemek Makmur', price: 20000, quantity: 1 },
      { name: 'Matcha Latte', price: 20000, quantity: 1 },
      { name: 'Kentang Goreng Truffle', price: 18000, quantity: 1 },
    ],
    totalAmount: 58000,
  },
  {
    id: 'tx-005',
    orderNumber: 'INV-20261019-1086',
    createdAt: getDateNDaysAgo(0, 15, 10),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Kopi Susu Gula Aren', price: 18000, quantity: 3 },
      { name: 'Cireng Krispi Bumbu Rujak', price: 14000, quantity: 2 },
    ],
    totalAmount: 82000,
  },
  {
    id: 'tx-006',
    orderNumber: 'INV-20261019-1087',
    createdAt: getDateNDaysAgo(0, 17, 45),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Caramel Macchiato', price: 22000, quantity: 2 },
      { name: 'Roti Bakar Coklat Keju', price: 16000, quantity: 2 },
    ],
    totalAmount: 76000,
  },
  {
    id: 'tx-007',
    orderNumber: 'INV-20261019-1088',
    createdAt: getDateNDaysAgo(0, 19, 15),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [
      { name: 'Earl Grey Milk Tea', price: 18000, quantity: 1 },
      { name: 'Kentang Goreng Truffle', price: 18000, quantity: 1 },
    ],
    totalAmount: 36000,
  },

  // --- Transaksi Hari-hari Sebelumnya (Mingguan & Bulanan) ---
  {
    id: 'tx-008',
    orderNumber: 'INV-20261018-0951',
    createdAt: getDateNDaysAgo(1, 10, 30),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [{ name: 'Kopi Susu Gula Aren', price: 18000, quantity: 2 }],
    totalAmount: 36000,
  },
  {
    id: 'tx-009',
    orderNumber: 'INV-20261018-0952',
    createdAt: getDateNDaysAgo(1, 14, 0),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Nasi Goreng Spesial', price: 25000, quantity: 3 },
      { name: 'Lemon Tea Segar', price: 12000, quantity: 3 },
    ],
    totalAmount: 111000,
  },
  {
    id: 'tx-010',
    orderNumber: 'INV-20261018-0953',
    createdAt: getDateNDaysAgo(1, 18, 20),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Caramel Macchiato', price: 22000, quantity: 2 },
      { name: 'Cireng Krispi Bumbu Rujak', price: 14000, quantity: 2 },
    ],
    totalAmount: 72000,
  },
  {
    id: 'tx-011',
    orderNumber: 'INV-20261017-0840',
    createdAt: getDateNDaysAgo(2, 11, 15),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [
      { name: 'Mie Nyemek Makmur', price: 20000, quantity: 2 },
      { name: 'Matcha Latte', price: 20000, quantity: 2 },
    ],
    totalAmount: 80000,
  },
  {
    id: 'tx-012',
    orderNumber: 'INV-20261017-0841',
    createdAt: getDateNDaysAgo(2, 16, 50),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Kopi Susu Gula Aren', price: 18000, quantity: 4 },
      { name: 'Kentang Goreng Truffle', price: 18000, quantity: 2 },
    ],
    totalAmount: 108000,
  },
  {
    id: 'tx-013',
    orderNumber: 'INV-20261016-0730',
    createdAt: getDateNDaysAgo(3, 9, 20),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [
      { name: 'Americano Dingin', price: 15000, quantity: 2 },
      { name: 'Roti Bakar Coklat Keju', price: 16000, quantity: 1 },
    ],
    totalAmount: 46000,
  },
  {
    id: 'tx-014',
    orderNumber: 'INV-20261016-0731',
    createdAt: getDateNDaysAgo(3, 15, 10),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Kopi Susu Gula Aren', price: 18000, quantity: 3 },
      { name: 'Pisang Goreng Wijen', price: 15000, quantity: 2 },
    ],
    totalAmount: 84000,
  },
  {
    id: 'tx-015',
    orderNumber: 'INV-20261015-0620',
    createdAt: getDateNDaysAgo(4, 12, 30),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Nasi Goreng Spesial', price: 25000, quantity: 2 },
      { name: 'Caramel Macchiato', price: 22000, quantity: 2 },
    ],
    totalAmount: 94000,
  },
  {
    id: 'tx-016',
    orderNumber: 'INV-20261014-0510',
    createdAt: getDateNDaysAgo(5, 17, 0),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [
      { name: 'Mie Nyemek Makmur', price: 20000, quantity: 3 },
      { name: 'Lemon Tea Segar', price: 12000, quantity: 3 },
    ],
    totalAmount: 96000,
  },
  {
    id: 'tx-017',
    orderNumber: 'INV-20261013-0401',
    createdAt: getDateNDaysAgo(6, 14, 25),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Kopi Susu Gula Aren', price: 18000, quantity: 5 },
      { name: 'Cireng Krispi Bumbu Rujak', price: 14000, quantity: 3 },
    ],
    totalAmount: 132000,
  },
  {
    id: 'tx-018',
    orderNumber: 'INV-20261010-0101',
    createdAt: getDateNDaysAgo(9, 13, 0),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Matcha Latte', price: 20000, quantity: 2 },
      { name: 'Kentang Goreng Truffle', price: 18000, quantity: 1 },
    ],
    totalAmount: 58000,
  },
  {
    id: 'tx-019',
    orderNumber: 'INV-20261005-0012',
    createdAt: getDateNDaysAgo(14, 16, 45),
    paymentMethod: 'Tunai',
    status: 'Selesai',
    items: [
      { name: 'Nasi Goreng Spesial', price: 25000, quantity: 4 },
      { name: 'Earl Grey Milk Tea', price: 18000, quantity: 4 },
    ],
    totalAmount: 172000,
  },
  {
    id: 'tx-020',
    orderNumber: 'INV-20260928-0001',
    createdAt: getDateNDaysAgo(21, 11, 10),
    paymentMethod: 'QRIS Statis',
    status: 'Selesai',
    items: [
      { name: 'Kopi Susu Gula Aren', price: 18000, quantity: 6 },
      { name: 'Roti Bakar Coklat Keju', price: 16000, quantity: 2 },
    ],
    totalAmount: 140000,
  },
]

/**
 * Filter transactions and compute analytics metrics based on period.
 * @param {'today' | 'week' | 'month'} period
 * @param {Array} transactions
 */
export function getAnalyticsData(period = 'today', transactions = DUMMY_TRANSACTIONS) {
  const now = new Date()
  const cutoff = new Date()

  if (period === 'today') {
    cutoff.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    cutoff.setDate(now.getDate() - 7)
    cutoff.setHours(0, 0, 0, 0)
  } else {
    cutoff.setDate(now.getDate() - 30)
    cutoff.setHours(0, 0, 0, 0)
  }

  // Filter transactions within range
  const filtered = transactions.filter((tx) => new Date(tx.createdAt) >= cutoff)

  // Overall metrics
  const totalRevenue = filtered.reduce((sum, tx) => sum + tx.totalAmount, 0)
  const totalOrders = filtered.length
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Payment Breakdown
  let cashRevenue = 0
  let qrisRevenue = 0
  let cashCount = 0
  let qrisCount = 0

  filtered.forEach((tx) => {
    if (tx.paymentMethod === 'Tunai') {
      cashRevenue += tx.totalAmount
      cashCount += 1
    } else {
      qrisRevenue += tx.totalAmount
      qrisCount += 1
    }
  })

  // Top Selling Items aggregation
  const itemMap = {}
  filtered.forEach((tx) => {
    if (Array.isArray(tx.items)) {
      tx.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          }
        }
        itemMap[item.name].quantity += item.quantity
        itemMap[item.name].revenue += item.price * item.quantity
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

  // Chart data: hourly time-slots for 'today', daily for 'week' and 'month'
  let chartData = []

  if (period === 'today') {
    const timeSlots = [
      { label: '06:00 - 09:00', shortLabel: '06-09', start: 6, end: 9 },
      { label: '09:00 - 12:00', shortLabel: '09-12', start: 9, end: 12 },
      { label: '12:00 - 15:00', shortLabel: '12-15', start: 12, end: 15 },
      { label: '15:00 - 18:00', shortLabel: '15-18', start: 15, end: 18 },
      { label: '18:00 - 21:00', shortLabel: '18-21', start: 18, end: 21 },
      { label: '21:00 - 24:00', shortLabel: '21-24', start: 21, end: 24 },
    ]

    chartData = timeSlots.map((slot) => {
      const slotTx = filtered.filter((tx) => {
        const hour = new Date(tx.createdAt).getHours()
        return hour >= slot.start && hour < slot.end
      })
      const revenue = slotTx.reduce((sum, tx) => sum + tx.totalAmount, 0)
      return {
        key: slot.shortLabel,
        dayName: slot.shortLabel,
        dayLabel: slot.label,
        revenue,
        orderCount: slotTx.length,
      }
    })
  } else {
    const daysCount = period === 'week' ? 7 : 14
    for (let i = daysCount - 1; i >= 0; i--) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - i)
      const dateStr = targetDate.toISOString().slice(0, 10)
      const dayName = targetDate.toLocaleDateString('id-ID', { weekday: 'short' })
      const dayLabel = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

      const dayTx = filtered.filter((tx) => tx.createdAt.slice(0, 10) === dateStr)
      const dayRevenue = dayTx.reduce((sum, tx) => sum + tx.totalAmount, 0)

      chartData.push({
        key: dateStr,
        dayName,
        dayLabel,
        revenue: dayRevenue,
        orderCount: dayTx.length,
      })
    }
  }

  return {
    period,
    totalRevenue,
    totalOrders,
    averageOrderValue,
    cashRevenue,
    qrisRevenue,
    cashCount,
    qrisCount,
    topSellingItems,
    chartData,
    dailyChartData: chartData,
    recentTransactions: [...filtered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    ),
  }
}