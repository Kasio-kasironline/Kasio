import { useState, useEffect } from 'react'
import { AuthContext } from './auth-context'
import { supabase } from '../lib/supabase'

/**
 * Helper konversi pesan error Supabase ke Bahasa Indonesia ramah pengguna.
 */
function getFriendlyErrorMessage(err) {
  if (!err) return 'Terjadi kesalahan sistem. Silakan coba lagi.'
  const msg = err.message || ''

  if (msg.includes('Invalid login credentials')) {
    return 'Email atau kata sandi salah. Silakan periksa kembali.'
  }
  if (msg.includes('User already registered') || msg.includes('already exists')) {
    return 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.'
  }
  if (msg.includes('Password should be at least 6 characters')) {
    return 'Kata sandi minimal 6 karakter.'
  }
  if (msg.includes('Email not confirmed')) {
    return 'Email Anda belum dikonfirmasi. Silakan cek inbox/spam email Anda.'
  }
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
    return 'Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mencoba lagi.'
  }
  return msg || 'Gagal memproses permintaan autentikasi.'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [business, setBusiness] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ambil data profil bisnis UMKM milik user
  const fetchBusinessProfile = async (userId, userMetadata = {}) => {
    if (!userId) {
      setBusiness(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching business:', error)
        return
      }

      if (!data) {
        // Fallback cadangan jika trigger belum dijalankan di database
        const defaultName = userMetadata.business_name || 'Usaha Saya'
        const defaultPhone = userMetadata.phone || ''
        const { data: newBusiness, error: insertError } = await supabase
          .from('businesses')
          .insert([
            {
              owner_id: userId,
              name: defaultName,
              phone: defaultPhone,
            },
          ])
          .select()
          .single()

        if (!insertError && newBusiness) {
          setBusiness(newBusiness)
        }
      } else {
        setBusiness(data)
      }
    } catch (err) {
      console.error('Error in fetchBusinessProfile:', err)
    }
  }

  useEffect(() => {
    let mounted = true

    // Periksa sesi aktif saat aplikasi pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        fetchBusinessProfile(
          currentSession.user.id,
          currentSession.user.user_metadata
        ).finally(() => {
          if (mounted) setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    })

    // Langganan perubahan status auth (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        await fetchBusinessProfile(
          currentSession.user.id,
          currentSession.user.user_metadata
        )
      } else {
        setBusiness(null)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Fungsi Login
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        return { success: false, error: getFriendlyErrorMessage(error) }
      }

      setSession(data.session)
      setUser(data.user)

      if (data.user) {
        await fetchBusinessProfile(data.user.id, data.user.user_metadata)
      }

      return { success: true, data }
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) }
    }
  }

  // Fungsi Register
  const register = async ({
    email,
    password,
    ownerName,
    businessName,
    phone,
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: ownerName.trim(),
            business_name: businessName.trim(),
            phone: phone.trim(),
          },
        },
      })

      if (error) {
        return { success: false, error: getFriendlyErrorMessage(error) }
      }

      // Jika email confirmation dimatikan, session langsung tersedia
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
        if (data.user) {
          await fetchBusinessProfile(data.user.id, {
            business_name: businessName,
            phone,
          })
        }
      }

      return {
        success: true,
        data,
        needsConfirmation: !data.session,
      }
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) }
    }
  }

  // Fungsi Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setBusiness(null)
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  // Muat ulang data usaha (misal setelah ganti nama usaha / QRIS)
  const refreshBusiness = async () => {
    if (user?.id) {
      await fetchBusinessProfile(user.id, user.user_metadata)
    }
  }

  const value = {
    user,
    session,
    business,
    isLoading,
    login,
    register,
    logout,
    refreshBusiness,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}