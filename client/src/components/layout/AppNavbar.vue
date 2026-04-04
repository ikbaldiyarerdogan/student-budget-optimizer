<script setup>
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <header class="topbar">
    <h1 class="topbar-title">{{ title }}</h1>
    <div class="topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
