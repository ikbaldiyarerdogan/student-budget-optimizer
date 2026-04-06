<script setup>
import { ref, provide, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme.store.js'
import { useAuthStore } from './stores/auth.store.js'
import AppChatbot from './components/layout/AppChatbot.vue'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

// Provide to all child components (AppNavbar uses this)
provide('toggleSidebar', toggleSidebar)
provide('sidebarOpen', sidebarOpen)

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <!-- Backdrop for mobile sidebar -->
  <Transition name="fade">
    <div
      v-if="sidebarOpen"
      class="sidebar-backdrop"
      @click="sidebarOpen = false"
    />
  </Transition>

  <Transition name="page" mode="out-in">
    <RouterView :key="$route.fullPath" />
  </Transition>

  <!-- Global Chatbot (Sadece giriş yapılmışsa göster) -->
  <AppChatbot v-if="authStore.isLoggedIn" />
</template>

<style>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  z-index: 99;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
