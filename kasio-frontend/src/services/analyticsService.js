import { supabase } from '../lib/supabase'

/**
 * Nilai default analitik saat data masih kosong atau belum dimuat.
 */
export function getEmptyAnalytics(period = 'today') {
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
 * Mengambil transaksi nyata dari Supabase dan mengkalkulasi seluruh metrik analitik.
 * @param {string} businessId - ID toko/bisnis merchant
 * @param {'today' | 'week' | 'month'} period - Rentang waktu analitik
 */
export async function fetchAnalyticsData(businessId, period = 'today') {
  if (!businessId) {
    return getEmptyAnalytics(period)
  }

  const now = new Date()
  const cutoff = new Date()

  if (period === 'today') {
    cutoff.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    cutoff.setDate(now.getDate() - 7)
    cutoff.setHours(0, 0, 0, 0)
  } else {
    // 30 hari terakhir
    cutoff.setDate(now.getDate() - 30)
    cutoff.setHours(0, 0, 0, 0)
  }

  // Query transaksi orders beserta relasi snapshot order_items
  const { data: rawOrders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount,
      payment_method,
      payment_status,
      created_at,
      order_items (
        id,
        item_name,
        item_price,
        quantity,
        subtotal
      )
    `)
    .eq('business_id', businessId)
    .eq('payment_status', 'completed')
    .gte('created_at', cutoff.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching analytics from Supabase:', error)
    throw error
  }

  const orders = rawOrders || []

  // 1. Kalkulasi metrik KPI utama
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  let cashRevenue = 0
  let qrisRevenue = 0
  let cashCount = 0
  let qrisCount = 0

  orders.forEach((o) => {
    const amount = Number(o.total_amount || 0)
    if (o.payment_method === 'cash') {
      cashRevenue += amount
      cashCount += 1
    } else {
      qrisRevenue += amount
      qrisCount += 1
    }
  })

  // 2. Agregasi Menu Terlaris (Top Selling Items)
  const itemMap = {}
  orders.forEach((o) => {
    if (Array.isArray(o.order_items)) {
      o.order_items.forEach((item) => {
        const name = item.item_name
        if (!itemMap[name]) {
          itemMap[name] = {
            name,
            quantity: 0,
            revenue: 0,
          }
        }
        itemMap[name].quantity += Number(item.quantity || 0)
        itemMap[name].revenue += Number(item.subtotal || item.item_price * item.quantity || 0)
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

  // 3. Agregasi Grafik Batang Tren Penjualan
  let chartData = []

  if (period === 'today') {
    // Pengelompokan 6 slot waktu dalam 24 jam hari ini
    const timeSlots = [
      { label: '06:00 - 09:00', shortLabel: '06-09', start: 6, end: 9 },
      { label: '09:00 - 12:00', shortLabel: '09-12', start: 9, end: 12 },
      { label: '12:00 - 15:00', shortLabel: '12-15', start: 12, end: 15 },
      { label: '15:00 - 18:00', shortLabel: '15-18', start: 15, end: 18 },
      { label: '18:00 - 21:00', shortLabel: '18-21', start: 18, end: 21 },
      { label: '21:00 - 24:00', shortLabel: '21-24', start: 21, end: 24 },
    ]

    chartData = timeSlots.map((slot) => {
      const slotOrders = orders.filter((o) => {
        const hour = new Date(o.created_at).getHours()
        return hour >= slot.start && hour < slot.end
      })
      const revenue = slotOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
      return {
        key: slot.shortLabel,
        dayName: slot.shortLabel,
        dayLabel: slot.label,
        revenue,
        orderCount: slotOrders.length,
      }
    })
  } else {
    // Pengelompokan harian untuk 7 hari atau 14 hari
    const daysCount = period === 'week' ? 7 : 14
    for (let i = daysCount - 1; i >= 0; i--) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - i)
      const dateStr = targetDate.toISOString().slice(0, 10)
      const dayName = targetDate.toLocaleDateString('id-ID', { weekday: 'short' })
      const dayLabel = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

      const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === dateStr)
      const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

      chartData.push({
        key: dateStr,
        dayName,
        dayLabel,
        revenue: dayRevenue,
        orderCount: dayOrders.length,
      })
    }
  }

  // 4. Format daftar transaksi untuk tabel riwayat & preview struk
  const recentTransactions = orders.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    paymentMethod: o.payment_method === 'cash' ? 'Tunai' : 'QRIS Statis',
    status: 'Selesai',
    totalAmount: Number(o.total_amount || 0),
    items: (o.order_items || []).map((item) => ({
      name: item.item_name,
      price: Number(item.item_price || 0),
      quantity: Number(item.quantity || 1),
    })),
  }))

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
    recentTransactions,
  }
}