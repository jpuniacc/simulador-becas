<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import ValidationMessage from '@/components/ui/validation-message.vue'
import { Info } from 'lucide-vue-next'
import { useFormValidation } from '@/composables/useFormValidation'
import type { FormData, ColegioInfo } from '@/types/simulador'

// Props
interface Props {
  formData: FormData
  colegios: ColegioInfo[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:form-data': [data: Partial<FormData>]
  validate: [step: number, isValid: boolean]
}>()

// Estado local
const formData = ref<FormData>({ ...props.formData })
const colegioSearch = ref('')
const showColegioDropdown = ref(false)
const filteredColegios = ref<ColegioInfo[]>([])

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
const isEgresado = computed(() => formData.value.nivelEducativo === 'Egresado')

const añosEgreso = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= 2000; year--) {
    years.push(year)
  }
  return years
})

const isStepValid = computed(() => {
  const baseValid = !!(
    formData.value.nivelEducativo &&
    formData.value.colegio &&
    formData.value.carrera
  )

  if (isEgresado.value) {
    return baseValid && !!(
      formData.value.nem &&
      formData.value.ranking &&
      formData.value.añoEgreso
    )
  }

  return baseValid
})

// Métodos
const handleNivelEducativoChange = () => {
  // Limpiar campos de egresado si no es egresado
  if (!isEgresado.value) {
    formData.value.nem = null
    formData.value.ranking = null
    formData.value.añoEgreso = ''
  }

  // Validar paso
  emit('validate', 2, isStepValid.value)
}

const handleColegioSearch = () => {
  if (colegioSearch.value.length < 2) {
    filteredColegios.value = []
    return
  }

  const search = colegioSearch.value.toLowerCase()
  filteredColegios.value = props.colegios.filter(colegio =>
    colegio.nombre.toLowerCase().includes(search) ||
    colegio.comuna.toLowerCase().includes(search) ||
    colegio.region.toLowerCase().includes(search)
  ).slice(0, 10) // Limitar a 10 resultados
}

const selectColegio = (colegio: ColegioInfo) => {
  formData.value.colegio = colegio.nombre
  colegioSearch.value = colegio.nombre
  showColegioDropdown.value = false
  filteredColegios.value = []

  // Validar campo
  validateField('colegio')
}

const handleSubmit = () => {
  // Validar campos base
  const baseFields = ['nivelEducativo', 'colegio', 'carrera']
  baseFields.forEach(field => validateField(field))

  // Validar campos de egresado si aplica
  if (isEgresado.value) {
    const egresadoFields = ['nem', 'ranking', 'añoEgreso']
    egresadoFields.forEach(field => validateField(field))
  }

  // Emitir datos actualizados
  emit('update:form-data', formData.value)

  // Emitir validación
  emit('validate', 2, isStepValid.value)
}

// Watchers
watch(formData, (newData) => {
  emit('update:form-data', newData)
  emit('validate', 2, isStepValid.value)
}, { deep: true })

watch(() => props.formData, (newData) => {
  formData.value = { ...newData }
  colegioSearch.value = newData.colegio || ''
}, { deep: true })

// Cerrar dropdown al hacer click fuera
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.search-container')) {
    showColegioDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Validar paso inicial
  emit('validate', 2, isStepValid.value)

  // Configurar click outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="academic-data-step">
    <div class="step-content">
      <!-- Información del paso -->
      <div class="step-info">
        <h3 class="step-title">Información Académica</h3>
        <p class="step-description">
          Cuéntanos sobre tu situación académica para calcular los beneficios aplicables
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-grid">
          <!-- Nivel Educativo -->
          <div class="form-field">
            <label for="nivelEducativo" class="form-label">
              Nivel Educativo *
            </label>
            <select
              id="nivelEducativo"
              v-model="formData.nivelEducativo"
              class="form-select"
              :class="{ 'error': hasFieldError('nivelEducativo') }"
              @change="handleNivelEducativoChange"
              @blur="validateField('nivelEducativo')"
            >
              <option value="">Selecciona tu nivel educativo</option>
              <option value="1ro Medio">1° Medio</option>
              <option value="2do Medio">2° Medio</option>
              <option value="3ro Medio">3° Medio</option>
              <option value="4to Medio">4° Medio</option>
              <option value="Egresado">Egresado</option>
            </select>
            <ValidationMessage
              v-if="hasFieldError('nivelEducativo')"
              :message="getFieldErrorMessage('nivelEducativo')"
              type="error"
            />
          </div>

          <!-- Colegio -->
          <div class="form-field">
            <label for="colegio" class="form-label">
              Colegio *
            </label>
            <div class="search-container">
              <Input
                id="colegio"
                v-model="colegioSearch"
                type="text"
                placeholder="Busca tu colegio..."
                class="search-input"
                @input="handleColegioSearch"
                @focus="showColegioDropdown = true"
              />

              <!-- Dropdown de colegios -->
              <div
                v-if="showColegioDropdown && filteredColegios.length > 0"
                class="dropdown"
              >
                <div
                  v-for="colegio in filteredColegios"
                  :key="colegio.id"
                  class="dropdown-item"
                  @click="selectColegio(colegio)"
                >
                  <div class="colegio-info">
                    <h4 class="colegio-nombre">{{ colegio.nombre }}</h4>
                    <p class="colegio-details">
                      {{ colegio.comuna }}, {{ colegio.region }} • {{ colegio.dependencia }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <ValidationMessage
              v-if="hasFieldError('colegio')"
              :message="getFieldErrorMessage('colegio')"
              type="error"
            />
          </div>

          <!-- Carrera -->
          <div class="form-field">
            <label for="carrera" class="form-label">
              Carrera de Interés *
            </label>
            <select
              id="carrera"
              v-model="formData.carrera"
              class="form-select"
              :class="{ 'error': hasFieldError('carrera') }"
              @blur="validateField('carrera')"
            >
              <option value="">Selecciona una carrera</option>
              <option value="Ingeniería Comercial">Ingeniería Comercial</option>
              <option value="Ingeniería en Informática">Ingeniería en Informática</option>
              <option value="Psicología">Psicología</option>
              <option value="Derecho">Derecho</option>
              <option value="Arquitectura">Arquitectura</option>
              <option value="Periodismo">Periodismo</option>
              <option value="Publicidad">Publicidad</option>
              <option value="Diseño Gráfico">Diseño Gráfico</option>
              <option value="Ingeniería en Construcción">Ingeniería en Construcción</option>
              <option value="Trabajo Social">Trabajo Social</option>
            </select>
            <ValidationMessage
              v-if="hasFieldError('carrera')"
              :message="getFieldErrorMessage('carrera')"
              type="error"
            />
          </div>
        </div>

        <!-- Campos condicionales para egresados -->
        <div v-if="isEgresado" class="egresado-section">
          <div class="section-header">
            <h4 class="section-title">Datos de Egreso</h4>
            <p class="section-description">
              Como egresado, necesitamos algunos datos adicionales para calcular tus beneficios
            </p>
          </div>

          <div class="form-grid">
            <!-- NEM -->
            <div class="form-field">
              <label for="nem" class="form-label">
                NEM (Notas de Enseñanza Media) *
              </label>
              <Input
                id="nem"
                v-model="formData.nem"
                type="number"
                step="0.01"
                min="1.0"
                max="7.0"
                placeholder="5.5"
                :class="{ 'error': hasFieldError('nem') }"
                @blur="validateField('nem')"
              />
              <p class="field-help">Promedio de notas de 1° a 4° Medio (1.0 - 7.0)</p>
              <ValidationMessage
                v-if="hasFieldError('nem')"
                :message="getFieldErrorMessage('nem')"
                type="error"
              />
            </div>

            <!-- Ranking -->
            <div class="form-field">
              <label for="ranking" class="form-label">
                Ranking de Notas *
              </label>
              <Input
                id="ranking"
                v-model="formData.ranking"
                type="number"
                step="1"
                min="0"
                max="1000"
                placeholder="750"
                :class="{ 'error': hasFieldError('ranking') }"
                @blur="validateField('ranking')"
              />
              <p class="field-help">Posición relativa en tu generación (0 - 1000)</p>
              <ValidationMessage
                v-if="hasFieldError('ranking')"
                :message="getFieldErrorMessage('ranking')"
                type="error"
              />
            </div>

            <!-- Año de Egreso -->
            <div class="form-field">
              <label for="añoEgreso" class="form-label">
                Año de Egreso *
              </label>
              <select
                id="añoEgreso"
                v-model="formData.añoEgreso"
                class="form-select"
                :class="{ 'error': hasFieldError('añoEgreso') }"
                @blur="validateField('añoEgreso')"
              >
                <option value="">Selecciona el año</option>
                <option
                  v-for="año in añosEgreso"
                  :key="año"
                  :value="año.toString()"
                >
                  {{ año }}
                </option>
              </select>
              <ValidationMessage
                v-if="hasFieldError('añoEgreso')"
                :message="getFieldErrorMessage('añoEgreso')"
                type="error"
              />
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="form-info">
          <div class="info-card">
            <Info class="w-5 h-5 text-blue-600" />
            <div class="info-content">
              <h4 class="info-title">Información Importante</h4>
              <ul class="info-list">
                <li v-if="!isEgresado">
                  • Si estás en 1° a 4° Medio, no necesitas NEM ni Ranking
                </li>
                <li v-else>
                  • El NEM y Ranking son importantes para calcular becas académicas
                </li>
                <li>• Puedes buscar tu colegio escribiendo el nombre</li>
                <li>• La carrera seleccionada afecta los beneficios disponibles</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.academic-data-step {
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

.search-container {
  @apply relative;
}

.search-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.dropdown {
  @apply absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto;
}

.dropdown-item {
  @apply px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0;
}

.colegio-info {
  @apply space-y-1;
}

.colegio-nombre {
  @apply text-sm font-medium text-gray-900;
}

.colegio-details {
  @apply text-xs text-gray-500;
}

.egresado-section {
  @apply mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg;
}

.section-header {
  @apply mb-6;
}

.section-title {
  @apply text-lg font-semibold text-blue-900 mb-2;
}

.section-description {
  @apply text-sm text-blue-800;
}

.field-help {
  @apply text-xs text-gray-500;
}

.form-info {
  @apply mt-8;
}

.info-card {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3;
}

.info-content {
  @apply flex-1;
}

.info-title {
  @apply text-sm font-semibold text-blue-900 mb-2;
}

.info-list {
  @apply space-y-1 text-sm text-blue-800;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    @apply grid-cols-1;
  }

  .egresado-section {
    @apply p-4;
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

  .form-select,
  .search-input {
    @apply bg-gray-800 border-gray-600 text-white;
  }

  .dropdown {
    @apply bg-gray-800 border-gray-600;
  }

  .dropdown-item {
    @apply hover:bg-gray-700 border-gray-600;
  }

  .colegio-nombre {
    @apply text-white;
  }

  .colegio-details {
    @apply text-gray-400;
  }

  .egresado-section {
    @apply bg-blue-900 border-blue-700;
  }

  .section-title {
    @apply text-blue-200;
  }

  .section-description {
    @apply text-blue-300;
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
}
</style>
