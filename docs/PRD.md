# Product Requirements Document

## Project context
- Product: Kasio (Web-Based POS & Sales Management for Indonesian UMKM)
- Owner: Kasio Product & Engineering Team
- Status: Approved
- Problem: Micro, Small, and Medium Enterprises (UMKM) in Indonesia (such as food stalls, coffee shops, and small eateries) struggle with manual paper bookkeeping, inaccurate end-of-day sales reconciliations, and slow checkout. Furthermore, while most have a static QRIS barcode from banks or e-wallets, they lack an integrated, low-cost POS solution to display their QRIS smoothly during checkout and monitor real-time sales trends without paying high software subscriptions or purchasing proprietary hardware.
- Target users: UMKM business owners, food stall operators, and cashiers managing counter sales on mobile phones, tablets, or laptops.
- Desired outcome: A responsive, Apple-inspired web application enabling merchants to set up their store, upload static QRIS, manage menu items, execute fast counter sales (Cash & Static QRIS), provide digital receipts, and monitor daily revenue analytics with zero infrastructure costs.

---

## MVP scope

### Must ship (Core Features)
1. **Daftar, Login, dan Setup Usaha:**
   - Supabase Auth registration and login using email & password.
   - Initial onboarding modal to configure business name, phone, address, and currency format (IDR).
2. **Pengaturan QRIS Toko:**
   - Dedicated settings panel to upload, preview, and replace the merchant's static QRIS image stored securely in Supabase Storage.
3. **CRUD Produk dan Kategori Sederhana:**
   - Management of menu items: Name, description, price (Rp), optional category, photo, and availability toggle (`is_available`).
   - Category management (e.g., Makanan, Minuman, Cemilan).
4. **POS dan Keranjang:**
   - Responsive counter interface with search and category filter.
   - Real-time cart management with quantity increment/decrement, item removal, and subtotal calculation.
5. **Pembayaran Tunai dan QRIS Manual:**
   - Cash payment with automatic change calculation.
   - Static QRIS payment flow: Displays prominent Apple Wallet-style modal showing merchant's static QRIS image and total bill; cashier confirms receipt of payment.
6. **Struk serta Riwayat Transaksi:**
   - Instant digital receipt modal with print and share capabilities.
   - Chronological transaction history list with filtering by date, status, and payment method.
7. **Dashboard dan Analitik Dasar:**
   - Real-time sales metrics: Total Omzet (Revenue), Total Transaksi, and Rata-rata Nilai Pesanan.
   - Interactive charts: Daily sales trend, Top 5 best-selling menu items, and payment method split (Tunai vs QRIS).
8. **Proteksi Data Tiap Usaha (Multi-Tenant RLS):**
   - Supabase Row Level Security (RLS) guaranteeing strict data isolation between merchants.

### Explicitly excluded
- Automated payment gateway callbacks (Midtrans, Xendit, etc.) or dynamic QRIS generation (QRIS MPM Dinamis).
- Raw material inventory deduction, recipe tracking, and supplier management.
- Multi-outlet/branch management.
- Advanced accounting (P&L statements, tax filings, balance sheets).
- Customer-facing digital ordering / dine-in QR table ordering.
- Offline-first background synchronization (requires internet connection for Supabase operations).

### Constraints
- Tech Stack: React + Vite + JavaScript + Tailwind CSS (Frontend), Supabase (Auth, PostgreSQL with RLS, Storage).
- Deployment: Vercel Hobby static hosting (Zero-cost portfolio architecture).
- Currency: Indonesian Rupiah (IDR / Rp) with standard Indonesian number formatting (`Rp 25.000`).
- Responsiveness: Native-like experience across Mobile (360px+), Tablet/iPad (768px+), and Desktop (1024px+).

---

## User journeys

### Journey 1: Registrasi & Setup Usaha (Onboarding)
- **Actor:** Pemilik UMKM (Merchant Owner)
- **Trigger:** Mengakses aplikasi Kasio untuk pertama kali.
- **Steps:**
  1. Pengguna membuka halaman pendaftaran dan memasukkan email serta password.
  2. Setelah login pertama kali, muncul modal onboarding untuk mengisi Nama Usaha, Alamat, dan Nomor Telepon.
  3. Pengguna diarahkan ke menu Pengaturan untuk mengunggah gambar QRIS statis milik usahanya.
- **Result:** Profil usaha dan QRIS siap digunakan untuk melayani transaksi kasir.
- **Recovery:** Jika form tidak lengkap atau format gambar QRIS salah (>2MB atau bukan JPG/PNG/WebP), sistem menampilkan pesan kesalahan inline yang jelas.

### Journey 2: Pengelolaan Menu & Kategori
- **Actor:** Pemilik UMKM / Kasir
- **Trigger:** Menambah atau memperbarui daftar menu jualan.
- **Steps:**
  1. Pengguna membuka tab "Menu".
  2. Membuat kategori baru (misal: "Kopi") jika belum ada.
  3. Menekan tombol "+ Tambah Menu", mengisi Nama Menu, Deskripsi, Harga (Rp), memilih Kategori, mengunggah foto produk, dan menekan "Simpan".
  4. Pengguna dapat menonaktifkan ketersediaan menu (toggle "Tersedia / Habis") sewaktu-waktu.
- **Result:** Menu langsung muncul di antarmuka Kasir (POS) secara real-time.
- **Recovery:** Validasi mencegah harga bernilai negatif atau nama produk kosong.

### Journey 3: Transaksi Kasir (POS) & Pembayaran
- **Actor:** Kasir / Pemilik UMKM
- **Trigger:** Pelanggan memesan makanan/minuman di kasir.
- **Steps:**
  1. Kasir membuka tab "Kasir", memfilter kategori atau mencari nama menu.
  2. Kasir mengetuk item untuk memasukkannya ke keranjang belanja dan mengatur jumlah porsi.
  3. Kasir menekan tombol "Bayar" untuk membuka lembar checkout.
  4. Kasir memilih metode pembayaran:
     - **Tunai:** Kasir memasukkan nominal uang yang diterima pelanggan; sistem otomatis menghitung uang kembalian.
     - **QRIS Statis:** Modal Apple-style muncul menampilkan gambar QRIS toko dan total tagihan berukuran besar. Pelanggan memindai QRIS tersebut dengan e-wallet/mobile banking. Setelah pelanggan menunjukkan bukti transfer, kasir menekan tombol "Konfirmasi Pembayaran Diterima".
  5. Sistem menyimpan transaksi secara atomik di database Supabase dan menampilkan struk digital pesanan.
- **Result:** Transaksi berhasil dicatat, stok/status terekam, keranjang direset, dan struk dapat dibagikan/dicetak.
- **Recovery:** Jika koneksi terputus saat checkout, keranjang tetap tersimpan di browser dan tombol coba lagi dapat ditekan dengan aman tanpa duplikasi.

### Journey 4: Evaluasi Penjualan (Dashboard & Analitik)
- **Actor:** Pemilik UMKM
- **Trigger:** Evaluasi harian atau tutup buku toko.
- **Steps:**
  1. Pengguna membuka tab "Analytics".
  2. Memilih rentang waktu (Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir).
  3. Melihat ringkasan omzet, total transaksi yang berhasil, menu paling laris (*top 5*), dan perbandingan metode pembayaran Tunai vs QRIS.
- **Result:** Pemilik usaha memperoleh pemahaman instan mengenai performa bisnis tanpa perhitungan manual.

---

## Feature specifications

| ID | User need | Behavior | Acceptance criteria | Priority |
| --- | --- | --- | --- | --- |
| **F-01** | Sebagai pemilik usaha, saya ingin mendaftar dan login akun | Autentikasi email dan password melalui Supabase Auth dengan penanganan sesi otomatis | Given email dan password valid, when form dikirim, then pengguna berhasil masuk dan diarahkan ke dashboard/onboarding. Sesi tersimpan aman. | Must |
| **F-02** | Sebagai pemilik usaha, saya ingin melengkapi profil toko dan mengunggah QRIS statis | Form profil toko dan uploader gambar QRIS dengan pratinjau langsung | Given gambar QRIS berformat JPG/PNG/WebP <= 2MB, when diunggah, then gambar tersimpan di Supabase Storage dan URL disimpan di tabel `businesses`. Pratinjau QRIS langsung muncul. | Must |
| **F-03** | Sebagai kasir/owner, saya ingin mengelola kategori dan menu produk (CRUD) | Daftar menu dengan pencarian, filter, modal tambah/edit, toggle ketersediaan, dan hapus | Given input menu valid (Nama >= 2 char, Harga >= 0), when disimpan, then data tersimpan di `menu_items` dan langsung dapat dipilih di POS. | Must |
| **F-04** | Sebagai kasir, saya ingin memilih produk dan mengelola keranjang dengan cepat | Antarmuka POS responsif dengan kartu menu, tombol tambah cepat, pengatur kuantitas (+/-), dan subtotal live | Given produk tersedia, when kartu diketuk, then item masuk ke keranjang. Subtotal dihitung akurat dan tombol Checkout aktif. | Must |
| **F-05** | Sebagai kasir, saya ingin memproses pembayaran Tunai dan QRIS Statis | Pilihan pembayaran Tunai (kalkulator kembalian otomatis) dan QRIS Statis (modal popup menampilkan QRIS toko & total tagihan) | Given total belanja, when kasir konfirmasi pembayaran (Tunai/QRIS), then fungsi database RPC memvalidasi harga dan menyimpan order beserta order items secara atomik. | Must |
| **F-06** | Sebagai kasir dan pelanggan, kami ingin melihat struk digital transaksi | Modal struk pasca pembayaran yang memuat no. struk, tanggal, rincian item, metode bayar, dan total | Given transaksi sukses, when modal struk terbuka, then kasir dapat melihat rincian snapshot harga dan opsi untuk mencetak (*print*) atau menutup. | Must |
| **F-07** | Sebagai kasir/owner, saya ingin melihat riwayat seluruh transaksi | Daftar transaksi terurut dari yang terbaru, dilengkapi filter status (Selesai/Batal) dan tanggal | Given daftar transaksi, when filter diterapkan, then tabel menampilkan data transaksi yang sesuai milik toko tersebut. | Must |
| **F-08** | Sebagai pemilik usaha, saya ingin melihat grafik dan metrik analitik penjualan | Dashboard analitik menampilkan kartu omzet, grafik tren penjualan harian, produk terlaris, dan rasio Tunai vs QRIS | Given rentang tanggal terpilih, when tab analitik dibuka, then data agregasi kueri PostgreSQL dihitung akurat dan ditampilkan dalam grafik yang mudah dibaca. | Must |
| **F-09** | Sebagai pemilik usaha, data usaha saya harus terisolasi dan aman dari pengguna lain | Seluruh kueri dan operasi database dilindungi Row Level Security (RLS) berbasis `owner_id = auth.uid()` | Given dua akun usaha berbeda A dan B, when akun A memuat menu/transaksi, then akun A tidak dapat melihat atau memodifikasi data milik akun B. | Must |

---

## Success measures

- **Transaction Reliability:** 100% transaksi pesanan dan item snapshot tersimpan secara atomik tanpa inkonsistensi harga atau duplikasi.
- **Checkout Ergonomics:** Kasir dapat menyelesaikan transaksi 1-2 item dalam waktu kurang dari 15 detik (di bawah 4 ketukan layar).
- **Zero Infrastructure Cost:** Seluruh aplikasi beroperasi dalam kuota gratis Vercel Hobby & Supabase Free Tier untuk portofolio dan demo UMKM.
- **Accessibility & Responsiveness:** UI ramah sentuhan (target tap >= 44x44px) dan adaptif di layar smartphone (360px) hingga monitor desktop.
- **Multi-Tenant Security:** Pengujian isolasi RLS mencapai tingkat keberhasilan 100% tanpa adanya kebocoran data antar pemilik usaha.

---

## Open decisions

- **Pencetakan Struk Fisik:** Untuk rilis MVP, struk menggunakan tampilan digital dan fungsi `window.print()` standar browser (kompatibel dengan printer Bluetooth/POS termal melalui dialog cetak sistem operasi). Integrasi Web Bluetooth ESC/POS langsung ditunda untuk iterasi berikutnya.
- **Akun Kasir Terpisah:** Untuk rilis awal MVP, satu akun login bertindak sebagai pemilik sekaligus kasir. Penambahan role kasir sekunder (*multi-user per business*) dialokasikan untuk fase pasca-MVP.

---

## Definition of ready

- Ruang lingkup fitur MVP, alur pengguna (*user journeys*), dan kriteria penerimaan (*acceptance criteria*) telah didefinisikan secara lengkap dan disetujui.
- Arsitektur teknologi dan skema database ([ARCHITECTURE_KASIO.md](file:///c:/Users/LENOVO/Documents/GitHub/Kasio/docs/ARCHITECTURE_KASIO.md) dan [DATABASE.md](file:///c:/Users/LENOVO/Documents/GitHub/Kasio/docs/DATABASE.md)) telah selaras dengan spesifikasi kebutuhan produk ini.
