// Store para manejo de tema
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Estado del tema
  const isDark = ref(false)
  const primaryColor = ref('uniacc-blue')
  const accentColor = ref('uniacc-pink')

  // Inicializar tema desde localStorage
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('uniacc-theme')
    const savedPrimary = localStorage.getItem('uniacc-primary-color')
    const savedAccent = localStorage.getItem('uniacc-accent-color')

    if (savedTheme === 'dark') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    }

    if (savedPrimary) {
      primaryColor.value = savedPrimary
    }

    if (savedAccent) {
      accentColor.value = savedAccent
    }
  }

  // Toggle tema claro/oscuro
  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('uniacc-theme', isDark.value ? 'dark' : 'light')
  }

  // Establecer tema específico
  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('uniacc-theme', theme)
  }

  // Cambiar color primario
  const setPrimaryColor = (color: string) => {
    primaryColor.value = color
    localStorage.setItem('uniacc-primary-color', color)
  }

  // Cambiar color de acento
  const setAccentColor = (color: string) => {
    accentColor.value = color
    localStorage.setItem('uniacc-accent-color', color)
  }

  // Obtener colores disponibles
  const getAvailableColors = () => [
    { name: 'Azul UNIACC', value: 'uniacc-blue', color: '#0056B3' },
    { name: 'Rosa UNIACC', value: 'uniacc-pink', color: '#FF007F' },
    { name: 'Verde UNIACC', value: 'uniacc-green', color: '#00FF00' },
    { name: 'Naranja UNIACC', value: 'uniacc-orange', color: '#FF6B35' }
  ]

  // Aplicar colores al CSS
  const applyColors = () => {
    const root = document.documentElement
    root.style.setProperty('--primary-color', `var(--${primaryColor.value})`)
    root.style.setProperty('--accent-color', `var(--${accentColor.value})`)
  }

  // Watcher para aplicar colores automáticamente
  watch([primaryColor, accentColor], () => {
    applyColors()
  }, { immediate: true })

  return {
    // Estado
    isDark,
    primaryColor,
    accentColor,

    // Acciones
    initializeTheme,
    toggleTheme,
    setTheme,
    setPrimaryColor,
    setAccentColor,
    getAvailableColors,
    applyColors
  }
})
