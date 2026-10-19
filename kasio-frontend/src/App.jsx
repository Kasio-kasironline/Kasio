import { useState } from 'react'
import { CATEGORIES, DUMMY_MENU_ITEMS } from './data/dummyMenu'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PosPage from './pages/PosPage'
import MenuManagementPage from './pages/MenuManagementPage'
import AnalyticsPage from './pages/AnalyticsPage'

export default function App() {
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

  // Tampilan Login
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => setCurrentView('pos')}
        onNavigateToRegister={() => setCurrentView('register')}
      />
    )
  }

  // Tampilan Register
  if (currentView === 'register') {
    return (
      <RegisterPage
        onNavigateToLogin={() => setCurrentView('login')}
        onRegisterSuccess={() => setCurrentView('pos')}
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
        onNavigateToLogin={() => setCurrentView('login')}
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
      onNavigateToMenuManagement={() => setCurrentView('menu')}
      onNavigateToAnalytics={() => setCurrentView('analytics')}
    />
  )
}