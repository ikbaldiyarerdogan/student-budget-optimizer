<script setup>
import { inject } from 'vue'

defineProps({
  title: { type: String, default: '' },
})

// Injected from App.vue to toggle sidebar on mobile
const toggleSidebar = inject('toggleSidebar', () => {})
</script>

<template>
  <header class="topbar">
    <!-- Mobile hamburger -->
    <button
      id="sidebar-toggle-btn"
      class="sidebar-toggle-btn"
      @click="toggleSidebar"
      aria-label="Menüyü aç/kapat"
    >
      <span /><span /><span />
    </button>

    <h1 class="topbar-title">{{ title }}</h1>
    <div class="topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.sidebar-toggle-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px; height: 36px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  padding: 8px;
  flex-shrink: 0;
  transition: background var(--trans-fast);
}
.sidebar-toggle-btn:hover { background: var(--bg-glass-hover); }
.sidebar-toggle-btn span {
  display: block;
  height: 2px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: background var(--trans-fast);
}

@media (max-width: 768px) {
  .sidebar-toggle-btn { display: flex; }
}
</style>
