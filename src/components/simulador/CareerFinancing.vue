<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import FloatLabel from 'primevue/floatlabel'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import OverlayPanel from 'primevue/overlaypanel'
import Message from 'primevue/message'
import { GraduationCap, TrendingUp, CheckCircle, Info } from 'lucide-vue-next'
import { useCarreras, type Carrera } from '@/composables/useCarreras'
import { useDeciles, type Decil } from '@/composables/useDeciles'
import type { FormData } from '@/types/simulador'

// Props
interface Props {
    formData?: Partial<FormData>
}

const props = withDefaults(defineProps<Props>(), {
    formData: () => ({
        carrera: '',
        carreraId: 0,
        tipoPrograma: '' as FormData['tipoPrograma'],
        rendioPAES: false
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

// Composable de deciles
const {
    deciles,
    loading: decilesLoading,
    error: decilesError,
    cargarDeciles,
    formatearRango
} = useDeciles()

// Estado local del formulario
const formData = ref<Partial<FormData>>({
    carrera: props.formData?.carrera || '',
    carreraId: props.formData?.carreraId || 0,
    tipoPrograma: props.formData?.tipoPrograma || 'Regular',
    rendioPAES: props.formData?.rendioPAES || false,
    planeaUsarCAE: props.formData?.planeaUsarCAE || false,
    usaBecasEstado: props.formData?.usaBecasEstado || false,
    decil: props.formData?.decil || null,
    paes: props.formData?.paes || {
        matematica: null,
        lenguaje: null,
        ciencias: null,
        historia: null,
        matematica2: null,
        terceraAsignatura: null
    }
})

// Estado para el dropdown de carreras
const carreraSeleccionada = ref<Carrera | null>(null)
const searchTerm = ref(props.formData?.carrera || '')
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})
const carrerasSugeridas = ['Danza', 'Arquitectura', 'Ingeniería Comercial']
const financingTooltipRef = ref<InstanceType<typeof OverlayPanel> | null>(null)
const financingIconRef = ref<HTMLElement | null>(null)
const decilTooltipRef = ref<InstanceType<typeof OverlayPanel> | null>(null)
const decilIconRef = ref<HTMLElement | null>(null)

// Estado para controlar cuándo mostrar errores
const submitted = ref(false)
const touched = ref({
    carrera: false,
    paesLenguaje: false,
    paesMatematica: false,
    financiamiento: false,
    decil: false
})

// Computed para verificar si es egresado
const isEgresadoOr4to = computed(() => props.formData?.nivelEducativo === 'Egresado' || props.formData?.nivelEducativo === '4to Medio')

const opcionesPAES = [
    { label: 'No', value: false },
    { label: 'Sí', value: true },
]

const opcionesFinanciamiento = [
    { label: 'No', value: false },
    { label: 'Sí', value: true },
]

// Estado para controlar si piensa usar financiamiento del estado
const piensaUsarFinanciamiento = ref(false)

// Computed para carreras filtradas
const carrerasFiltradas = computed(() => {
    if (!searchTerm.value || !searchTerm.value.trim()) return carrerasVigentes.value
    return buscarCarreras(searchTerm.value)
})

// Computed para verificar si es egresado
const isEgresado = computed(() => {
    return props.formData?.nivelEducativo === 'Egresado'
})

// Computed para verificar si se debe mostrar el select de deciles
const showDecilSelection = computed(() => {
    return piensaUsarFinanciamiento.value
})

// Computed para opciones del dropdown de deciles
const decilesOptions = computed(() => {
    return deciles.value.map(decil => ({
        label: formatearRango(decil),
        value: decil.decil,
        decil: decil
    }))
})

// Computed para el valor seleccionado del decil
const selectedDecilValue = computed({
    get: () => formData.value.decil ?? null,
    set: (value: number | null) => {
        formData.value.decil = value
    }
})

// Computed para verificar si el formulario es válido
const isFormValid = computed(() => {
    const hasCarrera = !!formData.value.carrera && formData.value.carreraId > 0

    // Si rindió PAES, los campos de PAES son obligatorios
    if (formData.value.rendioPAES) {
        const hasLenguaje = formData.value.paes?.lenguaje !== null && formData.value.paes?.lenguaje !== undefined
        const hasMatematica = formData.value.paes?.matematica !== null && formData.value.paes?.matematica !== undefined
        if (!hasCarrera || !hasLenguaje || !hasMatematica) {
            return false
        }
    }

    // Si piensa usar financiamiento del estado, debe seleccionar al menos una opción
    if (piensaUsarFinanciamiento.value) {
        const hasFinancingOption = formData.value.planeaUsarCAE || formData.value.usaBecasEstado
        if (!hasFinancingOption) {
            return false
        }
    }

    // Si selecciona alguna opción de financiamiento, debe seleccionar decil
    if (showDecilSelection.value) {
        return hasCarrera && formData.value.decil !== null && formData.value.decil !== undefined
    }

    return hasCarrera
})

// Computed para manejar valores null en PAES
const lenguajeValue = computed({
    get: () => formData.value.paes?.lenguaje ?? null,
    set: (value: number | null) => {
        if (!formData.value.paes) {
            formData.value.paes = {
                matematica: null,
                lenguaje: null,
                ciencias: null,
                historia: null,
                matematica2: null,
                terceraAsignatura: null
            }
        }
        formData.value.paes.lenguaje = value
    }
})

const matematicaValue = computed({
    get: () => formData.value.paes?.matematica ?? null,
    set: (value: number | null) => {
        if (!formData.value.paes) {
            formData.value.paes = {
                matematica: null,
                lenguaje: null,
                ciencias: null,
                historia: null,
                matematica2: null,
                terceraAsignatura: null
            }
        }
        formData.value.paes.matematica = value
    }
})

// Métodos
const selectCarrera = (carrera: Carrera) => {
    carreraSeleccionada.value = carrera
    formData.value.carrera = carrera.nombre_programa
    formData.value.carreraId = carrera.id
    formData.value.tipoPrograma = 'Regular' // Por defecto, se puede ajustar según necesidad
    searchTerm.value = carrera.nombre_programa
    showDropdown.value = false
    touched.value.carrera = true
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

const showFinancingTooltip = (event: MouseEvent) => {
    if (financingIconRef.value && financingTooltipRef.value) {
        financingTooltipRef.value.toggle(event, financingIconRef.value)
    }
}

const hideFinancingTooltip = () => {
    if (financingTooltipRef.value) {
        financingTooltipRef.value.hide()
    }
}

const toggleFinancingTooltip = (event: MouseEvent | TouchEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (financingIconRef.value && financingTooltipRef.value) {
        const target = (event.target as HTMLElement) || financingIconRef.value
        financingTooltipRef.value.toggle(event as MouseEvent, target)
    }
}

const showDecilTooltip = (event: MouseEvent) => {
    if (decilIconRef.value && decilTooltipRef.value) {
        decilTooltipRef.value.toggle(event, decilIconRef.value)
    }
}

const hideDecilTooltip = () => {
    if (decilTooltipRef.value) {
        decilTooltipRef.value.hide()
    }
}

const toggleDecilTooltip = (event: MouseEvent | TouchEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (decilIconRef.value && decilTooltipRef.value) {
        const target = (event.target as HTMLElement) || decilIconRef.value
        decilTooltipRef.value.toggle(event as MouseEvent, target)
    }
}

// Click outside para cerrar dropdown
const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.carrera-dropdown') && !target.closest('[data-dropdown-content]')) {
        showDropdown.value = false
    }
}

// Flag para prevenir ciclos infinitos entre watchers
const isUpdatingFromProps = ref(false)

// Watcher para emitir cambios
watch(formData, (newData) => {
    if (!isUpdatingFromProps.value) {
        emit('update:form-data', { ...newData })
        emit('validation-change', isFormValid.value)
    }
}, { deep: true })

// Emitir cambios de validación
watch(isFormValid, (newValue) => {
    emit('validation-change', newValue)
}, { immediate: true })

// Watcher para limpiar campos de PAES si cambia rendioPAES
watch(() => formData.value.rendioPAES, (newValue) => {
    if (!newValue && formData.value.paes) {
        formData.value.paes.lenguaje = null
        formData.value.paes.matematica = null
    }
})

// Watcher para limpiar opciones de financiamiento si cambia piensaUsarFinanciamiento
watch(() => piensaUsarFinanciamiento.value, (newValue) => {
    if (!newValue) {
        formData.value.planeaUsarCAE = false
        formData.value.usaBecasEstado = false
        formData.value.decil = null
    }
})

// Método para manejar cambios en financiamiento
const handleFinancingChange = () => {
    touched.value.financiamiento = true
    // Si deselecciona ambas opciones, limpiar decil
    if (!formData.value.planeaUsarCAE && !formData.value.usaBecasEstado) {
        formData.value.decil = null
    }

    // Emitir datos actualizados
    emit('update:form-data', formData.value)
    emit('validation-change', isFormValid.value)
}

// Watcher para actualizar cuando cambien las props
watch(() => props.formData, (newData) => {
    if (newData) {
        const hasChanges =
            formData.value.carrera !== (newData.carrera || '') ||
            formData.value.carreraId !== (newData.carreraId || 0) ||
            formData.value.tipoPrograma !== (newData.tipoPrograma || 'Regular') ||
            formData.value.rendioPAES !== (newData.rendioPAES || false) ||
            formData.value.planeaUsarCAE !== (newData.planeaUsarCAE || false) ||
            formData.value.usaBecasEstado !== (newData.usaBecasEstado || false) ||
            formData.value.decil !== (newData.decil || null) ||
            formData.value.paes?.lenguaje !== (newData.paes?.lenguaje || null) ||
            formData.value.paes?.matematica !== (newData.paes?.matematica || null)

        if (hasChanges) {
            isUpdatingFromProps.value = true
            formData.value = {
                carrera: newData.carrera || '',
                carreraId: newData.carreraId || 0,
                tipoPrograma: newData.tipoPrograma || 'Regular',
                rendioPAES: newData.rendioPAES || false,
                planeaUsarCAE: newData.planeaUsarCAE || false,
                usaBecasEstado: newData.usaBecasEstado || false,
                decil: newData.decil || null,
                paes: newData.paes || {
                    matematica: null,
                    lenguaje: null,
                    ciencias: null,
                    historia: null,
                    matematica2: null,
                    terceraAsignatura: null
                }
            }
            searchTerm.value = newData.carrera || ''
            setTimeout(() => {
                isUpdatingFromProps.value = false
            }, 0)
        }
    }
}, { deep: true })

// Función para marcar el formulario como submitted (cuando se intenta avanzar)
const markAsSubmitted = () => {
    submitted.value = true
    // Marcar todos los campos como touched
    Object.keys(touched.value).forEach(key => {
        touched.value[key as keyof typeof touched.value] = true
    })
}

// Función para obtener los campos faltantes
const getMissingFields = (): string[] => {
    const missing: string[] = []
    
    if (!formData.value.carrera?.trim() || formData.value.carreraId === 0) {
        missing.push('Carrera')
    }
    if (formData.value.rendioPAES) {
        if (formData.value.paes?.lenguaje === null || formData.value.paes?.lenguaje === undefined) {
            missing.push('Comprensión Lectora (PAES)')
        }
        if (formData.value.paes?.matematica === null || formData.value.paes?.matematica === undefined) {
            missing.push('Matemática 1 (PAES)')
        }
    }
    // Si piensa usar financiamiento del estado, debe seleccionar al menos una opción
    if (piensaUsarFinanciamiento.value && !formData.value.planeaUsarCAE && !formData.value.usaBecasEstado) {
        missing.push('Opciones de Financiamiento')
    }
    // Si tiene alguna opción de financiamiento seleccionada, debe tener decil
    if ((formData.value.planeaUsarCAE || formData.value.usaBecasEstado) && (formData.value.decil === null || formData.value.decil === undefined)) {
        missing.push('Tramo de Renta Mensual (Decil)')
    }
    
    return missing
}

// Exponer el estado de validación al componente padre
defineExpose({
    isFormValid,
    markAsSubmitted,
    getMissingFields
})

// Lifecycle
onMounted(async () => {
    await inicializarCarreras()
    await cargarDeciles()
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
    <div class="form-container">
        <div class="form-guide">
            <p class="guide-text">Queremos saber qué te interesa estudiar y cómo planeas financiarlo</p>
        </div>
        <form class="personal-form" @submit.prevent>
            <div class="form-grid">
                <!-- Selección de Carrera -->
                <div class="form-field carrera-field">
                    <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div class="flex items-start space-x-3 mb-4">
                            <GraduationCap class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 class="text-lg font-semibold text-green-900">Carrera de Interés</h3>
                                <p class="text-sm text-green-700 mt-1">
                                    Selecciona la carrera que te interesa para personalizar tus beneficios
                                </p>
                            </div>
                        </div>

                        <!-- Dropdown de carreras -->
                        <div class="form-field">

                            <div class="relative carrera-dropdown" ref="dropdownRef">
                                <InputText id="carrera" v-model="searchTerm" type="text"
                                    placeholder="Busca tu carrera..." class="form-input pr-10"
                                    :class="{ 'p-invalid': (submitted || touched.carrera) && (!formData.carrera || formData.carreraId === 0) }"
                                    @focus="showDropdown = true; calculateDropdownPosition(); touched.carrera = true" 
                                    @input="handleSearch"
                                    @blur="touched.carrera = true"
                                    autocomplete="off" autocorrect="off" />
                                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <i class="pi pi-chevron-down text-gray-400"></i>
                                </div>

                                <!-- Dropdown de carreras -->
                                <div v-if="showDropdown"
                                    class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                    :style="dropdownStyle" data-dropdown-content>
                                    <div v-for="carrera in carrerasFiltradas" :key="carrera.id"
                                        class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        @click="selectCarrera(carrera)">
                                        <div class="font-medium text-gray-900">{{ carrera.nombre_programa }}</div>
                                        <div class="text-sm text-gray-500">{{ carrera.nivel_academico }}</div>
                                        <div class="text-xs text-blue-600 mt-1">{{ carrera.duracion_programa }}</div>
                                    </div>
                                </div>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">
                                Busca por nombre de carrera, facultad o área
                            </p>
                            <div class="career-suggestions">
                                <span class="suggestions-label">Ejemplos:</span>
                                <Tag v-for="carrera in carrerasSugeridas" :key="carrera" :value="carrera"
                                    severity="success" class="suggestion-tag"
                                    @click="seleccionarCarreraSugerida(carrera)" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ToggleSwitch para PAES (solo para egresados) -->
                <div v-if="isEgresado" class="form-field paes-field">
                    <label for="rendioPAES" class="form-label">
                        ¿Rendiste la PAES?
                    </label>
                    <SelectButton :options="opcionesPAES" v-model="formData.rendioPAES" optionLabel="label"
                        optionValue="value" class="paes-select-button"/>
                    <span v-if="formData.rendioPAES" class="text-sm text-gray-500 mt-2 mb-0 block">
                        Ingresa tus puntajes PAES en los campos a continuación
                    </span>
                </div>

                

                <!-- Comprensión Lectora (solo si rindió PAES) -->
                <div v-if="formData.rendioPAES" class="form-field">
                    <FloatLabel>
                        <InputNumber id="lenguaje" v-model="lenguajeValue" :min="150" :max="1000" :useGrouping="false"
                            class="form-input"
                            :class="{ 'p-invalid': (submitted || touched.paesLenguaje) && formData.rendioPAES && (formData.paes?.lenguaje === null || formData.paes?.lenguaje === undefined) }"
                            @blur="touched.paesLenguaje = true" />
                        <label for="lenguaje">Comprensión Lectora *</label>
                    </FloatLabel>
                </div>

                <!-- Matemática 1 (solo si rindió PAES) -->
                <div v-if="formData.rendioPAES" class="form-field">
                    <FloatLabel>
                        <InputNumber id="matematica" v-model="matematicaValue" :min="150" :max="1000"
                            :useGrouping="false" class="form-input"
                            :class="{ 'p-invalid': (submitted || touched.paesMatematica) && formData.rendioPAES && (formData.paes?.matematica === null || formData.paes?.matematica === undefined) }"
                            @blur="touched.paesMatematica = true" />
                        <label for="matematica">Matemática 1 *</label>
                    </FloatLabel>
                </div>

                <!-- Pregunta sobre financiamiento del estado -->
                <div v-if="isEgresadoOr4to" class="form-field financiamiento-field">
                    <label for="piensaUsarFinanciamiento" class="form-label">
                        ¿Piensas usar financiamiento del Estado?
                    </label>
                    <SelectButton :options="opcionesFinanciamiento" v-model="piensaUsarFinanciamiento" optionLabel="label"
                        optionValue="value" class="paes-select-button"/>
                </div>

                <!-- Opciones de financiamiento (solo si piensa usar financiamiento del estado) -->
                <div v-if="piensaUsarFinanciamiento" class="form-field financing-options-field">
                    <h4 class="text-md text-gray-500 mt-2 mb-2 block">
                        ¿Qué tipo de financiamiento planeas utilizar?
                        <span ref="financingIconRef" class="inline-flex ml-2">
                            <Info class="w-3 h-3 text-gray-500 cursor-help hover:text-gray-700"
                                @click.stop="toggleFinancingTooltip" @mouseenter="showFinancingTooltip"
                                @mouseleave="hideFinancingTooltip" />
                        </span>
                    </h4>
                    <OverlayPanel ref="financingTooltipRef" class="custom-tooltip-panel">
                        <div class="custom-tooltip">
                            <div class="mb-3">
                                <h4 class="tooltip-title">Becas:</h4>
                                <p class="tooltip-description">Ayuda directa del Estado para reducir tu arancel.</p>
                            </div>
                            <div>
                                <h4 class="tooltip-title">CAE:</h4>
                                <p class="tooltip-description">Un crédito pensado para estudiantes. Sólo se paga después
                                    de titular y con ingresos.</p>
                            </div>
                        </div>
                    </OverlayPanel>
                    <div v-if="(submitted || touched.financiamiento) && piensaUsarFinanciamiento && !formData.planeaUsarCAE && !formData.usaBecasEstado" class="mb-2">
                        <Message severity="error" variant="simple" size="small">
                            Debes seleccionar al menos una opción de financiamiento
                        </Message>
                    </div>
                    <div class="options-grid">
                        <!-- CAE -->
                        <div class="option-card" :class="{ 'selected': formData.planeaUsarCAE, 'error-border': (submitted || touched.financiamiento) && piensaUsarFinanciamiento && !formData.planeaUsarCAE && !formData.usaBecasEstado }">
                            <label class="option-label">
                                <input v-model="formData.planeaUsarCAE" type="checkbox" @change="handleFinancingChange"
                                    class="option-checkbox" />
                                <div class="option-content">
                                    <div class="option-icon">
                                        <TrendingUp class="w-6 h-6" />
                                    </div>
                                    <div class="option-text">
                                        <h5>CAE (Crédito con Aval del Estado)</h5>
                                        <p>Crédito para financiar tu carrera universitaria</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <!-- Becas del Estado -->
                        <div class="option-card" :class="{ 'selected': formData.usaBecasEstado, 'error-border': (submitted || touched.financiamiento) && piensaUsarFinanciamiento && !formData.planeaUsarCAE && !formData.usaBecasEstado }">
                            <label class="option-label">
                                <input v-model="formData.usaBecasEstado" type="checkbox" @change="handleFinancingChange"
                                    class="option-checkbox" />
                                <div class="option-content">
                                    <div class="option-icon">
                                        <CheckCircle class="w-6 h-6" />
                                    </div>
                                    <div class="option-text">
                                        <h5>Becas del Estado</h5>
                                        <p>Becas estatales como Beca Vocación de Profesor, etc.</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Select de Decil (solo si selecciona alguna opción de financiamiento) -->
                <div v-if="showDecilSelection" class="form-field">
                    <label for="decil" class="form-label decil-label">
                        Tramo de Renta Mensual *
                        <i 
                            ref="decilIconRef"
                            class="pi pi-question-circle decil-icon"
                            @mouseenter="showDecilTooltip"
                            @mouseleave="hideDecilTooltip"
                            @click="toggleDecilTooltip"
                        ></i>
                    </label>
                    <Dropdown id="decil" v-model="selectedDecilValue" :options="decilesOptions" optionLabel="label"
                        optionValue="value" placeholder="Selecciona rango" class="form-input w-full"
                        :class="{ 'p-invalid': (submitted || touched.decil) && showDecilSelection && (formData.decil === null || formData.decil === undefined) }"
                        :loading="decilesLoading"
                        @blur="touched.decil = true" />
                    <small v-if="decilesError" class="p-error">{{ decilesError }}</small>
                    <OverlayPanel ref="decilTooltipRef" class="custom-tooltip-panel">
                        <div class="custom-tooltip">
                            <p>Toma el total de ingresos y dividelos por la cantidad de personas que viven en él</p>
                        </div>
                    </OverlayPanel>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
@import '@/assets/form-styles.css';

.carrera-field {
    @apply col-span-1 md:col-span-2;
}

.paes-field {
    @apply col-span-1 md:col-span-2;
}

.financiamiento-field {
    @apply col-span-1 md:col-span-2;
}

.financing-options-field {
    @apply col-span-1 md:col-span-2;
}

.form-label {
    @apply block text-sm font-medium text-gray-700 mb-2;
}

.decil-label {
    @apply flex items-center gap-2;
}

.decil-icon {
    @apply text-gray-500 cursor-help;
    font-size: 1rem;
    width: 1rem;
    height: 1rem;
    display: inline-block;
    line-height: 1;
    transition: color 0.2s;
}

.decil-icon:hover {
    @apply text-gray-700;
}

:deep(.paes-toggle) {
    @apply scale-125;
}



/* Estilos para opciones de financiamiento */
.financing-options {
    @apply mb-8;
}

.section-title {
    @apply text-xl font-semibold text-gray-900 mb-4;
}

.options-grid {
    @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.career-suggestions {
    @apply flex items-center flex-wrap gap-2 mt-3;
}

.suggestions-label {
    @apply text-sm font-medium text-gray-600 mr-1;
}

.suggestion-tag {
    @apply cursor-pointer;
}

.suggestion-tag:hover {
    @apply brightness-95;
}

.option-card {
    @apply border-2 border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md;
}

.option-card.selected {
    @apply border-blue-500 bg-blue-50;
}

.option-card.error-border {
    @apply border-red-500;
}

.option-label {
    @apply cursor-pointer;
}

.option-checkbox {
    @apply sr-only;
}

.option-content {
    @apply flex items-start space-x-3;
}

.option-icon {
    @apply w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600;
}

.option-card.selected .option-icon {
    @apply bg-blue-500 text-white;
}

.option-text h5 {
    @apply font-semibold text-gray-900 mb-1;
}

.option-text p {
    @apply text-sm text-gray-600;
}

/* Estilos para tooltips personalizados */
:deep(.custom-tooltip-panel) {
    @apply max-w-xs;
    padding: 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.custom-tooltip {
    @apply max-w-xs;
    padding: 0.75rem;
}

.tooltip-title {
    @apply font-semibold text-base mb-2 text-gray-900;
    margin: 0 0 0.5rem 0;
}

.tooltip-description {
    @apply text-sm text-gray-700;
    margin: 0;
    line-height: 1.5;
}
</style>
