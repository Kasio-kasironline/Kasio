import { useState } from 'react'
import { CATEGORIES, DUMMY_MENU_ITEMS } from './data/dummyMenu'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PosPage from './pages/PosPage'
import MenuManagementPage from './pages/MenuManagementPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'

function AppContent() {
  const { user, business, isLoading, logout } = useAuth()
  // Pilihan tampilan: 'pos' | 'menu' | 'login' | 'register' | 'analytics'
  const [currentView, setCurrentView] = useState('pos')

  // Shared state untuk daftar menu dan kategori
  const [menuItems, setMenuItems] = useState(DUMMY_MENU_ITEMS)
  const [categories, setCategories] = useState(CATEGORIES)

  // Handler: Tambah menu baru
  const handleAddMenu = (newItem) => {
    setMenuItems((prev) => [newItem, ...prev])
    if (!categories.includes(newItem.category)) {
      setCategories((prev) => [...prev, newItem.category])
    }
  }

  // Handler: Hapus menu
  const handleDeleteMenu = (itemId) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  // Handler: Ubah status ketersediaan (Tersedia / Habis)
  const handleToggleAvailability = (itemId) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    )
  }

  // Apple-style clean loading splash screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-2xl mb-4 border border-black/5 animate-pulse">
          ☕
        </div>
        <div className="w-6 h-6 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-[#86868B] font-medium mt-3">
          Memuat Kasio POS...
        </p>
      </div>
    )
  }

  // Jika user belum login, batasi hanya ke LoginPage atau RegisterPage
  if (!user) {
    if (currentView === 'register') {
      return (
        <RegisterPage
          onNavigateToLogin={() => setCurrentView('login')}
          onRegisterSuccess={() => setCurrentView('pos')}
        />
      )
    }

    return (
      <LoginPage
        onLoginSuccess={() => setCurrentView('pos')}
        onNavigateToRegister={() => setCurrentView('register')}
      />
    )
  }

  // Jika user sudah login tapi berada di tampilan login/register, arahkan ke POS
  if (currentView === 'login' || currentView === 'register') {
    return (
      <PosPage
        menuItems={menuItems}
        categories={categories}
        business={business}
        onNavigateToMenuManagement={() => setCurrentView('menu')}
        onNavigateToAnalytics={() => setCurrentView('analytics')}
        onLogout={logout}
      />
    )
  }

  // Tampilan Kelola Menu & Katalog
  if (currentView === 'menu') {
    return (
      <MenuManagementPage
        menuItems={menuItems}
        categories={categories}
        onAddMenu={handleAddMenu}
        onDeleteMenu={handleDeleteMenu}
        onToggleAvailability={handleToggleAvailability}
        onNavigateToPos={() => setCurrentView('pos')}
        onNavigateToLogin={() => {
          logout()
          setCurrentView('login')
        }}
      />
    )
  }

  // Tampilan Analitik & Laporan Penjualan
  if (currentView === 'analytics') {
    return (
      <AnalyticsPage
        onNavigateToPos={() => setCurrentView('pos')}
      />
    )
  }

  // Default: Tampilan Kasir POS
  return (
    <PosPage
      menuItems={menuItems}
      categories={categories}
      business={business}
      onNavigateToMenuManagement={() => setCurrentView('menu')}
      onNavigateToAnalytics={() => setCurrentView('analytics')}
      onLogout={logout}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}