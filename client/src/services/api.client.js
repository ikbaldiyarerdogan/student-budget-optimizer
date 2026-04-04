// Axios instance — tüm Express API istekleri buradan geçer
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios'
import { getIdToken } from './firebase.js'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor — Firebase ID Token ekle ─────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getIdToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response interceptor — hata yönetimi ─────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Bir hata oluştu'

    // 401 → auth store'u temizle, login'e yönlendir
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    return Promise.reject(new Error(message))
  },
)

export default apiClient
