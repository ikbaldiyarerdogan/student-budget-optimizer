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

export const useAuthStore = defineStore('auth', () => {
  // ─── State ───────────────────────────────────────────────────────────────────
  const currentUser  = ref(null)  // Firebase user objesi
  const userProfile  = ref(null)  // Firestore'daki profil (API üzerinden)
  const loading      = ref(true)
  const authReady    = ref(false)

  // ─── Getters ──────────────────────────────────────────────────────────────────
  const isLoggedIn    = computed(() => !!currentUser.value)
  const displayName   = computed(() => currentUser.value?.displayName || 'Kullanıcı')
  const email         = computed(() => currentUser.value?.email || '')
  const uid           = computed(() => currentUser.value?.uid || null)
  const monthlyIncome = computed(() => userProfile.value?.monthlyIncome || 0)
  const idealRatios   = computed(() => userProfile.value?.idealRatios || {
    kira: 35, yemek: 22, ulasim: 12, faturalar: 8, eglence: 10, egitim: 8, diger: 5,
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
        loading.value  = false
        authReady.value = true
        resolve(firebaseUser)
      })
    })
  }

  async function fetchUserProfile() {
    try {
      const data = await apiClient.get('/users/me')
      userProfile.value = data
    } catch {
      // Profil henüz oluşturulmamış olabilir (yeni kayıt)
      userProfile.value = null
    }
  }

  async function signInEmail(email, password) {
    loading.value = true
    try {
      const user = await loginWithEmail(email, password)
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
      // Yeni Google kullanıcısı için profil oluştur
      await ensureUserProfile(user)
      await fetchUserProfile()
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, name, university) {
    loading.value = true
    try {
      const user = await registerWithEmail(email, password, name)
      currentUser.value = user
      // Backend'de profil oluştur
      await apiClient.post('/users/register', { name, email, university })
      await fetchUserProfile()
    } finally {
      loading.value = false
    }
  }

  async function ensureUserProfile(firebaseUser) {
    try {
      await apiClient.get('/users/me')
    } catch {
      // Profil yok → oluştur
      await apiClient.post('/users/register', {
        name:  firebaseUser.displayName || firebaseUser.email,
        email: firebaseUser.email,
      })
    }
  }

  async function updateMonthlyIncome(amount) {
    const data = await apiClient.put('/users/me', { monthlyIncome: amount })
    userProfile.value = data
  }

  async function updateIdealRatios(ratios) {
    const data = await apiClient.put('/users/me', { idealRatios: ratios })
    userProfile.value = data
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
    updateMonthlyIncome, updateIdealRatios, fetchUserProfile,
  }
})
