<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Home, RotateCcw } from 'lucide-vue-next'

// Props
interface Props {
  step: number
  total: number
  title: string
  description: string
  showProgress?: boolean
  estimatedTime?: string
}

const props = withDefaults(defineProps<Props>(), {
  showProgress: true,
  estimatedTime: ''
})

// Computed
const progressPercentage = computed(() => {
  return Math.round((props.step / props.total) * 100)
})
</script>

<template>
  <div class="wizard-header bg-white border-b border-gray-100 rounded-t-xl">
    <!-- Header principal -->
    <div class="header-main px-6 py-5">
      <div class="flex items-center justify-between">
        <!-- Progreso minimalista -->
        <div class="flex items-center space-x-3">
          <div class="text-sm font-medium text-gray-900">{{ step }} de {{ total }}</div>
          <div class="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-uniacc-blue transition-all duration-500 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Acción única -->
        <button class="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100">
          <RotateCcw class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Indicador de paso -->
    <div v-if="title || description" class="step-indicator px-6 py-6">
      <div class="text-center">
        <h2 v-if="title" class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h2>
        <p v-if="description" class="text-gray-600">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wizard-header {
  @apply w-full bg-white;
}

.header-main {
  @apply border-b border-gray-100;
}

.step-indicator {
  @apply border-b border-gray-50;
}

/* Responsive */
@media (max-width: 768px) {
  .header-main {
    @apply flex-col space-y-3;
  }
}
</style>
