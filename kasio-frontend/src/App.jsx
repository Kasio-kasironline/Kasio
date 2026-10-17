import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import PosPage from './pages/PosPage'

export default function App() {
  // Default ke 'pos' agar langsung dapat melihat tampilan katalog kasir & keranjang
  const [currentView, setCurrentView] = useState('pos')

  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => setCurrentView('pos')}
        onNavigateToPos={() => setCurrentView('pos')}
      />
    )
  }

  return <PosPage onNavigateToLogin={() => setCurrentView('login')} />
}