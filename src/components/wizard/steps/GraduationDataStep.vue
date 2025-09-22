<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Input } from '@/components/ui/input'
import ValidationMessage from '@/components/ui/validation-message.vue'
import { Info, GraduationCap } from 'lucide-vue-next'
import { useFormValidation } from '@/composables/useFormValidation'
import { useCarreras, type Carrera } from '@/composables/useCarreras'
import type { FormData } from '@/types/simulador'

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

// Composable de carreras
const {
  carrerasVigentes,
  facultades,
  areas,
  loading: carrerasLoading,
  error: carrerasError,
  inicializar: inicializarCarreras,
  buscarCarreras
} = useCarreras()

// Estado para el dropdown de carreras
const carreraSeleccionada = ref<Carrera | null>(null)
const searchTerm = ref('')
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

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
const rendioPAES = computed(() => formData.value.rendioPAES === true)

// Títulos dinámicos
const stepTitle = computed(() => {
  return isEgresado.value ? 'Datos de Egreso' : 'Carrera de Interés'
})

const stepSubtitle = computed(() => {
  return isEgresado.value
    ? 'Como egresado, necesitamos algunos datos adicionales para calcular tus beneficios'
    : 'Cuéntanos qué carrera te interesa para tu futuro académico'
})

// Computed para carreras filtradas
const carrerasFiltradas = computed(() => {
  if (!searchTerm.value || !searchTerm.value.trim()) return carrerasVigentes.value
  return buscarCarreras(searchTerm.value)
})

const añosEgreso = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= 2000; year--) {
    years.push(year)
  }
  return years
})

const isStepValid = computed(() => {
  if (!isEgresado.value) {
    // Si no es egresado, solo necesita carrera
    return !!formData.value.carrera
  }

  // Si es egresado, necesita NEM, Ranking y año de egreso
  const baseValid = !!(
    formData.value.nem &&
    formData.value.ranking &&
    formData.value.añoEgreso
  )

  // Si rindió PAES, también necesita al menos un puntaje
  if (rendioPAES.value) {
    return baseValid && !!(
      formData.value.puntajeComprensionLectora ||
      formData.value.puntajeMatematica1 ||
      formData.value.puntajeMatematica2 ||
      formData.value.puntajeHistoriaGeografia ||
      formData.value.puntajeCiencias
    )
  }

  return baseValid
})

// Métodos
const handleRendioPAESChange = () => {
  // Limpiar puntajes PAES si no rindió
  if (!rendioPAES.value) {
    formData.value.puntajeComprensionLectora = null
    formData.value.puntajeMatematica1 = null
    formData.value.puntajeMatematica2 = null
    formData.value.puntajeHistoriaGeografia = null
    formData.value.puntajeCiencias = null
    formData.value.puntajeFisica = null
    formData.value.puntajeQuimica = null
    formData.value.puntajeBiologia = null
  }

  // Validar paso
  emit('validate', 3, isStepValid.value)
}

// Métodos para manejar carreras
const selectCarrera = (carrera: Carrera) => {
  carreraSeleccionada.value = carrera
  formData.value.carrera = carrera.nombre_carrera
  showDropdown.value = false
  searchTerm.value = ''

  // Validar paso
  emit('validate', 3, isStepValid.value)
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    searchTerm.value = ''
    calculateDropdownPosition()
  }
}

const calculateDropdownPosition = () => {
  if (!dropdownRef.value) return

  const rect = dropdownRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const dropdownHeight = 384 // max-h-96 = 24rem = 384px

  // Calcular posición vertical
  const spaceBelow = viewportHeight - rect.bottom
  const spaceAbove = rect.top

  let top = rect.bottom + 4 // 4px de margen
  let maxHeight = dropdownHeight

  // Si no hay suficiente espacio abajo, posicionar arriba
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    top = rect.top - dropdownHeight - 4
    maxHeight = Math.min(dropdownHeight, spaceAbove - 4)
  } else {
    maxHeight = Math.min(dropdownHeight, spaceBelow - 4)
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${maxHeight}px`,
    zIndex: '9999'
  }
}

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchTerm.value = target.value
}

// Click outside para cerrar dropdown
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  // No cerrar si el clic es dentro del dropdown o del botón
  if (!target.closest('.carrera-dropdown') && !target.closest('[data-dropdown-content]')) {
    showDropdown.value = false
  }
}

const handleSubmit = () => {
  // Validar campos según el nivel educativo
  if (isEgresado.value) {
    const egresadoFields = ['nem', 'ranking', 'añoEgreso']
    egresadoFields.forEach(field => validateField(field))

    if (rendioPAES.value) {
      const paesFields = ['puntajeComprensionLectora', 'puntajeMatematica1', 'puntajeMatematica2']
      paesFields.forEach(field => validateField(field))
    }
  } else {
    validateField('carrera')
  }

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
    (formData.value as Record<string, unknown>)[key] !== (newData as Record<string, unknown>)[key]
  )

  if (hasChanges) {
    formData.value = { ...newData }
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Inicializar carreras
  await inicializarCarreras()

  // Validar paso inicial
  emit('validate', 3, isStepValid.value)

  // Agregar event listeners
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', calculateDropdownPosition)
  window.addEventListener('scroll', calculateDropdownPosition)
})

onUnmounted(() => {
  // Remover event listeners
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', calculateDropdownPosition)
  window.removeEventListener('scroll', calculateDropdownPosition)
})
</script>

<template>
  <div class="graduation-data-step">
    <div class="step-content">
      <div class="step-header">
        <h2 class="step-title">{{ stepTitle }}</h2>
        <p class="step-subtitle">
          {{ stepSubtitle }}
        </p>
      </div>

      <div class="step-body">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Solo mostrar si es egresado -->
          <div v-if="isEgresado.value" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-4">Datos de Egreso</h3>

            <!-- NEM -->
            <div class="form-field">
              <label for="nem" class="form-label">
                NEM (Notas de Enseñanza Media) *
              </label>
              <Input
                id="nem"
                v-model="formData.nem"
                type="number"
                step="0.1"
                min="1.0"
                max="7.0"
                placeholder="Ej: 5.5"
                class="w-full"
              />
              <p class="text-sm text-gray-500 mt-1">
                Promedio de notas de 1º a 4º Medio (1.0 - 7.0)
              </p>
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
                min="0"
                max="1000"
                placeholder="Ej: 750"
                class="w-full"
              />
              <p class="text-sm text-gray-500 mt-1">
                Posición relativa en tu generación (0-1000)
              </p>
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
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-uniacc-blue focus:border-uniacc-blue"
              >
                <option value="">Selecciona el año</option>
                <option
                  v-for="año in añosEgreso"
                  :key="año"
                  :value="año"
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

            <!-- ¿Rindió PAES? -->
            <div class="form-field">
              <label class="form-label">
                ¿Rendiste la PAES?
              </label>
              <div class="flex space-x-6">
                <label class="flex items-center space-x-2">
                  <input
                    v-model="formData.rendioPAES"
                    type="radio"
                    :value="true"
                    class="w-4 h-4 text-uniacc-blue border-gray-300 focus:ring-uniacc-blue"
                    @change="handleRendioPAESChange"
                  />
                  <span class="text-sm font-medium text-gray-900">Sí</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input
                    v-model="formData.rendioPAES"
                    type="radio"
                    :value="false"
                    class="w-4 h-4 text-uniacc-blue border-gray-300 focus:ring-uniacc-blue"
                    @change="handleRendioPAESChange"
                  />
                  <span class="text-sm font-medium text-gray-900">No</span>
                </label>
              </div>
            </div>

            <!-- Puntajes PAES (solo si rindió) -->
            <div v-if="rendioPAES" class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 class="text-md font-semibold text-gray-900 mb-4">Puntajes PAES</h4>
              <p class="text-sm text-gray-600 mb-4">
                Ingresa al menos uno de tus puntajes PAES (opcional pero recomendado)
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Comprensión Lectora -->
                <div class="form-field">
                  <label for="puntajeComprensionLectora" class="form-label">
                    Comprensión Lectora
                  </label>
                  <Input
                    id="puntajeComprensionLectora"
                    v-model="formData.puntajeComprensionLectora"
                    type="number"
                    min="150"
                    max="850"
                    placeholder="Ej: 650"
                    class="w-full"
                  />
                </div>

                <!-- Matemática 1 -->
                <div class="form-field">
                  <label for="puntajeMatematica1" class="form-label">
                    Matemática 1
                  </label>
                  <Input
                    id="puntajeMatematica1"
                    v-model="formData.puntajeMatematica1"
                    type="number"
                    min="150"
                    max="850"
                    placeholder="Ej: 720"
                    class="w-full"
                  />
                </div>

                <!-- Matemática 2 -->
                <div class="form-field">
                  <label for="puntajeMatematica2" class="form-label">
                    Matemática 2
                  </label>
                  <Input
                    id="puntajeMatematica2"
                    v-model="formData.puntajeMatematica2"
                    type="number"
                    min="150"
                    max="850"
                    placeholder="Ej: 680"
                    class="w-full"
                  />
                </div>

                <!-- Historia y Geografía -->
                <div class="form-field">
                  <label for="puntajeHistoriaGeografia" class="form-label">
                    Historia y Geografía
                  </label>
                  <Input
                    id="puntajeHistoriaGeografia"
                    v-model="formData.puntajeHistoriaGeografia"
                    type="number"
                    min="150"
                    max="850"
                    placeholder="Ej: 600"
                    class="w-full"
                  />
                </div>

                <!-- Ciencias -->
                <div class="form-field">
                  <label for="puntajeCiencias" class="form-label">
                    Ciencias
                  </label>
                  <Input
                    id="puntajeCiencias"
                    v-model="formData.puntajeCiencias"
                    type="number"
                    min="150"
                    max="850"
                    placeholder="Ej: 620"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Si no es egresado, mostrar carrera de interés -->
          <div v-else class="bg-green-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-start space-x-3 mb-4">
              <GraduationCap class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 class="text-lg font-semibold text-green-900">Carrera de Interés</h3>
                <p class="text-sm text-green-700 mt-1">
                  Como estás en {{ formData.nivelEducativo }}, cuéntanos qué carrera te interesa para tu futuro académico
                </p>
              </div>
            </div>

            <div class="form-field">
              <label for="carrera" class="form-label">
                ¿Qué carrera te interesa? *
              </label>

              <!-- Dropdown de carreras -->
              <div class="relative carrera-dropdown">
                <button
                  ref="dropdownRef"
                  type="button"
                  @click="toggleDropdown"
                  class="w-full px-4 py-3 text-left border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-uniacc-blue focus:border-uniacc-blue transition-all duration-200"
                  :class="{
                    'bg-gray-50 text-gray-400': !carreraSeleccionada,
                    'bg-white text-gray-900': carreraSeleccionada
                  }"
                >
                  <div class="flex items-center justify-between">
                    <span>
                      {{ carreraSeleccionada ? carreraSeleccionada.nombre_carrera : 'Selecciona una carrera' }}
                    </span>
                    <svg class="w-5 h-5 text-gray-400" :class="{ 'rotate-180': showDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>

                <!-- Dropdown menu -->
                <Teleport to="body">
                  <div v-if="showDropdown" class="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto" :style="dropdownStyle" data-dropdown-content>
                  <!-- Search input -->
                  <div class="p-3 border-b border-gray-100">
                    <div class="relative">
                      <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                      <input
                        v-model="searchTerm"
                        type="text"
                        placeholder="Buscar carrera..."
                        class="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-uniacc-blue focus:border-uniacc-blue"
                        @input="handleSearch"
                        @click.stop
                        @mousedown.stop
                      />
                    </div>
                  </div>

                  <!-- Loading state -->
                  <div v-if="carrerasLoading" class="p-4 text-center">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-uniacc-blue mx-auto"></div>
                    <p class="mt-2 text-sm text-gray-600">Cargando carreras...</p>
                  </div>

                  <!-- Error state -->
                  <div v-else-if="carrerasError" class="p-4 text-center">
                    <p class="text-sm text-red-600">{{ carrerasError }}</p>
                  </div>

                  <!-- Carreras list -->
                  <div v-else-if="carrerasFiltradas.length === 0" class="p-4 text-center">
                    <p class="text-sm text-gray-500">
                      {{ searchTerm ? 'No se encontraron carreras' : 'No hay carreras disponibles' }}
                    </p>
                  </div>

                  <div v-else class="py-1">
                    <button
                      v-for="carrera in carrerasFiltradas"
                      :key="carrera.id"
                      @click="selectCarrera(carrera)"
                      @mousedown.stop
                      class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
                    >
                      <div class="font-medium">{{ carrera.nombre_carrera }}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ carrera.descripcion_facultad }}
                      </div>
                    </button>
                  </div>
                  </div>
                </Teleport>
              </div>

              <p class="text-sm text-gray-500 mt-1">
                Selecciona una carrera de la lista o busca por nombre
              </p>
              <ValidationMessage
                v-if="hasFieldError('carrera')"
                :message="getFieldErrorMessage('carrera')"
                type="error"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graduation-data-step {
  @apply h-full flex flex-col;
}

.step-content {
  @apply flex-1 flex flex-col;
}

.step-header {
  @apply mb-8;
}

.step-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
}

.step-subtitle {
  @apply text-gray-600;
}

.step-body {
  @apply flex-1;
}

.form-field {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}
</style>
