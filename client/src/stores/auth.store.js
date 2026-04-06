import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout,
  onAuthChange,
} from '../services/firebase.js'
import apiClient from '../services/api.client.js'
import { useThemeStore } from './theme.store.js'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ───────────────────────────────────────────────────────────────────
  const currentUser  = ref(null)  // Firebase user objesi
  const userProfile  = ref(null)  // Backend'deki profil (API üzerinden)
  const loading      = ref(true)
  const authReady    = ref(false)

  // ─── Getters ──────────────────────────────────────────────────────────────────
  const isLoggedIn    = computed(() => !!currentUser.value)
  const displayName   = computed(() => currentUser.value?.displayName || 'Kullanıcı')
  const email         = computed(() => currentUser.value?.email || '')
  const uid           = computed(() => currentUser.value?.uid || null)
  const monthlyIncome = computed(() => userProfile.value?.monthlyIncome || 0)
  const idealRatios   = computed(() => userProfile.value?.idealRatios || {
    kira: 25, yemek: 22, ulasim: 12, faturalar: 8, eglence: 10, egitim: 8, birikim: 10, diger: 5,
  })

  // ─── Actions ──────────────────────────────────────────────────────────────────

  // Firebase auth state dinleyicisi — uygulama başında bir kez çağrılır
  function initAuth() {
    return new Promise((resolve) => {
      onAuthChange(async (firebaseUser) => {
        currentUser.value = firebaseUser
        if (firebaseUser) {
          await fetchUserProfile()
        } else {
          userProfile.value = null
        }
        loading.value   = false
        authReady.value = true
        resolve(firebaseUser)
      })
    })
  }

  // GET /api/users/me → { success: true, data: {...} }
  async function fetchUserProfile() {
    try {
      const res = await apiClient.get('/users/me')
      // Axios interceptor response.data döndürür → res = { success, data }
      userProfile.value = res.data ?? res
      
      if (userProfile.value?.theme) {
        useThemeStore().setTheme(userProfile.value.theme)
      }
    } catch {
      // Profil henüz oluşturulmamış (yeni kayıt) — sorun değil
      userProfile.value = null
    }
  }

  async function signInEmail(emailVal, password) {
    loading.value = true
    try {
      const user = await loginWithEmail(emailVal, password)
      currentUser.value = user
      await fetchUserProfile()
    } finally {
      loading.value = false
    }
  }

  async function signInGoogle() {
    loading.value = true
    try {
      const user = await loginWithGoogle()
      currentUser.value = user
      await ensureUserProfile(user)
      await fetchUserProfile()
    } finally {
      loading.value = false
    }
  }

  async function register(emailVal, password, name, university) {
    loading.value = true
    try {
      // 1. Firebase Auth'ta kullanıcı oluştur
      const user = await registerWithEmail(emailVal, password, name)
      currentUser.value = user

      // 2. Backend'de Firestore profili oluştur
      //    Endpoint: POST /api/users/me
      const res = await apiClient.post('/users/me', { name, email: emailVal, university })
      userProfile.value = res.data ?? res
    } finally {
      loading.value = false
    }
  }

  // Google ile giriş: profil yoksa oluştur, varsa atla
  async function ensureUserProfile(firebaseUser) {
    try {
      const res = await apiClient.get('/users/me')
      // Profil bulundu — güncellemeye gerek yok
      if (res.data || res.name) return
    } catch {
      // 404 → profil yok, oluştur
    }
    await apiClient.post('/users/me', {
      name:  firebaseUser.displayName || firebaseUser.email,
      email: firebaseUser.email,
      university: '',
    })
  }

  // PATCH /api/users/me/settings
  async function updateMonthlyIncome(amount) {
    const res = await apiClient.patch('/users/me/settings', { monthlyIncome: amount })
    userProfile.value = res.data ?? res
  }

  async function updateIdealRatios(ratios) {
    const res = await apiClient.patch('/users/me/settings', { idealRatios: ratios })
    userProfile.value = res.data ?? res
  }

  async function updateTheme(theme) {
    const res = await apiClient.patch('/users/me/settings', { theme: theme })
    userProfile.value = res.data ?? res
    useThemeStore().setTheme(theme)
  }

  async function signOut() {
    await logout()
    currentUser.value = null
    userProfile.value = null
  }

  return {
    // state
    currentUser, userProfile, loading, authReady,
    // getters
    isLoggedIn, displayName, email, uid, monthlyIncome, idealRatios,
    // actions
    initAuth, signInEmail, signInGoogle, register, signOut,
    updateMonthlyIncome, updateIdealRatios, updateTheme, fetchUserProfile,
  }
})
