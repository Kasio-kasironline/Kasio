import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatIDR, getInitials } from '../utils/formatters.js'

describe('1. Formatting Utilities (formatters.js)', () => {
  describe('formatIDR()', () => {
    it('mengubah angka nominal ke format Rupiah dengan pemisah ribuan', () => {
      const result = formatIDR(25000)
      assert.match(result, /25\.000/)
      assert.match(result, /Rp/)
    })

    it('memformat angka bernilai 0 dengan benar', () => {
      const result = formatIDR(0)
      assert.match(result, /0/)
      assert.match(result, /Rp/)
    })

    it('memformat nominal jutaan rupiah dengan benar', () => {
      const result = formatIDR(1500000)
      assert.match(result, /1\.500\.000/)
    })

    it('mengembalikan "Rp 0" secara aman jika nilai input null, undefined, atau NaN', () => {
      assert.strictEqual(formatIDR(null), 'Rp 0')
      assert.strictEqual(formatIDR(undefined), 'Rp 0')
      assert.strictEqual(formatIDR(NaN), 'Rp 0')
      assert.strictEqual(formatIDR('bukan angka'), 'Rp 0')
    })
  })

  describe('getInitials()', () => {
    it('mengambil 2 huruf pertama jika nama produk hanya 1 kata', () => {
      assert.strictEqual(getInitials('Americano'), 'AM')
      assert.strictEqual(getInitials('Cappuccino'), 'CA')
      assert.strictEqual(getInitials('Tea'), 'TE')
    })

    it('mengambil huruf pertama tiap kata jika nama produk 2 kata', () => {
      assert.strictEqual(getInitials('Kopi Susu'), 'KS')
      assert.strictEqual(getInitials('Roti Bakar'), 'RB')
    })

    it('mengambil maksimal 3 inisial huruf pertama jika nama produk 3 kata atau lebih', () => {
      assert.strictEqual(getInitials('Kopi Susu Gula'), 'KSG')
      assert.strictEqual(getInitials('Kopi Susu Gula Aren Panas'), 'KSG')
    })

    it('menangani spasi ganda dan spasi di awal/akhir dengan rapi', () => {
      assert.strictEqual(getInitials('   Matcha    Latte   '), 'ML')
    })

    it('mengembalikan icon default 🍽️ jika nama produk kosong atau bukan string', () => {
      assert.strictEqual(getInitials(''), '🍽️')
      assert.strictEqual(getInitials('   '), '🍽️')
      assert.strictEqual(getInitials(null), '🍽️')
      assert.strictEqual(getInitials(undefined), '🍽️')
    })
  })
})

