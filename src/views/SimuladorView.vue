<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSimuladorStore } from '@/stores/simuladorStore'
import { useBeneficiosStore } from '@/stores/beneficiosStore'
import WizardContainer from '@/components/wizard/WizardContainer.vue'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, RotateCcw } from 'lucide-vue-next'

// Router
const router = useRouter()

// Stores
const simuladorStore = useSimuladorStore()
const beneficiosStore = useBeneficiosStore()

// Estado local
const isLoading = ref(true)
const error = ref<string | null>(null)

// Métodos
const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const reloadPage = () => {
  window.location.reload()
}

const handleSimulationComplete = (results: any) => {
  console.log('Simulación completada:', results)
  // Aquí podrías agregar lógica adicional como analytics, etc.
}

const handleSimulationError = (errorMessage: string) => {
  console.error('Error en simulación:', errorMessage)
  error.value = errorMessage
}

const handleNewSimulation = () => {
  simuladorStore.reset()
  // El wizard se reiniciará automáticamente
}

const handleStepChange = (step: number) => {
  // Aquí podrías agregar analytics de progreso
  console.log(`Paso actual: ${step}`)
}

// Lifecycle
onMounted(async () => {
  try {
    // Cargar datos necesarios
    await Promise.all([
      beneficiosStore.fetchDeciles(),
      beneficiosStore.fetchNacionalidades(),
      beneficiosStore.fetchColegios(),
      beneficiosStore.fetchBeneficios()
    ])

    isLoading.value = false
  } catch (err) {
    console.error('Error cargando datos:', err)
    error.value = 'Error cargando los datos necesarios. Por favor, recarga la página.'
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Limpiar estado si es necesario
})
</script>

<template>
  <div class="simulador-view">
    <!-- Header de navegación -->
    <div class="simulador-header">
      <div class="header-content">
        <div class="header-left">
          <Button
            variant="ghost"
            size="sm"
            @click="goBack"
            class="back-button"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
            Volver
          </Button>

          <Button
            variant="ghost"
            size="sm"
            @click="goHome"
            class="home-button"
          >
            <Home class="w-4 h-4 mr-2" />
            Inicio
          </Button>
        </div>

        <div class="header-center">
          <h1 class="simulador-title">Simulador de Becas UNIACC</h1>
          <p class="simulador-subtitle">Descubre qué beneficios puedes obtener</p>
        </div>

        <div class="header-right">
          <Button
            variant="outline"
            size="sm"
            @click="handleNewSimulation"
            class="new-simulation-button"
          >
            <RotateCcw class="w-4 h-4 mr-2" />
            Nueva Simulación
          </Button>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="simulador-content">
      <!-- Estado de carga -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h2 class="loading-title">Cargando simulador...</h2>
          <p class="loading-description">
            Preparando todos los datos necesarios para tu simulación
          </p>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-container">
        <div class="error-content">
          <div class="error-icon">
            <div class="error-circle">!</div>
          </div>
          <h2 class="error-title">Error al cargar el simulador</h2>
          <p class="error-description">{{ error }}</p>
          <div class="error-actions">
            <Button @click="goHome" class="error-button">
              <Home class="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
            <Button @click="reloadPage" variant="outline" class="error-button">
              <RotateCcw class="w-4 h-4 mr-2" />
              Recargar Página
            </Button>
          </div>
        </div>
      </div>

      <!-- Simulador -->
      <div v-else class="wizard-container">
        <WizardContainer
          :auto-save="true"
          :save-interval="30000"
          theme="light"
          transition="slide"
          @complete="handleSimulationComplete"
          @step-change="handleStepChange"
          @error="handleSimulationError"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="simulador-footer">
      <div class="footer-content">
        <p class="footer-text">
          © 2024 UNIACC - Simulador de Becas y Beneficios
        </p>
        <div class="footer-links">
          <a href="#" class="footer-link">Términos y Condiciones</a>
          <a href="#" class="footer-link">Política de Privacidad</a>
          <a href="#" class="footer-link">Contacto</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simulador-view {
  @apply min-h-screen bg-gray-50 flex flex-col;
}

.simulador-header {
  @apply bg-white border-b border-gray-200 sticky top-0 z-40;
}

.header-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4;
  @apply flex items-center justify-between;
}

.header-left {
  @apply flex items-center space-x-2;
}

.header-center {
  @apply text-center flex-1;
}

.simulador-title {
  @apply text-xl font-bold text-gray-900;
}

.simulador-subtitle {
  @apply text-sm text-gray-600;
}

.header-right {
  @apply flex items-center space-x-2;
}

.back-button,
.home-button,
.new-simulation-button {
  @apply text-gray-600 hover:text-gray-900;
}

.simulador-content {
  @apply flex-1 flex items-center justify-center p-4;
}

.loading-container,
.error-container {
  @apply flex items-center justify-center min-h-[60vh];
}

.loading-content,
.error-content {
  @apply text-center max-w-md mx-auto;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6;
}

.loading-title,
.error-title {
  @apply text-2xl font-bold text-gray-900 mb-4;
}

.loading-description,
.error-description {
  @apply text-gray-600 mb-6;
}

.error-icon {
  @apply mb-6;
}

.error-circle {
  @apply w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto;
}

.error-actions {
  @apply flex flex-col sm:flex-row gap-4 justify-center;
}

.error-button {
  @apply w-full sm:w-auto;
}

.wizard-container {
  @apply w-full max-w-6xl mx-auto;
}

.simulador-footer {
  @apply bg-white border-t border-gray-200 mt-auto;
}

.footer-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6;
  @apply flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0;
}

.footer-text {
  @apply text-sm text-gray-600;
}

.footer-links {
  @apply flex items-center space-x-6;
}

.footer-link {
  @apply text-sm text-gray-600 hover:text-gray-900 transition-colors;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    @apply flex-col space-y-4;
  }

  .header-left,
  .header-right {
    @apply w-full justify-center;
  }

  .header-center {
    @apply order-first;
  }

  .simulador-title {
    @apply text-lg;
  }

  .simulador-subtitle {
    @apply text-xs;
  }

  .footer-content {
    @apply text-center;
  }

  .footer-links {
    @apply flex-col space-y-2 space-x-0;
  }
}

@media (max-width: 480px) {
  .simulador-content {
    @apply p-2;
  }

  .wizard-container {
    @apply max-w-full;
  }
}

/* Animaciones */
.loading-spinner {
  @apply transition-all duration-300;
}

.error-circle {
  @apply transition-all duration-300;
}

.error-circle:hover {
  @apply scale-105;
}

.back-button,
.home-button,
.new-simulation-button {
  @apply transition-all duration-200;
}

.back-button:hover,
.home-button:hover,
.new-simulation-button:hover {
  @apply scale-105;
}

.footer-link {
  @apply transition-colors duration-200;
}

/* Estados de carga */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-content {
  animation: pulse 2s infinite;
}

/* Transiciones suaves */
.simulador-view {
  @apply transition-all duration-300;
}

.wizard-container {
  @apply transition-all duration-300;
}
</style>
