/**
 * Format numeric value to Indonesian Rupiah (IDR) currency format.
 * Example: 25000 -> "Rp 25.000"
 */
export function formatIDR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rp 0'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}