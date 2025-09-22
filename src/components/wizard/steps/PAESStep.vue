<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import ValidationMessage from '@/components/ui/validation-message.vue'
import {
  Calculator,
  BookOpen,
  FlaskConical,
  Globe,
  TrendingUp,
  Info,
  Shield,
  CheckCircle
} from 'lucide-vue-next'
import { useFormValidation } from '@/composables/useFormValidation'
import type { FormData } from '@/types/simulador'
import { calculatePAESTotal } from '@/utils/calculations'

// Props
interface Props {
  formData: FormData
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:form-data': [data: Partial<FormData>]
  validate: [step: number, isValid: boolean]
}>()

// Estado local
const formData = ref<FormData>({ ...props.formData })

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
const paesTotal = computed(() => {
  if (!formData.value.rendioPAES || !formData.value.paes) return 0
  return calculatePAESTotal(formData.value.paes)
})

const paesPromedio = computed(() => {
  if (paesTotal.value === 0) return 0
  const pruebasRendidas = Object.values(formData.value.paes).filter(p => p && p > 0).length
  return pruebasRendidas > 0 ? Math.round(paesTotal.value / pruebasRendidas) : 0
})

const pruebasRendidas = computed(() => {
  if (!formData.value.rendioPAES || !formData.value.paes) return 0
  return Object.values(formData.value.paes).filter(p => p && p > 0).length
})

const isStepValid = computed(() => {
  // El paso es siempre válido (PAES es opcional)
  return true
})

// Métodos
const handlePAESToggle = () => {
  // Limpiar campos PAES si no rendió
  if (!formData.value.rendioPAES) {
    formData.value.paes = {
      matematica: null,
      lenguaje: null,
      ciencias: null,
      historia: null
    }
  }

  // Emitir datos actualizados
  emit('update:form-data', formData.value)

  // Emitir validación
  emit('validate', 4, isStepValid.value)
}

const calculatePAESTotal = () => {
  // Recalcular total cuando cambien los puntajes
  // Esto se hace automáticamente con el computed
}

const handleSubmit = () => {
  // Validar campos PAES si los hay
  if (formData.value.rendioPAES) {
    const paesFields = ['paes.matematica', 'paes.lenguaje', 'paes.ciencias', 'paes.historia']
    paesFields.forEach(field => validateField(field))
  }

  // Emitir datos actualizados
  emit('update:form-data', formData.value)

  // Emitir validación
  emit('validate', 4, isStepValid.value)
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
    emit('validate', 4, isStepValid.value)
  }, 100) // Debounce de 100ms
}, { deep: true })

watch(() => props.formData, (newData) => {
  // Solo actualizar si hay diferencias reales
  const hasChanges = Object.keys(newData).some(key =>
    (formData.value as any)[key] !== (newData as any)[key]
  )

  if (hasChanges) {
    formData.value = { ...newData }
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Validar paso inicial
  emit('validate', 4, isStepValid.value)
})
</script>

<template>
  <div class="paes-step">
    <div class="step-content">
      <!-- Información del paso -->
      <div class="step-info">
        <h3 class="step-title">PAES (Opcional)</h3>
        <p class="step-description">
          Agrega tus puntajes PAES si los tienes. UNIACC no exige PAES para el ingreso.
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="form">
        <!-- Switch para rendir PAES -->
        <div class="paes-toggle">
          <div class="toggle-container">
            <label class="toggle">
              <input
                v-model="formData.rendioPAES"
                type="checkbox"
                @change="handlePAESToggle"
              />
              <span class="slider"></span>
            </label>
            <div class="toggle-content">
              <h4 class="toggle-title">
                {{ formData.rendioPAES ? 'Sí, rendí PAES' : 'No, no rendí PAES' }}
              </h4>
              <p class="toggle-description">
                {{ formData.rendioPAES
                  ? 'Completa tus puntajes PAES para obtener más beneficios'
                  : 'Puedes continuar sin PAES, UNIACC no lo exige'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Campos de PAES (solo si rendió PAES) -->
        <div v-if="formData.rendioPAES" class="paes-fields">
          <div class="paes-header">
            <h4 class="paes-title">Puntajes PAES</h4>
            <p class="paes-subtitle">
              Ingresa tus puntajes en la nueva escala (100 - 1000 puntos)
            </p>
          </div>

          <div class="paes-grid">
            <!-- Matemática -->
            <div class="paes-field">
              <label for="matematica" class="paes-label">
                <Calculator class="w-5 h-5" />
                Matemática
              </label>
              <Input
                id="matematica"
                v-model="formData.paes.matematica"
                type="number"
                min="100"
                max="1000"
                placeholder="750"
                :class="{ 'error': hasFieldError('paes.matematica') }"
                @blur="validateField('paes.matematica')"
                @input="calculatePAESTotal"
              />
              <ValidationMessage
                v-if="hasFieldError('paes.matematica')"
                :message="getFieldErrorMessage('paes.matematica')"
                type="error"
              />
            </div>

            <!-- Lenguaje -->
            <div class="paes-field">
              <label for="lenguaje" class="paes-label">
                <BookOpen class="w-5 h-5" />
                Lenguaje
              </label>
              <Input
                id="lenguaje"
                v-model="formData.paes.lenguaje"
                type="number"
                min="100"
                max="1000"
                placeholder="800"
                :class="{ 'error': hasFieldError('paes.lenguaje') }"
                @blur="validateField('paes.lenguaje')"
                @input="calculatePAESTotal"
              />
              <ValidationMessage
                v-if="hasFieldError('paes.lenguaje')"
                :message="getFieldErrorMessage('paes.lenguaje')"
                type="error"
              />
            </div>

            <!-- Ciencias -->
            <div class="paes-field">
              <label for="ciencias" class="paes-label">
                <FlaskConical class="w-5 h-5" />
                Ciencias
              </label>
              <Input
                id="ciencias"
                v-model="formData.paes.ciencias"
                type="number"
                min="100"
                max="1000"
                placeholder="700"
                :class="{ 'error': hasFieldError('paes.ciencias') }"
                @blur="validateField('paes.ciencias')"
                @input="calculatePAESTotal"
              />
              <ValidationMessage
                v-if="hasFieldError('paes.ciencias')"
                :message="getFieldErrorMessage('paes.ciencias')"
                type="error"
              />
            </div>

            <!-- Historia -->
            <div class="paes-field">
              <label for="historia" class="paes-label">
                <Globe class="w-5 h-5" />
                Historia
              </label>
              <Input
                id="historia"
                v-model="formData.paes.historia"
                type="number"
                min="100"
                max="1000"
                placeholder="650"
                :class="{ 'error': hasFieldError('paes.historia') }"
                @blur="validateField('paes.historia')"
                @input="calculatePAESTotal"
              />
              <ValidationMessage
                v-if="hasFieldError('paes.historia')"
                :message="getFieldErrorMessage('paes.historia')"
                type="error"
              />
            </div>
          </div>

          <!-- Resumen de PAES -->
          <div v-if="paesTotal > 0" class="paes-summary">
            <div class="summary-card">
              <div class="summary-header">
                <TrendingUp class="w-6 h-6 text-green-600" />
                <h4 class="summary-title">Resumen PAES</h4>
              </div>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="summary-label">Puntaje Total:</span>
                  <span class="summary-value">{{ paesTotal }} puntos</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Promedio:</span>
                  <span class="summary-value">{{ paesPromedio }} puntos</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Pruebas Rendidas:</span>
                  <span class="summary-value">{{ pruebasRendidas }}/4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información sobre PAES -->
        <div class="paes-info">
          <div class="info-card">
            <Info class="w-5 h-5 text-blue-600" />
            <div class="info-content">
              <h4 class="info-title">Información sobre PAES</h4>
              <ul class="info-list">
                <li>• UNIACC <strong>NO exige PAES</strong> para el ingreso</li>
                <li>• Los puntajes PAES pueden darte acceso a beneficios adicionales</li>
                <li>• La nueva escala va de 100 a 1000 puntos</li>
                <li>• Puedes rendir PAES en cualquier momento</li>
                <li>• Los beneficios se calculan con o sin PAES</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="form-info">
          <div class="info-card">
            <Shield class="w-5 h-5 text-blue-600" />
            <div class="info-content">
              <h4 class="info-title">Beneficios Disponibles</h4>
              <div class="benefits-grid">
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Becas por mérito académico</span>
                </div>
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Descuentos por puntajes altos</span>
                </div>
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Programas especiales</span>
                </div>
                <div class="benefit-item">
                  <CheckCircle class="w-4 h-4 text-green-600" />
                  <span>Convenios con instituciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.paes-step {
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

.paes-toggle {
  @apply mb-8;
}

.toggle-container {
  @apply flex items-start space-x-4 p-6 bg-gray-50 rounded-lg border border-gray-200;
}

.toggle {
  @apply relative inline-block w-12 h-6 flex-shrink-0;
}

.toggle input {
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

.toggle-content {
  @apply flex-1;
}

.toggle-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.toggle-description {
  @apply text-sm text-gray-600;
}

.paes-fields {
  @apply space-y-6;
}

.paes-header {
  @apply text-center mb-6;
}

.paes-title {
  @apply text-xl font-bold text-gray-900 mb-2;
}

.paes-subtitle {
  @apply text-gray-600;
}

.paes-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.paes-field {
  @apply space-y-2;
}

.paes-label {
  @apply flex items-center space-x-2 text-sm font-medium text-gray-700;
}

.paes-summary {
  @apply mt-6;
}

.summary-card {
  @apply bg-green-50 border border-green-200 rounded-lg p-6;
}

.summary-header {
  @apply flex items-center space-x-2 mb-4;
}

.summary-title {
  @apply text-lg font-semibold text-green-900;
}

.summary-content {
  @apply space-y-2;
}

.summary-item {
  @apply flex justify-between items-center py-2 border-b border-green-100 last:border-b-0;
}

.summary-label {
  @apply text-sm font-medium text-green-800;
}

.summary-value {
  @apply text-sm font-bold text-green-900;
}

.paes-info {
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

.info-list {
  @apply space-y-1 text-sm text-blue-800;
}

.form-info {
  @apply mt-8;
}

.benefits-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.benefit-item {
  @apply flex items-center space-x-2 text-sm text-blue-800;
}

/* Animaciones */
.toggle-container {
  @apply transform transition-all duration-300;
}

.toggle-container:hover {
  @apply scale-105;
}

.summary-card {
  @apply transform transition-all duration-300;
}

.summary-card:hover {
  @apply scale-105;
}

/* Responsive */
@media (max-width: 768px) {
  .paes-grid {
    @apply grid-cols-1;
  }

  .toggle-container {
    @apply flex-col space-x-0 space-y-4;
  }

  .benefits-grid {
    @apply grid-cols-1;
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

  .toggle-container {
    @apply bg-gray-800 border-gray-700;
  }

  .toggle-title {
    @apply text-white;
  }

  .toggle-description {
    @apply text-gray-300;
  }

  .paes-title {
    @apply text-white;
  }

  .paes-subtitle {
    @apply text-gray-300;
  }

  .paes-label {
    @apply text-gray-300;
  }

  .summary-card {
    @apply bg-green-900 border-green-700;
  }

  .summary-title {
    @apply text-green-200;
  }

  .summary-label {
    @apply text-green-300;
  }

  .summary-value {
    @apply text-green-200;
  }

  .info-card {
    @apply bg-blue-900 border-blue-700;
  }

  .info-title {
    @apply text-blue-200;
  }

  .info-list {
    @apply text-blue-300;
  }

  .benefit-item {
    @apply text-blue-300;
  }
}
</style>
