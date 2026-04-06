import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const THEMES = [
  { id: 'dark',  label: 'Dark',  icon: '🌙', desc: 'Göz yormayan koyu tema' },
  { id: 'light', label: 'Light', icon: '☀️', desc: 'Aydınlık, temiz görünüm' },
]

export const useThemeStore = defineStore('theme', () => {
  const saved  = localStorage.getItem('sbo-theme') || 'dark'
  const theme  = ref(saved)

  // HTML element'e class uygula
  function applyTheme(t) {
    const html = document.documentElement
    THEMES.forEach(th => html.classList.remove(`theme-${th.id}`))
    html.classList.add(`theme-${t}`)
  }

  function setTheme(t) {
    theme.value = t
    localStorage.setItem('sbo-theme', t)
    applyTheme(t)
  }

  // Uygulama başında mevcut temayı uygula
  function init() {
    applyTheme(theme.value)
  }

  return { theme, setTheme, init, THEMES }
})
