/**
 * imageCompressor.js
 * Utility untuk mengubah ukuran (resize) dan mengompresi gambar di sisi browser (klien)
 * sebelum diunggah ke storage atau database.
 *
 * Menggunakan HTML5 Canvas native (tanpa dependensi eksternal).
 */

/**
 * Mengompresi dan mengubah resolusi file gambar di browser.
 *
 * @param {File|Blob} file - File gambar mentah dari input type="file"
 * @param {Object} [options] - Opsi kompresi
 * @param {number} [options.maxWidth=800] - Batas lebar maksimal gambar (px)
 * @param {number} [options.maxHeight=800] - Batas tinggi maksimal gambar (px)
 * @param {number} [options.quality=0.8] - Kualitas kompresi (0.1 - 1.0)
 * @param {string} [options.mimeType='image/jpeg'] - Format output gambar
 * @returns {Promise<{ file: File, dataUrl: string, originalSize: number, compressedSize: number }>}
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    mimeType = 'image/jpeg',
  } = options

  if (!file || !file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan merupakan format gambar yang valid.')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        // Pertahankan rasio aspek dan sesuaikan jika melebihi batas maksimal
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // Fallback aman jika canvas context tidak tersedia
          return resolve({
            file,
            dataUrl: event.target.result,
            originalSize: file.size,
            compressedSize: file.size,
          })
        }

        // Jika format JPEG, beri latar belakang putih agar PNG transparan tidak menjadi hitam
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Dapatkan data URL terkompresi
        const dataUrl = canvas.toDataURL(mimeType, quality)

        // Ubah canvas menjadi Blob dan File object baru
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                dataUrl,
                originalSize: file.size,
                compressedSize: file.size,
              })
            }

            const extension = mimeType === 'image/webp' ? 'webp' : 'jpg'
            const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '')
            const compressedFile = new File([blob], `${baseName}.${extension}`, {
              type: mimeType,
              lastModified: Date.now(),
            })

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: compressedFile.size,
            })
          },
          mimeType,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Gagal memuat gambar untuk proses kompresi.'))
      }

      img.src = event.target.result
    }

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar.'))
    }

    reader.readAsDataURL(file)
  })
}