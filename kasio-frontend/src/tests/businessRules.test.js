import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Logika aturan bisnis toko Kasio
 */
function validateCategoryAddition(currentCategoryList, newName) {
  const trimmed = (newName || '').trim()
  if (!trimmed) {
    return { valid: false, error: 'Nama kategori tidak boleh kosong.' }
  }
  if (currentCategoryList.length >= 5) {
    return { valid: false, error: 'Maksimal 5 kategori telah tercapai.' }
  }
  const isDuplicate = currentCategoryList.some(
    (c) => (c.name || c).toLowerCase() === trimmed.toLowerCase()
  )
  if (isDuplicate) {
    return { valid: false, error: `Kategori "${trimmed}" sudah ada.` }
  }
  return { valid: true, trimmedName: trimmed }
}

function checkCategoryDeletionSafety(currentCategoryList, categoryToDelete) {
  const isLastCategory = currentCategoryList.length <= 1
  return {
    isLastCategory,
    warningRequired: isLastCategory,
    message: isLastCategory
      ? 'Peringatan: Ini adalah kategori terakhir di toko Anda.'
      : 'Konfirmasi hapus biasa.',
  }
}

function validateMenuItemInput({ name, price, category }) {
  const errors = {}

  if (!name || !name.trim()) {
    errors.name = 'Nama menu wajib diisi.'
  }

  const numPrice = Number(price)
  if (price === '' || isNaN(numPrice) || numPrice < 0) {
    errors.price = 'Harga menu harus berupa angka dan minimal Rp 0.'
  }

  if (!category || !category.trim()) {
    errors.category = 'Kategori menu wajib dipilih.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateUploadFile(file) {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

  if (!file || !ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File harus berupa gambar (PNG, JPG, atau WebP).' }
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'Ukuran file melebihi batas maksimal 5 MB.' }
  }

  return { valid: true }
}

describe('3. Store Business Rules & Data Integrity', () => {
  describe('Batas Maksimal Kategori Toko (Limit 5 Kategori)', () => {
    const categoriesUnderLimit = [
      { id: '1', name: 'Kopi' },
      { id: '2', name: 'Makanan' },
      { id: '3', name: 'Minuman Dingin' },
    ]

    const categoriesAtLimit = [
      { id: '1', name: 'Kopi' },
      { id: '2', name: 'Makanan' },
      { id: '3', name: 'Snack' },
      { id: '4', name: 'Dessert' },
      { id: '5', name: 'Merchandise' },
    ]

    it('mengizinkan penambahan kategori baru jika jumlah kategori masih < 5', () => {
      const result = validateCategoryAddition(categoriesUnderLimit, 'Cemilan')
      assert.strictEqual(result.valid, true)
      assert.strictEqual(result.trimmedName, 'Cemilan')
    })

    it('memblokir penambahan kategori baru jika sudah mencapai batas 5 kategori', () => {
      const result = validateCategoryAddition(categoriesAtLimit, 'Kategori Ke-6')
      assert.strictEqual(result.valid, false)
      assert.strictEqual(result.error, 'Maksimal 5 kategori telah tercapai.')
    })

    it('menolak nama kategori yang hanya berupa spasi kosong', () => {
      const result = validateCategoryAddition(categoriesUnderLimit, '    ')
      assert.strictEqual(result.valid, false)
      assert.strictEqual(result.error, 'Nama kategori tidak boleh kosong.')
    })

    it('menolak nama kategori yang duplikat (tidak peka huruf besar/kecil)', () => {
      const result = validateCategoryAddition(categoriesUnderLimit, 'kopi')
      assert.strictEqual(result.valid, false)
      assert.match(result.error, /sudah ada/)
    })
  })

  describe('Proteksi Penghapusan Kategori Terakhir (Sisa 1 Kategori)', () => {
    it('mendeteksi kategori terakhir saat sisa 1 kategori dan mewajibkan pop up peringatan', () => {
      const onlyOneCategory = [{ id: '1', name: 'Kopi' }]
      const result = checkCategoryDeletionSafety(onlyOneCategory, onlyOneCategory[0])

      assert.strictEqual(result.isLastCategory, true)
      assert.strictEqual(result.warningRequired, true)
    })

    it('tidak memicu peringatan kategori terakhir jika masih memiliki lebih dari 1 kategori', () => {
      const multipleCategories = [
        { id: '1', name: 'Kopi' },
        { id: '2', name: 'Makanan' },
      ]
      const result = checkCategoryDeletionSafety(multipleCategories, multipleCategories[0])

      assert.strictEqual(result.isLastCategory, false)
      assert.strictEqual(result.warningRequired, false)
    })
  })

  describe('Validasi Form Menu Produk', () => {
    it('menerima menu baru dengan data yang valid dan lengkap', () => {
      const validMenu = { name: 'Kopi Hitam Tubruk', price: 10000, category: 'Kopi' }
      const { isValid, errors } = validateMenuItemInput(validMenu)

      assert.strictEqual(isValid, true)
      assert.deepStrictEqual(errors, {})
    })

    it('menolak jika harga menu bernilai negatif', () => {
      const invalidMenu = { name: 'Kopi Gratis', price: -5000, category: 'Kopi' }
      const { isValid, errors } = validateMenuItemInput(invalidMenu)

      assert.strictEqual(isValid, false)
      assert.match(errors.price, /minimal Rp 0/)
    })

    it('menolak jika nama menu kosong', () => {
      const invalidMenu = { name: '   ', price: 15000, category: 'Kopi' }
      const { isValid, errors } = validateMenuItemInput(invalidMenu)

      assert.strictEqual(isValid, false)
      assert.strictEqual(errors.name, 'Nama menu wajib diisi.')
    })
  })

  describe('Validasi File Unggahan (Keamanan Upload Foto & QRIS)', () => {
    it('menerima file gambar yang sah (PNG, JPG, WebP) di bawah 5 MB', () => {
      const validFile = { type: 'image/png', size: 1024 * 500 } // 500 KB
      const result = validateUploadFile(validFile)
      assert.strictEqual(result.valid, true)
    })

    it('menolak file non-gambar (misal file PDF atau executable)', () => {
      const pdfFile = { type: 'application/pdf', size: 1024 * 100 }
      const result = validateUploadFile(pdfFile)
      assert.strictEqual(result.valid, false)
      assert.match(result.error, /harus berupa gambar/)
    })

    it('menolak file gambar yang melebihi batas ukuran (contoh 8 MB)', () => {
      const heavyFile = { type: 'image/jpeg', size: 8 * 1024 * 1024 }
      const result = validateUploadFile(heavyFile)
      assert.strictEqual(result.valid, false)
      assert.match(result.error, /melebihi batas maksimal/)
    })
  })
})

