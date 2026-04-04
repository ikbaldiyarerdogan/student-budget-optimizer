<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store.js'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const navItems = [
  { name: 'dashboard', path: '/panel',       icon: '🏠', label: 'Dashboard'   },
  { name: 'expenses',  path: '/harcamalar',  icon: '💸', label: 'Harcamalar'  },
  { name: 'reports',   path: '/raporlar',    icon: '📈', label: 'Raporlar'    },
  { name: 'settings',  path: '/ayarlar',     icon: '⚙️', label: 'Ayarlar'     },
]

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function getInitials(name) {
  return (name || 'K')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

async function handleLogout() {
  await authStore.signOut()
  router.push('/giris')
}
</script>

<template>
  <aside class="sidebar" role="navigation" aria-label="Ana Navigasyon">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">💰</div>
      <div>
        <div class="sidebar-logo-text">BütçeOptimizer</div>
        <div class="sidebar-logo-sub">Öğrenci Bütçe Yöneticisi</div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div class="nav-section-label">Menü</div>
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        :id="`nav-${item.name}`"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.label }}
      </router-link>
    </nav>

    <!-- User + Logout -->
    <div class="sidebar-footer">
      <div class="sidebar-user" @click="handleLogout" title="Çıkış Yap">
        <div class="sidebar-avatar">{{ getInitials(authStore.displayName) }}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">{{ authStore.displayName }}</div>
          <div class="sidebar-user-email">{{ authStore.email }}</div>
        </div>
        <span style="color:var(--text-muted);font-size:0.75rem">→</span>
      </div>
    </div>
  </aside>
</template>
