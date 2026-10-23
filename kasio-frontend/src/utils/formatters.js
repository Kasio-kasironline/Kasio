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

/**
 * Generate product initials from product name.
 * Example: "Kopi Gula Aren" -> "KGA", "Kopi Susu" -> "KS", "Americano" -> "AM"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '🍽️'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '🍽️'
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }
  return words
    .slice(0, 3)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
}