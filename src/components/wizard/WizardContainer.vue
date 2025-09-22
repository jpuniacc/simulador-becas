<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useSimuladorStore } from '@/stores/simuladorStore'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import WizardHeader from './WizardHeader.vue'
import WizardNavigation from './WizardNavigation.vue'
import WelcomeStep from './steps/WelcomeStep.vue'
import PersonalDataStep from './steps/PersonalDataStep.vue'
import SchoolDataStep from './steps/SchoolDataStep.vue'
import GraduationDataStep from './steps/GraduationDataStep.vue'
import SocioeconomicStep from './steps/SocioeconomicStep.vue'
import PAESStep from './steps/PAESStep.vue'
import ResultsStep from './steps/ResultsStep.vue'

// Props
interface Props {
  autoSave?: boolean
  saveInterval?: number
  theme?: 'light' | 'dark' | 'auto'
  transition?: 'slide' | 'fade' | 'scale'
}

const props = withDefaults(defineProps<Props>(), {
  autoSave: true,
  saveInterval: 30000, // 30 segundos
  theme: 'light',
  transition: 'slide'
})

// Emits
const emit = defineEmits<{
  complete: [results: any]
  stepChange: [step: number]
  error: [error: string]
}>()

// Store
const simuladorStore = useSimuladorStore()

// Estado local
const isSimulating = ref(false)
const simulationProgress = ref(0)
const loadingText = ref('')
const transitionName = ref(props.transition)

// Computed
const currentStep = computed(() => {
  console.log('Current step:', simuladorStore.currentStep)
  return simuladorStore.currentStep
})
const totalSteps = computed(() => simuladorStore.totalSteps)
const canGoBack = computed(() => simuladorStore.canGoBack)
const canGoNext = computed(() => simuladorStore.canGoNext)
const isLastStep = computed(() => simuladorStore.isLastStep)
const showProgress = computed(() => currentStep.value > 0)

const stepTitle = computed(() => {
  const titles = [
    'Bienvenida',
    '', // PersonalDataStep no necesita título en el header
    'Estado Académico',
    '', // GraduationDataStep maneja su propio título dinámicamente
    'Situación Socioeconómica',
    'PAES (Opcional)',
    'Resultados'
  ]
  return titles[currentStep.value] || ''
})

const stepDescription = computed(() => {
  const descriptions = [
    'Ingresa tus datos de contacto para poder enviarte los resultados de tu simulación',
    '', // PersonalDataStep no necesita descripción en el header
    'Cuéntanos sobre tu estado académico actual',
    '', // GraduationDataStep maneja su propia descripción dinámicamente
    'Selecciona tu situación socioeconómica',
    'Agrega tus puntajes PAES si los tienes',
    'Revisa los beneficios que puedes obtener'
  ]
  return descriptions[currentStep.value] || ''
})

const currentStepComponent = computed(() => {
  const components = [
    WelcomeStep,
    PersonalDataStep,
    SchoolDataStep,
    GraduationDataStep,
    SocioeconomicStep,
    PAESStep,
    ResultsStep
  ]
  return components[currentStep.value] || WelcomeStep
})

const stepProps = computed(() => {
  return {
    formData: simuladorStore.formData,
    deciles: simuladorStore.deciles,
    nacionalidades: simuladorStore.nacionalidades,
    colegios: simuladorStore.colegios,
    beneficios: simuladorStore.beneficios,
    results: simuladorStore.results,
    error: simuladorStore.error
  }
})

// Métodos
const handleFormDataUpdate = (data: any) => {
  simuladorStore.updateFormData(data)
}

const handleStepValidation = (step: number, isValid: boolean) => {
  simuladorStore.validateStep(step, isValid)
}

const handleSimulation = async () => {
  try {
    isSimulating.value = true
    loadingText.value = 'Calculando beneficios...'
    simulationProgress.value = 0

    // Simular progreso
    const progressInterval = setInterval(() => {
      if (simulationProgress.value < 90) {
        simulationProgress.value += Math.random() * 20
      }
    }, 200)

    const results = await simuladorStore.simulate()

    clearInterval(progressInterval)
    simulationProgress.value = 100

    setTimeout(() => {
      isSimulating.value = false
      emit('complete', results)
    }, 500)

  } catch (error) {
    isSimulating.value = false
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    emit('error', errorMessage)
  }
}

const handlePrevious = () => {
  simuladorStore.prevStep()
  emit('stepChange', currentStep.value)
}

const handleNext = async () => {
  if (isLastStep.value) {
    await handleSimulation()
  } else {
    simuladorStore.nextStep()
    emit('stepChange', currentStep.value)
  }
}

// Auto-save
let autoSaveInterval: NodeJS.Timeout | null = null

const startAutoSave = () => {
  if (props.autoSave) {
    autoSaveInterval = setInterval(() => {
      simuladorStore.saveToLocalStorage()
    }, props.saveInterval)
  }
}

const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
    autoSaveInterval = null
  }
}

// Watchers
watch(currentStep, (newStep) => {
  // Cambiar transición según la dirección
  if (newStep > currentStep.value) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = 'slide-left'
  }
})

watch(() => simuladorStore.isSimulating, (isSimulating) => {
  if (isSimulating) {
    loadingText.value = simuladorStore.simulationProgress.currentStep
    simulationProgress.value = simuladorStore.simulationProgress.progress
  }
})

// Lifecycle
onMounted(() => {
  // Cargar datos guardados primero
  simuladorStore.loadFromLocalStorage()

  // Luego resetear wizard para asegurar que empezamos desde el paso 0
  simuladorStore.resetWizard()

  // Iniciar auto-save
  startAutoSave()
})

// Cleanup
onUnmounted(() => {
  stopAutoSave()
})

// Métodos del modal
const handleOverlayClick = () => {
  // Opcional: cerrar el modal al hacer click en el overlay
  // emit('close')
}
</script>

<template>
  <div class="wizard-container">
    <!-- Overlay del modal -->
    <div class="wizard-overlay fixed inset-0 z-40" @click="handleOverlayClick">
      <!-- Modal del wizard usando Card -->
      <div class="wizard-modal-container max-w-4xl w-full mx-4 my-8 max-h-[90vh]" @click.stop>
        <Card class="wizard-card h-full flex flex-col shadow-2xl border-0">
          <!-- Header del wizard -->
          <CardHeader class="p-0">
            <WizardHeader
              :step="currentStep"
              :total="totalSteps"
              :title="stepTitle"
              :description="stepDescription"
              :show-progress="showProgress"
            />
          </CardHeader>

          <!-- Contenido del wizard -->
          <CardContent class="flex-1 overflow-y-auto p-0">
            <div class="wizard-content">
              <Transition
                :name="transitionName"
                mode="out-in"
                appear
              >
                <component
                  :is="currentStepComponent"
                  :key="currentStep"
                  v-bind="stepProps"
                  @update:form-data="handleFormDataUpdate"
                  @validate="handleStepValidation"
                  @simulate="handleSimulation"
                />
              </Transition>
            </div>
          </CardContent>

          <!-- Navegación del wizard -->
          <CardFooter class="p-0">
            <div class="wizard-navigation w-full">
              <WizardNavigation
                :can-go-back="canGoBack"
                :can-go-next="canGoNext"
                :is-last-step="isLastStep"
                :is-loading="isSimulating"
                :loading-text="loadingText"
                @back="handlePrevious"
                @next="handleNext"
              />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Overlay de carga -->
    <div
      v-if="isSimulating"
      class="wizard-overlay"
    >
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
        <div class="loading-progress">
          <div
            class="progress-bar"
            :style="{ width: `${simulationProgress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wizard-container {
  @apply max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg;
}

.wizard-content {
  @apply min-h-[400px] relative overflow-hidden;
}

.wizard-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-content {
  @apply bg-white rounded-lg p-8 text-center max-w-sm mx-4;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4;
}

.loading-text {
  @apply text-lg font-medium text-gray-900 mb-4;
}

.loading-progress {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-bar {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}

/* Transiciones */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.slide-right-enter-from {
  @apply transform translate-x-full opacity-0;
}

.slide-right-leave-to {
  @apply transform -translate-x-full opacity-0;
}

.slide-left-enter-from {
  @apply transform -translate-x-full opacity-0;
}

.slide-left-leave-to {
  @apply transform translate-x-full opacity-0;
}

.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

.scale-enter-active,
.scale-leave-active {
  @apply transition-all duration-300;
}

.scale-enter-from {
  @apply transform scale-95 opacity-0;
}

.scale-leave-to {
  @apply transform scale-105 opacity-0;
}

/* Responsive */
@media (max-width: 768px) {
  .wizard-container {
    @apply p-4 mx-2;
  }

  .wizard-content {
    @apply min-h-[300px];
  }
}
</style>
