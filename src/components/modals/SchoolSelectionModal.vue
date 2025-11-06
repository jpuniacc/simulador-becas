<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X, MapPin, School, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useColegios, type Region, type Comuna, type Colegio } from '@/composables/useColegios'

// Props
interface Props {
  isOpen: boolean
  selectedRegion?: Region | null
  selectedComuna?: Comuna | null
  selectedColegio?: Colegio | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedRegion: null,
  selectedComuna: null,
  selectedColegio: null
})

// Emits
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'update:selectedRegion': [value: Region | null]
  'update:selectedComuna': [value: Comuna | null]
  'update:selectedColegio': [value: Colegio | null]
  'complete': [region: Region, comuna: Comuna, colegio: Colegio]
}>()

// Composable de colegios
const {
  regiones,
  comunasFiltradas,
  colegiosFiltrados,
  regionSeleccionada,
  comunaSeleccionada,
  colegioSeleccionado,
  loading: colegiosLoading,
  error: colegiosError,
  seleccionarRegion,
  seleccionarComuna,
  seleccionarColegio,
  buscarColegios,
  inicializar: inicializarColegios
} = useColegios()

// Estado local
const currentStep = ref<'region' | 'comuna' | 'colegio'>('region')
const searchTerm = ref('')
const isSearching = ref(false)

// Computed
const stepTitle = computed(() => {
  switch (currentStep.value) {
    case 'region': return 'Selecciona tu Región'
    case 'comuna': return 'Selecciona tu Comuna'
    case 'colegio': return 'Selecciona tu Colegio'
    default: return ''
  }
})

const stepDescription = computed(() => {
  switch (currentStep.value) {
    case 'region': return 'Elige la región donde se encuentra tu colegio'
    case 'comuna': return `Comunas de ${regionSeleccionada.value?.region_nombre}`
    case 'colegio': return `Colegios de ${comunaSeleccionada.value?.comuna_nombre}`
    default: return ''
  }
})

const canGoBack = computed(() => {
  return currentStep.value !== 'region'
})

const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 'region': return !!regionSeleccionada.value
    case 'comuna': return !!comunaSeleccionada.value
    case 'colegio': return !!colegioSeleccionado.value
    default: return false
  }
})

const filteredOptions = computed(() => {
  let options = []
  switch (currentStep.value) {
    case 'region':
      options = regiones.value
      break
    case 'comuna':
      options = comunasFiltradas.value
      break
    case 'colegio':
      options = colegiosFiltrados.value
      break
  }

  if (!searchTerm.value) return options

  return options.filter(option => {
    const searchKey = currentStep.value === 'region' ? 'region_nombre' :
                     currentStep.value === 'comuna' ? 'comuna_nombre' : 'nombre'
    return option[searchKey].toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})

// Métodos
const closeModal = () => {
  emit('update:isOpen', false)
}

const goBack = () => {
  if (currentStep.value === 'comuna') {
    currentStep.value = 'region'
    regionSeleccionada.value = null
    comunaSeleccionada.value = null
    colegioSeleccionado.value = null
  } else if (currentStep.value === 'colegio') {
    currentStep.value = 'comuna'
    comunaSeleccionada.value = null
    colegioSeleccionado.value = null
  }
  searchTerm.value = ''
}

const goNext = async () => {
  if (currentStep.value === 'region') {
    currentStep.value = 'comuna'
    await seleccionarComuna(comunaSeleccionada.value)
  } else if (currentStep.value === 'comuna') {
    currentStep.value = 'colegio'
    await seleccionarColegio(colegioSeleccionado.value)
  } else if (currentStep.value === 'colegio') {
    // Completar selección
    if (regionSeleccionada.value && comunaSeleccionada.value && colegioSeleccionado.value) {
      emit('complete', regionSeleccionada.value, comunaSeleccionada.value, colegioSeleccionado.value)
      closeModal()
    }
  }
  searchTerm.value = ''
}

const selectOption = async (option: any) => {
  switch (currentStep.value) {
    case 'region':
      await seleccionarRegion(option)
      await goNext(); // Ir automaticamente a comuna
      break
    case 'comuna':
      await seleccionarComuna(option)
      await goNext(); // Ir automaticamente a colegio
      break
    case 'colegio':
      seleccionarColegio(option)
      break
  }
}

const handleSearch = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const term = target.value
  searchTerm.value = term
  isSearching.value = true

  if (currentStep.value === 'colegio' && comunaSeleccionada.value && term.length >= 2) {
    await buscarColegios(comunaSeleccionada.value.comuna_nombre, term)
  }

  setTimeout(() => {
    isSearching.value = false
  }, 300)
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    currentStep.value = 'region'
    searchTerm.value = ''
    // Inicializar con valores existentes
    if (props.selectedRegion) {
      regionSeleccionada.value = props.selectedRegion
      currentStep.value = 'comuna'
    }
    if (props.selectedComuna) {
      comunaSeleccionada.value = props.selectedComuna
      currentStep.value = 'colegio'
    }
    if (props.selectedColegio) {
      colegioSeleccionado.value = props.selectedColegio
    }
  }
})

// Lifecycle
onMounted(async () => {
  await inicializarColegios()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        @click="closeModal"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="isOpen"
            class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <div class="flex items-center space-x-3">
                <button
                  v-if="canGoBack"
                  @click="goBack"
                  class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft class="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{{ stepTitle }}</h2>
                  <p class="text-sm text-gray-600">{{ stepDescription }}</p>
                </div>
              </div>
              <button
                @click="closeModal"
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <!-- Search -->
            <div class="p-4 border-b border-gray-100">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  v-model="searchTerm"
                  :placeholder="`Buscar ${currentStep === 'region' ? 'región' : currentStep === 'comuna' ? 'comuna' : 'colegio'}...`"
                  class="pl-10"
                  @input="handleSearch"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto">
              <div v-if="colegiosLoading" class="p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-uniacc-blue mx-auto"></div>
                <p class="mt-2 text-sm text-gray-600">Cargando...</p>
              </div>

              <div v-else-if="colegiosError" class="p-8 text-center">
                <p class="text-sm text-red-600">{{ colegiosError }}</p>
              </div>

              <div v-else-if="filteredOptions.length === 0" class="p-8 text-center">
                <p class="text-sm text-gray-500">
                  {{ searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles' }}
                </p>
              </div>

              <div v-else class="p-2">
                <button
                  v-for="(option, index) in filteredOptions"
                  :key="option.id || index"
                  @click="selectOption(option)"
                  :class="[
                    'w-full px-4 py-3 text-left rounded-lg transition-colors duration-150',
                    'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                    'flex items-center space-x-3',
                    (currentStep === 'region' && regionSeleccionada?.region_id === option.region_id) ||
                    (currentStep === 'comuna' && comunaSeleccionada?.comuna_nombre === option.comuna_nombre) ||
                    (currentStep === 'colegio' && colegioSeleccionado?.id === option.id)
                      ? 'bg-uniacc-blue/10 text-uniacc-blue font-medium border border-uniacc-blue/20'
                      : 'text-gray-900'
                  ]"
                >
                  <component
                    :is="currentStep === 'colegio' ? School : MapPin"
                    class="w-5 h-5 text-gray-400 flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium truncate">
                      {{ currentStep === 'region' ? option.region_nombre :
                         currentStep === 'comuna' ? option.comuna_nombre : option.nombre }}
                    </div>
                    <div v-if="currentStep === 'colegio'" class="text-sm text-gray-500 mt-1">
                      <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {{ option.dependencia }}
                        </span>
                        <span v-if="option.tipo_educacion" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {{ option.tipo_educacion }}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-200">
              <div class="flex space-x-3">
                <Button
                  variant="outline"
                  @click="closeModal"
                  class="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  @click="goNext"
                  :disabled="!canGoNext || colegiosLoading"
                  class="flex-1"
                >
                  {{ currentStep === 'colegio' ? 'Seleccionar' : 'Siguiente' }}
                </Button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Smooth scrolling */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
