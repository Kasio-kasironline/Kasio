import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PosPage from './pages/PosPage'
import MenuManagementPage from './pages/MenuManagementPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'

function AppContent() {
  const { user, business, isLoading, logout, refreshBusiness } = useAuth()

  // Pilihan tampilan
  const [currentView, setCurrentView] = useState('pos')

  // State menu dan kategori dari Supabase
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState(['Semua'])
  const [categoryList, setCategoryList] = useState([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState('')

  // Ambil data kategori dan menu ketika business tersedia
  useEffect(() => {
    let cancelled = false

    async function loadMenuData() {
      if (!user || !business?.id) {
        setMenuItems([])
        setCategories(['Semua'])
        setCategoryList([])
        setMenuLoading(false)
        return
      }

      setMenuLoading(true)
      setMenuError('')

      try {
        const [categoryResult, menuResult] = await Promise.all([
          supabase
            .from('categories')
            .select('id, name')
            .eq('business_id', business.id)
            .order('name'),

          supabase
            .from('menu_items')
            .select(
              'id, business_id, category_id, name, description, price, image_url, is_available'
            )
            .eq('business_id', business.id)
            .order('created_at', { ascending: false }),
        ])

        if (categoryResult.error) throw categoryResult.error
        if (menuResult.error) throw menuResult.error

        const categoryMap = new Map(
          categoryResult.data.map((category) => [
            category.id,
            category.name,
          ])
        )

        const categoryNames = categoryResult.data.map(
          (category) => category.name
        )

        const mappedMenuItems = menuResult.data.map((item) => ({
          id: item.id,
          name: item.name,
          category:
            categoryMap.get(item.category_id) || 'Tanpa Kategori',
          categoryId: item.category_id,
          price: Number(item.price),
          description: item.description || '',
          image: item.image_url || null,
          isAvailable: item.is_available,
        }))

        if (!cancelled) {
          setCategoryList(categoryResult.data)
          setCategories(['Semua', ...categoryNames])
          setMenuItems(mappedMenuItems)
        }
      } catch (error) {
        console.error('Gagal memuat data menu:', error)

        if (!cancelled) {
          setMenuError(error.message || 'Gagal memuat data menu.')
        }
      } finally {
        if (!cancelled) {
          setMenuLoading(false)
        }
      }
    }

    loadMenuData()

    return () => {
      cancelled = true
    }
  }, [user?.id, business?.id])

  // Cari kategori yang sudah ada atau buat kategori baru
  async function getOrCreateCategory(categoryName) {
    const name = categoryName.trim()

    if (!name || name === 'Semua' || name === 'Tanpa Kategori') {
      throw new Error('Nama kategori tidak valid.')
    }

    const { data: existingCategories, error: findError } =
      await supabase
        .from('categories')
        .select('id, name')
        .eq('business_id', business.id)

    if (findError) throw findError

    const existingCategory = existingCategories.find(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase()
    )

    if (existingCategory) return existingCategory

    // Validasi batas maksimal 5 kategori
    if (existingCategories.length >= 5) {
      throw new Error('Maksimal 5 kategori telah tercapai. Kelola kategori di Pengaturan Tambahan.')
    }

    const { data: createdCategory, error: createError } =
      await supabase
        .from('categories')
        .insert({
          business_id: business.id,
          name,
        })
        .select('id, name')
        .single()

    if (createError) throw createError

    setCategoryList((prev) => [...prev, createdCategory])
    return createdCategory
  }

  // Tambah kategori baru secara manual (maksimal 5 kategori)
  async function handleAddCategory(categoryName) {
    if (!business?.id) {
      throw new Error('Data usaha belum tersedia.')
    }

    const name = categoryName.trim()
    if (!name || name.toLowerCase() === 'semua' || name.toLowerCase() === 'tanpa kategori') {
      throw new Error('Nama kategori tidak valid.')
    }

    if (categoryList.length >= 5) {
      throw new Error('Maksimal 5 kategori telah tercapai.')
    }

    if (categoryList.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Kategori dengan nama tersebut sudah ada.')
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        business_id: business.id,
        name,
      })
      .select('id, name')
      .single()

    if (error) throw error

    setCategoryList((prev) => [...prev, data])
    setCategories((prev) => [...prev, data.name])
    return data
  }

  // Hapus kategori dari Supabase
  async function handleDeleteCategory(categoryId, categoryName) {
    if (!business?.id) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('business_id', business.id)

    if (error) throw error

    setCategoryList((prev) => prev.filter((c) => c.id !== categoryId))
    setCategories((prev) => prev.filter((c) => c !== categoryName))
    setMenuItems((prev) =>
      prev.map((item) =>
        item.categoryId === categoryId
          ? { ...item, category: 'Tanpa Kategori', categoryId: null }
          : item
      )
    )
  }

  // Simpan / update foto QRIS usaha
  async function handleUpdateBusinessQris(qrisUrl) {
    if (!business?.id) throw new Error('Data usaha belum tersedia.')

    const { data, error } = await supabase
      .from('businesses')
      .update({
        qris_image_url: qrisUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business.id)
      .select()
      .single()

    if (error) throw error

    if (refreshBusiness) {
      await refreshBusiness()
    }

    return data
  }

  // Tambah menu ke Supabase
  async function handleAddMenu(newItem) {
    if (!business?.id) {
      throw new Error('Data usaha belum tersedia. Coba lagi.')
    }

    setMenuError('')

    try {
      const category = await getOrCreateCategory(newItem.category)

      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          business_id: business.id,
          category_id: category.id,
          name: newItem.name.trim(),
          description: newItem.description || null,
          price: Number(newItem.price),
          image_url: newItem.image || null,
          is_available: true,
        })
        .select(
          'id, business_id, category_id, name, description, price, image_url, is_available'
        )
        .single()

      if (error) throw error

      const savedItem = {
        id: data.id,
        name: data.name,
        category: category.name,
        categoryId: data.category_id,
        price: Number(data.price),
        description: data.description || '',
        image: data.image_url || null,
        isAvailable: data.is_available,
      }

      setCategories((prev) =>
        prev.some(
          (name) => name.toLowerCase() === category.name.toLowerCase()
        )
          ? prev
          : [...prev, category.name]
      )

      setMenuItems((prev) => [savedItem, ...prev])
    } catch (error) {
      console.error('Gagal menambahkan menu:', error)
      throw error
    }
  }

    // Update menu di Supabase
  async function handleUpdateMenu(updatedItem) {
    if (!business?.id) {
      throw new Error('Data usaha belum tersedia.')
    }

    setMenuError('')

    try {
      const category = await getOrCreateCategory(updatedItem.category)

            const { data, error } = await supabase
        .from('menu_items')
        .update({
          category_id: category.id,
          name: updatedItem.name.trim(),
          description: updatedItem.description || null,
          price: Number(updatedItem.price),
          image_url: updatedItem.image || null,
          is_available: updatedItem.isAvailable !== undefined ? updatedItem.isAvailable : true, // 👈 Tambahkan baris ini
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedItem.id)
        .eq('business_id', business.id)
        .select(
          'id, business_id, category_id, name, description, price, image_url, is_available'
        )
        .single()

      if (error) throw error

      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === updatedItem.id
            ? {
                ...item,
                name: data.name,
                category: category.name,
                categoryId: data.category_id,
                price: Number(data.price),
                description: data.description || '',
                image: data.image_url || null,
                isAvailable: data.is_available,
              }
            : item
        )
      )

      setCategories((prev) =>
        prev.some((name) => name.toLowerCase() === category.name.toLowerCase())
          ? prev
          : [...prev, category.name]
      )
    } catch (error) {
      console.error('Gagal memperbarui menu:', error)
      throw error
    }
  }

  // Hapus menu dari Supabase
  async function handleDeleteMenu(itemId) {
    if (!business?.id) return

    setMenuError('')

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)
        .eq('business_id', business.id)

      if (error) throw error

      setMenuItems((prev) =>
        prev.filter((item) => item.id !== itemId)
      )
    } catch (error) {
      console.error('Gagal menghapus menu:', error)
      setMenuError(error.message || 'Gagal menghapus menu.')
      throw error
    }
  }

  // Ubah status ketersediaan menu di Supabase
  async function handleToggleAvailability(itemId) {
    if (!business?.id) return

    const targetItem = menuItems.find((item) => item.id === itemId)
    if (!targetItem) return

    setMenuError('')

    try {
      const nextStatus = !targetItem.isAvailable

      const { data, error } = await supabase
        .from('menu_items')
        .update({ is_available: nextStatus })
        .eq('id', itemId)
        .eq('business_id', business.id)
        .select('id, is_available')
        .single()

      if (error) throw error

      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isAvailable: data.is_available }
            : item
        )
      )
    } catch (error) {
      console.error('Gagal mengubah status menu:', error)
      setMenuError(
        error.message || 'Gagal mengubah status ketersediaan menu.'
      )
    }
  }

  // Layar loading awal
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

  // Jika belum login
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

  // Jika user sudah login tapi mencoba ke login/register
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

  // Halaman pengelolaan menu
  if (currentView === 'menu') {
    return (
      <MenuManagementPage
        menuItems={menuItems}
        categories={categories}
        categoryList={categoryList}
        business={business}
        isLoading={menuLoading}
        error={menuError}
        onAddMenu={handleAddMenu}
        onUpdateMenu={handleUpdateMenu}
        onDeleteMenu={handleDeleteMenu}
        onToggleAvailability={handleToggleAvailability}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onUpdateBusinessQris={handleUpdateBusinessQris}
        onNavigateToPos={() => setCurrentView('pos')}
      />
    )
  }

  // Halaman analitik
  if (currentView === 'analytics') {
    return (
      <AnalyticsPage
        onNavigateToPos={() => setCurrentView('pos')}
      />
    )
  }

  // Halaman POS
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