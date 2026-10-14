# Design System

## Design direction
- Brand attributes:
  - **Refined & Apple-like:** Clean content-first layout, frosted glass translucency (`backdrop-blur`), subtle borders, soft ambient elevation, and squircle rounded corners (`rounded-2xl` / `rounded-3xl`).
  - **Tactile & Efficient:** Fast cashier ergonomics, large tap targets (minimum 44x44px), instant visual feedback on touch/click (`active:scale-[0.98]`), and distraction-free POS workflows.
  - **Clear & Transparent:** High-contrast typography for pricing and receipt totals, prominent static QRIS presentation for customer scanning, and readable analytics dashboards.
- Supported devices:
  - **Mobile Web (360px - 767px):** Single-thumb cashier operation, top navigation with blur, sticky bottom cart pill, and sliding modal bottom sheets for checkout and QRIS.
  - **Tablet (768px - 1023px):** Two-column split-screen layout (Menu catalog on the left, active POS order docket on the right). Ideal for counter stands/iPad.
  - **Desktop / Laptop (1024px+):** Sidebar navigation layout, responsive multi-column grid for menu management, rich analytics charts, and dedicated modal windows.
- References:
  - Apple Human Interface Guidelines (HIG) for iOS & macOS.
  - SF Pro Typography and Apple System Color Palette.
  - Apple Wallet & Apple Store payment presentation standards.

---

## UI tokens

Tokens use Tailwind CSS utilities and CSS variables configured in `tailwind.config.js`.

| Token | Value / Tailwind Class | Usage |
| --- | --- | --- |
| `color.background` | Light: `#F5F5F7` (`bg-[#F5F5F7]`), Dark: `#000000` / `#0F0F12` | Main page canvas background |
| `color.surface` | Light: `#FFFFFF` (`bg-white`), Dark: `#1C1C1E` (`bg-[#1C1C1E]`) | Cards, tables, modals, input containers |
| `color.surface.translucent` | Light: `rgba(255, 255, 255, 0.82)` (`bg-white/80 backdrop-blur-xl`), Dark: `rgba(28, 28, 30, 0.82)` | Navigation bars, floating cart bar, modal headers |
| `color.primary` | `#0071E3` (`bg-[#0071E3]`, hover `bg-[#0077ED]`) | Primary action buttons, active tab indicators, accents |
| `color.text.primary` | `#1D1D1F` (`text-[#1D1D1F]`), Dark: `#F5F5F7` | Headings, item names, receipt totals, active labels |
| `color.text.secondary` | `#86868B` (`text-[#86868B]`) | Subtitles, menu descriptions, inactive tabs, timestamps |
| `color.border` | `rgba(0, 0, 0, 0.08)` (`border-black/[0.08]`), Dark: `rgba(255, 255, 255, 0.12)` | Subtle card borders, dividers, list separators |
| `color.success` | `#34C759` (`text-[#34C759]`, `bg-[#34C759]/10`) | Completed order status, revenue growth indicator, cash received |
| `color.warning` | `#FF9500` (`text-[#FF9500]`, `bg-[#FF9500]/10`) | Pending payment verification, low availability warnings |
| `color.error` | `#FF3B30` (`text-[#FF3B30]`, `bg-[#FF3B30]/10`) | Cancelled transactions, out of stock, deletion, input errors |
| `font.family` | `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | System-native Apple typography stack |
| `font.title.large` | `text-2xl md:text-3xl font-semibold tracking-tight` (34px/41px scale) | Page titles, total sales revenue in analytics |
| `font.title.medium` | `text-xl md:text-2xl font-semibold tracking-tight` | Section headers, modal titles, order total in POS |
| `font.body` | `text-[15px] leading-relaxed font-normal` | Body descriptions, table items, form inputs |
| `font.caption` | `text-[12px] md:text-[13px] font-medium text-[#86868B]` | Badges, timestamps, helper labels |
| `radius.control` | `rounded-xl` (12px) | Form inputs, select dropdowns, search bars |
| `radius.card` | `rounded-2xl` (16px) | Menu item cards, stat cards, cart docket |
| `radius.modal` | `rounded-3xl` (24px) | Dialog modals, bottom sheets, QRIS display card |
| `radius.pill` | `rounded-full` (9999px) | Segmented filters, category chips, status tags |
| `shadow.card` | `shadow-[0_2px_8px_rgba(0,0,0,0.04)]` | Subtle ambient lift for interactive cards |
| `shadow.elevated` | `shadow-[0_12px_32px_rgba(0,0,0,0.08)]` | Modals, floating cart drawer, QRIS popover |

---

## Layout rules

### Breakpoints & Container
- `sm`: 640px (Large phones)
- `md`: 768px (Tablets / iPad portrait & landscape)
- `lg`: 1024px (Small laptops & desktop)
- `xl`: 1280px (Standard desktop screens)
- Max width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### Responsive Layout Architecture
1. **Mobile (<768px):**
   - **Header:** Slim translucent top bar with store name and quick avatar/settings button (`sticky top-0 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] z-30`).
   - **Content:** Single-column scrollable menu catalog with horizontal swipeable category pills.
   - **Bottom Bar:** Fixed floating cart pill showing total items and price (`sticky bottom-4 mx-4 shadow-xl`). Tapping opens a bottom sheet with the full order summary and checkout button.
   - **Navigation:** Persistent bottom tab bar with 4 tabs: *Kasir (POS)*, *Menu*, *Riwayat*, *Analytics*.
2. **Tablet (768px - 1023px):**
   - Split-screen POS: Left 60% contains searchable menu grid (2-3 columns); Right 40% contains a sticky order cart with instant keypad or quantity adjusters.
3. **Desktop (1024px+):**
   - **Sidebar Navigation:** Fixed left sidebar (width: 260px) with Apple macOS-style icon-and-label items, store profile, and status indicator.
   - **Main Area:** Expansive grid view for menu management and interactive analytics charts.
   - **POS Mode:** Full-screen layout with flexible 3 to 4 column menu grid and right-side dedicated order checkout panel.

---

## Components

### 1. Primary Button (Apple HIG Tinted Action)
- **Anatomy:** Full-width or inline rounded button (`rounded-full` or `rounded-xl`), centered label with optional leading icon.
- **Visuals:**
  - Default: `bg-[#0071E3] text-white font-medium px-5 py-2.5 transition duration-150`
  - Hover: `hover:bg-[#0077ED]`
  - Active: `active:scale-[0.98] bg-[#0062C4]`
  - Disabled: `disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`
  - Loading: Replaces text with a centered monochrome spinner (Apple-style spinning ring); retains original button dimensions.
  - Visible focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2`

### 2. Secondary & Ghost Button
- **Secondary (Pill / Tinted):** `bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F] font-medium rounded-full px-4 py-2`
- **Destructive:** `bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] font-medium rounded-xl px-4 py-2`

### 3. Form Field & Input
- **Anatomy:** Stacked layout with clear label above, input box with subtle border, and optional helper/error text below.
- **Visuals:**
  - Container: `bg-white border border-black/[0.12] rounded-xl px-3.5 py-2.5 text-[#1D1D1F] placeholder-[#86868B] text-[15px]`
  - Hover: `hover:border-black/[0.24]`
  - Focus: `focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all`
  - Error: `border-[#FF3B30] focus:border-[#FF3B30] focus:ring-[#FF3B30]/15`
  - Error label: `text-[12px] font-medium text-[#FF3B30] mt-1.5 flex items-center gap-1`

### 4. Menu Item Card (Catalog & POS)
- **Anatomy:** Clean squircle card (`rounded-2xl bg-white border border-black/[0.06] overflow-hidden p-3.5 flex flex-col justify-between hover:shadow-md transition-all active:scale-[0.99]`).
- **Content:**
  - Square product thumbnail (`aspect-square rounded-xl object-cover bg-neutral-100`) or clean placeholder icon.
  - Item name (`font-semibold text-[#1D1D1F] text-[15px] truncate`).
  - Item description (`text-[13px] text-[#86868B] line-clamp-2 mt-0.5`).
  - Bottom row: Formatted price (`text-[15px] font-semibold text-[#1D1D1F]`) and quick "+" add-to-cart button.
  - Out of stock state: Grayscale filter on image, subtle opacity (`opacity-60`), badge "Habis", button disabled.

### 5. Static QRIS Payment Modal / Sheet
- **Anatomy:** Apple Pay / Wallet style clean card modal:
  - Header with title "Pembayaran QRIS" and close button.
  - Total payment amount prominently displayed (`text-3xl font-semibold tracking-tight text-[#1D1D1F]`).
  - High-contrast white container (`p-4 bg-white rounded-2xl border border-black/[0.08] shadow-inner flex flex-col items-center`) displaying the merchant's uploaded QRIS image.
  - Merchant store name and instruction text: *"Minta pelanggan memindai QRIS di atas"*.
  - Dual action footer:
    - Primary Button: "Konfirmasi Pembayaran Diterima" (`bg-[#34C759] text-white hover:bg-[#30B753]`).
    - Secondary Button: "Ganti ke Tunai / Batal".

### 6. Segmented Control (Category & Payment Filter)
- **Anatomy:** Apple-style capsule container (`bg-black/[0.06] p-1 rounded-full flex gap-1`).
- **Active item:** `bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.1)] rounded-full px-4 py-1.5 font-medium text-[13px] transition-all`.
- **Inactive item:** `text-[#86868B] hover:text-[#1D1D1F] px-4 py-1.5 font-medium text-[13px] transition-all`.

---

## Accessibility

- **Contrast:** All text colors against their respective backgrounds meet or exceed WCAG 2.1 AA (minimum 4.5:1 for body copy, 3:1 for large display titles and primary buttons).
- **Keyboard Navigation & Focus:** All interactive elements (`<button>`, `<a>`, `<input>`, `<select>`) have visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#0071E3]`).
- **Touch Target Size:** All touch targets on mobile & tablet are at least 44x44px per Apple Human Interface Guidelines.
- **Motion Reduction:** All transitions and scale effects adhere to `motion-reduce:transition-none motion-reduce:transform-none`.
- **Screen Readers:** ARIA labels on icon-only buttons (e.g., `aria-label="Tambah item"`, `aria-label="Tutup modal"`), modal dialogs with `role="dialog"` and `aria-modal="true"`.

---

## Screen states

| Screen | Empty State | Loading State | Error State | Populated View |
| --- | --- | --- | --- | --- |
| **Kasir (POS)** | Illustration with message *"Menu belum tersedia. Tambahkan menu di tab Menu."* | Shimmering skeleton cards for menu grid and cart docket. | Toast banner *"Gagal memuat katalog menu. Coba lagi."* with retry button. | Interactive menu grid, live category filters, search bar, and active cart panel. |
| **Kelola Menu** | Graphic with CTA button *"+ Tambah Menu Pertama"*. | Table/grid skeleton with pulsating placeholder rows. | Inline error banner *"Gagal menyimpan perubahan menu."* | Full list of menu items with photo, name, description, price, and toggle availability. |
| **Riwayat Transaksi** | Icon calendar with label *"Belum ada transaksi hari ini."* | List of 5 pulsating row skeletons. | Error banner with reload action. | Reverse-chronological list of orders with receipt number, time, payment tag (Cash/QRIS), and total. |
| **Analytics Dashboard** | Charts show zero baseline with helpful text *"Data penjualan akan muncul setelah ada pesanan selesai."* | Chart skeleton blocks and metric card shimmer. | Error box *"Gagal memuat rekap penjualan."* | Metric cards (Total Omzet, Total Transaksi, Rata-rata Order), sales trend bar chart, and top 5 best sellers. |
| **QRIS Display (Modal)** | Warning state if merchant hasn't uploaded QRIS: *"QRIS statis belum diunggah. Buka Pengaturan untuk upload QRIS."* | Spinner over image container while image loads. | Broken image placeholder with option to switch to Cash payment. | Crisp high-contrast QRIS image, order ID, and big total bill amount. |

---

## Approval
- Design owner: Kasio Product & UI Team
- Source of truth: `docs/DESIGN_SYSTEM.md` & Tailwind CSS utility system (`tailwind.config.js`).
