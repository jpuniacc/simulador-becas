<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sun, Moon, Palette } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
const showColorPicker = ref(false)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const setPrimaryColor = (color: string) => {
  themeStore.setPrimaryColor(color)
  showColorPicker.value = false
}

onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<template>
  <div class="theme-controls relative">
    <!-- Toggle de tema -->
    <button
      @click="toggleTheme"
      class="theme-toggle bg-uniacc-gray hover:bg-uniacc-blue text-white p-3 rounded-lg transition-all duration-200 hover:scale-105"
      :title="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    >
      <Sun v-if="isDark" class="w-5 h-5" />
      <Moon v-else class="w-5 h-5" />
    </button>

    <!-- Selector de colores -->
    <button
      @click="showColorPicker = !showColorPicker"
      class="color-picker bg-uniacc-blue hover:bg-uniacc-blue-hover text-white p-3 rounded-lg transition-all duration-200 hover:scale-105 ml-2"
      title="Cambiar colores"
    >
      <Palette class="w-5 h-5" />
    </button>

    <!-- Panel de colores -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="showColorPicker"
        class="color-picker-panel absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-[200px]"
      >
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Colores UNIACC
        </h3>

        <div class="color-options grid grid-cols-2 gap-2">
          <button
            v-for="color in themeStore.getAvailableColors()"
            :key="color.value"
            @click="setPrimaryColor(color.value)"
            class="color-option flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-uniacc-blue bg-opacity-10': themeStore.primaryColor === color.value }"
          >
            <div
              class="w-4 h-4 rounded-full border-2 border-gray-300"
              :style="{ backgroundColor: color.color }"
            ></div>
            <span class="text-xs text-gray-600 dark:text-gray-400">{{ color.name }}</span>
          </button>
        </div>

        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Color actual: {{ themeStore.primaryColor }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.theme-controls {
  display: flex;
  align-items: center;
}

.color-picker-panel {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.dark .color-picker-panel {
  background: rgba(30, 41, 59, 0.95);
}

.color-option {
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: translateY(-1px);
}
</style>
