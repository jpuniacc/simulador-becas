<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ValidationMessage from '@/components/ui/validation-message.vue'
import { TrendingUp, Info, CheckCircle, Shield } from 'lucide-vue-next'
import { useFormValidation } from '@/composables/useFormValidation'
import { useDecilCalculation } from '@/composables/useDecilCalculation'
import type { FormData, DecilInfo } from '@/types/simulador'
import { formatCurrency } from '@/utils/formatters'

// Props
interface Props {
  formData: FormData
  deciles: DecilInfo[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:form-data': [data: Partial<FormData>]
  validate: [step: number, isValid: boolean]
}>()

// Estado local
const formData = ref<FormData>({ ...props.formData })
const selectedDecil = ref<number | null>(null)

// Validación
const {
  validateField,
  hasFieldError,
  getFieldErrorMessage,
  isValid
} = useFormValidation(formData.value, {}, {
  validationMode: 'onBlur',
  debounceMs: 300
})

// Computed
const selectedDecilInfo = computed(() => {
  if (!selectedDecil.value) return null
  return props.deciles.find(d => d.decil === selectedDecil.value) || null
})

const isStepValid = computed(() => {
  return !!selectedDecil.value
})

// Métodos
const handleDecilChange = () => {
  // Actualizar datos del formulario
  formData.value.decil = selectedDecil.value

  // Validar campo
  validateField('decil')

  // Emitir validación
  emit('validate', 3, isStepValid.value)
}

const handleCAEChange = () => {
  // Emitir datos actualizados
  emit('update:form-data', formData.value)
}

const handleSubmit = () => {
  // Validar campo
  validateField('decil')

  // Emitir datos actualizados
  emit('update:form-data', formData.value)

  // Emitir validación
  emit('validate', 3, isStepValid.value)
}

// Watchers con debounce para evitar bucles
let updateTimeout: NodeJS.Timeout | null = null

watch(formData, (newData) => {
  // Limpiar timeout anterior
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  // Debounce para emitir actualizaciones
  updateTimeout = setTimeout(() => {
    emit('update:form-data', newData)
    emit('validate', 3, isStepValid.value)
  }, 100) // Debounce de 100ms
}, { deep: true })

watch(() => props.formData, (newData) => {
  // Solo actualizar si hay diferencias reales
  const hasChanges = Object.keys(newData).some(key =>
    (formData.value as any)[key] !== (newData as any)[key]
  )

  if (hasChanges) {
    formData.value = { ...newData }
    selectedDecil.value = newData.decil || null
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Inicializar decil seleccionado
  selectedDecil.value = formData.value.decil || null

  // Validar paso inicial
  emit('validate', 3, isStepValid.value)
})
</script>

<template>
  <div class="socioeconomic-step">
    <div class="step-content">
      <!-- Información del paso -->
      <div class="step-info">
        <h3 class="step-title">Situación Socioeconómica</h3>
        <p class="step-description">
          Selecciona tu decil socioeconómico para calcular los beneficios aplicables
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-grid">
          <!-- Decil Socioeconómico -->
          <div class="form-field">
            <label for="decil" class="form-label">
              Decil Socioeconómico *
            </label>
            <select
              id="decil"
              v-model="selectedDecil"
              class="form-select"
              :class="{ 'error': hasFieldError('decil') }"
              @change="handleDecilChange"
              @blur="validateField('decil')"
            >
              <option value="">Selecciona tu decil</option>
              <option
                v-for="decil in deciles"
                :key="decil.id"
                :value="decil.decil"
              >
                {{ decil.decil }}° decil - {{ decil.descripcionCorta }}
              </option>
            </select>
            <ValidationMessage
              v-if="hasFieldError('decil')"
              :message="getFieldErrorMessage('decil')"
              type="error"
            />
          </div>

          <!-- CAE -->
          <div class="form-field">
            <label class="form-label">
              ¿Piensas en utilizar CAE?
            </label>
            <div class="switch-container">
              <label class="switch">
                <input
                  v-model="formData.tieneCAE"
                  type="checkbox"
                  @change="handleCAEChange"
                />
                <span class="slider"></span>
              </label>
              <span class="switch-label">
                {{ formData.tieneCAE ? 'Sí, pienso usar CAE' : 'No, no pienso usar CAE' }}
              </span>
            </div>
            <p class="field-help">
              El CAE puede complementar otros beneficios y becas
            </p>
          </div>
        </div>

        <!-- Información del decil seleccionado -->
        <div v-if="selectedDecilInfo" class="decil-info-section">
          <div class="decil-card">
            <div class="decil-header">
              <div class="decil-icon">
                <TrendingUp class="w-6 h-6" />
              </div>
              <div class="decil-title">
                <h4>{{ selectedDecilInfo.decil }}° Decil</h4>
                <p>{{ selectedDecilInfo.descripcionCorta }}</p>
              </div>
            </div>

            <div class="decil-details">
              <div class="detail-item">
                <span class="detail-label">Descripción:</span>
                <span class="detail-value">{{ selectedDecilInfo.descripcion }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Rango de ingresos:</span>
                <span class="detail-value">
                  {{ formatCurrency(selectedDecilInfo.rangoIngresoMin) }} -
                  {{ formatCurrency(selectedDecilInfo.rangoIngresoMax) }}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Porcentaje de población:</span>
                <span class="detail-value">{{ selectedDecilInfo.porcentajePoblacion }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Información sobre beneficios -->
        <div class="benefits-info">
          <div class="info-card">
            <Info class="w-5 h-5 text-blue-600" />
            <div class="info-content">
              <h4 class="info-title">Beneficios Disponibles</h4>
              <div class="benefits-list">
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Becas internas y externas</span>
                </div>
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Descuentos en arancel y matrícula</span>
                </div>
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Financiamiento preferencial</span>
                </div>
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Convenios especiales</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="form-info">
          <div class="info-card">
            <Shield class="w-5 h-5 text-blue-600" />
            <div class="info-content">
              <h4 class="info-title">Información Importante</h4>
              <ul class="info-list">
                <li>• Los deciles se basan en datos oficiales de Chile</li>
                <li>• Deciles más bajos tienen acceso a más beneficios</li>
                <li>• El CAE puede complementar otros beneficios</li>
                <li>• Los resultados son estimativos y pueden variar</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.socioeconomic-step {
  @apply max-w-4xl mx-auto;
}

.step-content {
  @apply space-y-8;
}

.step-info {
  @apply text-center mb-8;
}

.step-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
}

.step-description {
  @apply text-gray-600;
}

.form {
  @apply space-y-6;
}

.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.form-field {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-select.error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.switch-container {
  @apply flex items-center space-x-3;
}

.switch {
  @apply relative inline-block w-12 h-6;
}

.switch input {
  @apply opacity-0 w-0 h-0;
}

.slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-all duration-300;
}

.slider:before {
  @apply absolute content-[''] h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300;
}

input:checked + .slider {
  @apply bg-blue-600;
}

input:checked + .slider:before {
  @apply transform translate-x-6;
}

.switch-label {
  @apply text-sm font-medium text-gray-700;
}

.field-help {
  @apply text-xs text-gray-500;
}

.decil-info-section {
  @apply mt-8;
}

.decil-card {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6;
}

.decil-header {
  @apply flex items-center space-x-4 mb-4;
}

.decil-icon {
  @apply w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center;
}

.decil-title h4 {
  @apply text-xl font-bold text-gray-900;
}

.decil-title p {
  @apply text-sm text-gray-600;
}

.decil-details {
  @apply space-y-2;
}

.detail-item {
  @apply flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0;
}

.detail-label {
  @apply text-sm font-medium text-gray-700;
}

.detail-value {
  @apply text-sm text-gray-900 font-medium;
}

.benefits-info {
  @apply mt-8;
}

.info-card {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3;
}

.info-content {
  @apply flex-1;
}

.info-title {
  @apply text-sm font-semibold text-blue-900 mb-3;
}

.benefits-list {
  @apply space-y-2;
}

.benefit-item {
  @apply flex items-center space-x-2 text-sm text-blue-800;
}

.form-info {
  @apply mt-8;
}

.info-list {
  @apply space-y-1 text-sm text-blue-800;
}

/* Animaciones */
.decil-card {
  @apply transform transition-all duration-300;
}

.decil-card:hover {
  @apply scale-105 shadow-lg;
}

.switch {
  @apply transform transition-all duration-200;
}

.switch:hover {
  @apply scale-105;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    @apply grid-cols-1;
  }

  .decil-header {
    @apply flex-col text-center space-x-0 space-y-3;
  }

  .detail-item {
    @apply flex-col items-start space-y-1;
  }

  .switch-container {
    @apply flex-col items-start space-x-0 space-y-2;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .step-title {
    @apply text-white;
  }

  .step-description {
    @apply text-gray-300;
  }

  .form-label {
    @apply text-gray-300;
  }

  .form-select {
    @apply bg-gray-800 border-gray-600 text-white;
  }

  .switch-label {
    @apply text-gray-300;
  }

  .decil-card {
    @apply bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700;
  }

  .decil-title h4 {
    @apply text-white;
  }

  .decil-title p {
    @apply text-gray-300;
  }

  .detail-label {
    @apply text-gray-300;
  }

  .detail-value {
    @apply text-white;
  }

  .info-card {
    @apply bg-blue-900 border-blue-700;
  }

  .info-title {
    @apply text-blue-200;
  }

  .benefit-item {
    @apply text-blue-300;
  }

  .info-list {
    @apply text-blue-300;
  }
}
</style>
