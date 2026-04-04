import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store.js'

// ─── Lazy-loaded views ─────────────────────────────────────────────────────────
const LandingView   = () => import('../views/LandingView.vue')
const LoginView     = () => import('../views/LoginView.vue')
const RegisterView  = () => import('../views/RegisterView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const ExpensesView  = () => import('../views/ExpensesView.vue')
const ReportsView   = () => import('../views/ReportsView.vue')
const SettingsView  = () => import('../views/SettingsView.vue')

const routes = [
  // ─── Genel ──────────────────────────────────────────────────────────────────
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { guestOnly: true },
  },
  {
    path: '/giris',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/kayit',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true },
  },

  // ─── Korumalı sayfalar ────────────────────────────────────────────────────
  {
    path: '/panel',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/harcamalar',
    name: 'expenses',
    component: ExpensesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/raporlar',
    name: 'reports',
    component: ReportsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/ayarlar',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true },
  },

  // ─── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'landing' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

// ─── Route Guard ───────────────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Auth state hazır değilse bekle
  if (!authStore.authReady) {
    await authStore.initAuth()
  }

  const isLoggedIn = authStore.isLoggedIn

  // Giriş gerektiren sayfa, giriş yapılmamış
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Sadece misafir sayfası (landing, login, register), giriş yapılmış
  if (to.meta.guestOnly && isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
