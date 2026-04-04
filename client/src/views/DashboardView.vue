<script setup>
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppNavbar  from '../components/layout/AppNavbar.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-main">
      <AppNavbar title="Dashboard" />
      <main class="page-content">
        <div class="coming-soon card card-body text-center" style="padding:80px">
          <div style="font-size:3rem;margin-bottom:16px">📊</div>
          <h2>Dashboard Yakında</h2>
          <p class="text-secondary mt-2">Faz 3'te geliştirilecek.</p>
        </div>
      </main>
    </div>
  </div>
</template>
