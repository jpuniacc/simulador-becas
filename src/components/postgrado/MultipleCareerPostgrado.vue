<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { useCarreras, type Carrera } from '@/composables/useCarreras'
import type { FormData } from '@/types/simulador'

// Props
interface Props {
    formData?: Partial<FormData>
}

const props = withDefaults(defineProps<Props>(), {
    formData: () => ({
        carreraTitulo: '',
        carreraInteres: '',
        carreraInteresId: 0
    })
})

// Emits
const emit = defineEmits<{
    'update:form-data': [data: Partial<FormData>]
    'validation-change': [isValid: boolean]
}>()

// Composable de carreras
const {
    carrerasVigentes,
    loading: carrerasLoading,
    error: carrerasError,
    inicializar: inicializarCarreras,
    buscarCarreras
} = useCarreras()

// Estado local del formulario
const formData = ref<Partial<FormData & { carreraInteres: string; carreraInteresId: number }>>({
    carreraTitulo: props.formData?.carreraTitulo || '',
    carreraInteres: (props.formData as any)?.carreraInteres || '',
    carreraInteresId: (props.formData as any)?.carreraInteresId || 0
})

// Estado para el dropdown de carreras
const carreraSeleccionada = ref<Carrera | null>(null)
const searchTerm = ref((props.formData as any)?.carreraInteres || '')
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})
const carrerasSugeridas = ['Danza', 'Arquitectura', 'Ingeniería Comercial']

// Estado para controlar cuándo mostrar errores
const submitted = ref(false)
const touched = ref({
    carreraTitulo: false,
    carreraInteres: false
})

// Computed para carreras filtradas
const carrerasFiltradas = computed(() => {
    if (!searchTerm.value || !searchTerm.value.trim()) return carrerasVigentes.value
    return buscarCarreras(searchTerm.value)
})

// Computed para verificar si el formulario es válido
const isFormValid = computed(() => {
    return formData.value.carreraTitulo?.trim() !== '' &&
           !!formData.value.carreraInteres && 
           (formData.value.carreraInteresId || 0) > 0
})

// Emitir cambios de validación
watch(isFormValid, (newValue) => {
    emit('validation-change', newValue)
}, { immediate: true })

// Métodos para el dropdown de carreras
const selectCarrera = (carrera: Carrera) => {
    carreraSeleccionada.value = carrera
    formData.value.carreraInteres = carrera.nombre_programa
    formData.value.carreraInteresId = carrera.id
    searchTerm.value = carrera.nombre_programa
    showDropdown.value = false
    touched.value.carreraInteres = true
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
    if (!showDropdown.value) {
        showDropdown.value = true
    }
    calculateDropdownPosition()
}

const seleccionarCarreraSugerida = async (nombre: string) => {
    searchTerm.value = nombre
    showDropdown.value = true
    await nextTick()
    calculateDropdownPosition()
    // Hacer focus en el input para que se despliegue el dropdown
    if (dropdownRef.value) {
        const input = dropdownRef.value.querySelector('input') as HTMLInputElement
        if (input) {
            input.click()
        }
    }
}

// Click outside para cerrar dropdown
const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.carrera-dropdown') && !target.closest('[data-dropdown-content]')) {
        showDropdown.value = false
    }
}

// Función para marcar el formulario como submitted (cuando se intenta avanzar)
const markAsSubmitted = () => {
    submitted.value = true
    // Marcar todos los campos como touched
    Object.keys(touched.value).forEach(key => {
        touched.value[key as keyof typeof touched.value] = true
    })
}

// Exponer el estado de validación al componente padre
defineExpose({
    isFormValid,
    markAsSubmitted
})

// Flag para prevenir ciclos infinitos entre watchers
const isUpdatingFromProps = ref(false)

// Watcher para emitir cambios
watch(formData, (newData) => {
    // Solo emitir si no estamos actualizando desde props
    if (!isUpdatingFromProps.value) {
        emit('update:form-data', { ...newData })
    }
}, { deep: true })

// Watcher para actualizar cuando cambien las props
watch(() => props.formData, (newData) => {
    if (newData) {
        const newDataAny = newData as any
        const hasChanges = 
            formData.value.carreraTitulo !== (newData.carreraTitulo || '') ||
            formData.value.carreraInteres !== (newDataAny?.carreraInteres || '') ||
            formData.value.carreraInteresId !== (newDataAny?.carreraInteresId || 0)

        if (hasChanges) {
            isUpdatingFromProps.value = true
            formData.value = {
                carreraTitulo: newData.carreraTitulo || '',
                carreraInteres: newDataAny?.carreraInteres || '',
                carreraInteresId: newDataAny?.carreraInteresId || 0
            }
            searchTerm.value = newDataAny?.carreraInteres || ''
            // Resetear el flag después de un pequeño delay
            setTimeout(() => {
                isUpdatingFromProps.value = false
            }, 0)
        }
    }
}, { deep: true })

// Lifecycle
onMounted(async () => {
    await inicializarCarreras(2)
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', calculateDropdownPosition)
    window.addEventListener('scroll', calculateDropdownPosition)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', calculateDropdownPosition)
    window.removeEventListener('scroll', calculateDropdownPosition)
})
</script>

<template>
    <div class="career-postgrado-container">
        <div class="form-guide">
            <p class="guide-text">Cuéntanos sobre tu carrera</p>
        </div>
        <form class="career-postgrado-form" @submit.prevent>
            <div class="form-grid">
                <!-- Campo Carrera Título (Formación) -->
                <div class="form-field col-span-1 md:col-span-2">
                    <div class="flex flex-col gap-1">
                        <FloatLabel>
                            <InputText 
                                id="carreraTitulo" 
                                v-model="formData.carreraTitulo" 
                                class="form-input"
                                :invalid="(submitted || touched.carreraTitulo) && (!formData.carreraTitulo || formData.carreraTitulo.trim() === '')"
                                @blur="touched.carreraTitulo = true"
                            />
                            <label for="carreraTitulo">Carrera o Título Profesional (Formación) *</label>
                        </FloatLabel>
                        <Message 
                            v-if="(submitted || touched.carreraTitulo) && (!formData.carreraTitulo || formData.carreraTitulo.trim() === '')" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            Carrera o título es requerido
                        </Message>
                    </div>
                </div>

                <!-- Campo Carrera de Interés -->
                <div class="form-field col-span-1 md:col-span-2">
                    <div class="flex flex-col gap-1">
                        <label for="carreraInteres" class="block text-sm font-medium text-gray-700 mb-2">
                            Carrera de Interés para Nuevo Estudio *
                        </label>
                        <div class="relative carrera-dropdown" ref="dropdownRef">
                            <InputText 
                                id="carreraInteres" 
                                v-model="searchTerm" 
                                type="text"
                                placeholder="Busca tu carrera..." 
                                class="form-input pr-10"
                                :class="{ 'p-invalid': (submitted || touched.carreraInteres) && (!formData.carreraInteres || formData.carreraInteresId === 0) }"
                                @focus="showDropdown = true; calculateDropdownPosition(); touched.carreraInteres = true" 
                                @input="handleSearch"
                                @blur="touched.carreraInteres = true"
                                autocomplete="off" 
                                autocorrect="off" 
                            />
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <i class="pi pi-chevron-down text-gray-400"></i>
                            </div>

                            <!-- Dropdown de carreras -->
                            <div 
                                v-if="showDropdown"
                                class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                :style="dropdownStyle" 
                                data-dropdown-content
                            >
                                <div 
                                    v-for="carrera in carrerasFiltradas" 
                                    :key="carrera.id"
                                    class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    @click="selectCarrera(carrera)"
                                >
                                    <div class="font-medium text-gray-900">{{ carrera.nombre_programa }}</div>
                                    <div class="text-sm text-gray-500">{{ carrera.nivel_academico }}</div>
                                    <div class="text-xs text-blue-600 mt-1">{{ carrera.duracion_programa }}</div>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">
                            Busca por nombre de carrera, facultad o área
                        </p>

                        <Message 
                            v-if="(submitted || touched.carreraInteres) && (!formData.carreraInteres || formData.carreraInteresId === 0)" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            Debes seleccionar una carrera de interés
                        </Message>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
@import '@/assets/form-styles.css';

.career-postgrado-container {
    @apply form-container;
}

.career-suggestions {
    @apply flex flex-wrap items-center gap-2;
}

.suggestions-label {
    @apply text-sm text-gray-600;
}

.suggestion-tag {
    @apply cursor-pointer;
}

.suggestion-tag:hover {
    @apply opacity-80;
}
</style>

