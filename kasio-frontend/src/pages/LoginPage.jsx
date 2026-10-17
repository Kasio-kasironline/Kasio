import LoginForm from '../features/auth/LoginForm'

/**
 * LoginPage view designed according to Apple HIG.
 * Features an elevated frosted glass container, delicate borders,
 * brand branding for UMKM, and responsive layout for mobile and desktop.
 */
export default function LoginPage({onLoginSuccess}) {
  return (
    <main className="min-h-screen w-full bg-[#F5F5F7] flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background decoration (Apple style subtle glow) */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#0071E3]/8 via-[#34C759]/5 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Top Navbar / Brand header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-4 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0071E3] flex items-center justify-center text-white shadow-sm shadow-[#0071E3]/25">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">
              Kasio
            </span>
            <span className="text-[11px] text-[#86868B] font-medium leading-none">
              POS Kasir UMKM
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-black/[0.06] backdrop-blur-md text-[12px] text-[#1D1D1F] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
          <span>v0.1.0 MVP</span>
        </div>
      </header>

      {/* Main Login Card */}
      <section className="w-full max-w-[420px] my-auto z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 border border-black/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-all">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-[26px] font-semibold text-[#1D1D1F] tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-[14px] text-[#86868B] mt-1.5 leading-relaxed">
              Masuk untuk mulai mencatat transaksi dan memantau omzet tokomu.
            </p>
          </div>

          <LoginForm onLoginSuccess={onLoginSuccess}/>

          <div className="mt-6 pt-5 border-t border-black/[0.06] text-center">
            <p className="text-[13px] text-[#86868B]">
              Belum punya akun usaha?{' '}
              <a
                href="#register"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Halaman pendaftaran usaha baru akan aktif pada tahap berikutnya.')
                }}
                className="text-[#0071E3] font-medium hover:underline"
              >
                Daftar sekarang
              </a>
            </p>
          </div>
        </div>

        {/* Security badge note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#86868B]">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
          <span>Data usaha aman dan terisolasi dengan Supabase RLS</span>
        </div>
      </section>

      {/* Page Footer */}
      <footer className="w-full max-w-5xl py-4 text-center z-10 text-[12px] text-[#86868B]">
        <p>© 2026 Kasio. Aplikasi Kasir & Pembayaran QRIS untuk UMKM Indonesia.</p>
      </footer>
    </main>
  )
}