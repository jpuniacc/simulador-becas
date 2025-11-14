<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import FloatLabel from 'primevue/floatlabel'
import ToggleSwitch from 'primevue/toggleswitch'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import OverlayPanel from 'primevue/overlaypanel'
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
const caeTooltipRef = ref<InstanceType<typeof OverlayPanel> | null>(null)
const becasTooltipRef = ref<InstanceType<typeof OverlayPanel> | null>(null)
const caeIconRef = ref<HTMLElement | null>(null)
const becasIconRef = ref<HTMLElement | null>(null)

// Computed para carreras filtradas
const carrerasFiltradas = computed(() => {
    if (!searchTerm.value || !searchTerm.value.trim()) return carrerasVigentes.value
    return buscarCarreras(searchTerm.value)
})

// Computed para verificar si se debe mostrar el select de deciles
const showDecilSelection = computed(() => {
    return formData.value.planeaUsarCAE || formData.value.usaBecasEstado
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

const showCAETooltip = (event: MouseEvent) => {
    if (caeIconRef.value && caeTooltipRef.value) {
        caeTooltipRef.value.toggle(event, caeIconRef.value)
    }
}

const hideCAETooltip = () => {
    if (caeTooltipRef.value) {
        caeTooltipRef.value.hide()
    }
}

const showBecasTooltip = (event: MouseEvent) => {
    if (becasIconRef.value && becasTooltipRef.value) {
        becasTooltipRef.value.toggle(event, becasIconRef.value)
    }
}

const hideBecasTooltip = () => {
    if (becasTooltipRef.value) {
        becasTooltipRef.value.hide()
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

// Método para manejar cambios en financiamiento
const handleFinancingChange = () => {
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

// Exponer el estado de validación al componente padre
defineExpose({
    isFormValid
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
                                <InputText
                                    id="carrera"
                                    v-model="searchTerm"
                                    type="text"
                                    placeholder="Busca tu carrera..."
                                    class="form-input pr-10"
                                    @focus="showDropdown = true; calculateDropdownPosition()"
                                    @input="handleSearch"
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
                            <div class="career-suggestions">
                                <span class="suggestions-label">Ejemplos:</span>
                                <Tag
                                    v-for="carrera in carrerasSugeridas"
                                    :key="carrera"
                                    :value="carrera"
                                    severity="success"
                                    class="suggestion-tag"
                                    @click="seleccionarCarreraSugerida(carrera)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ToggleSwitch para PAES -->
                <div class="form-field paes-field">
                    <label for="rendioPAES" class="form-label">
                        ¿Rendiste la PAES?
                    </label>
                    <ToggleSwitch
                        id="rendioPAES"
                        v-model="formData.rendioPAES"
                        class="paes-toggle"
                    />
                    <span v-if="formData.rendioPAES" class="text-sm text-gray-500 mt-2 mb-0 block">
                        Ingresa tus puntajes PAES en los campos a continuación
                    </span>
                </div>

                <!-- Comprensión Lectora (solo si rindió PAES) -->
                <div v-if="formData.rendioPAES" class="form-field">
                    <FloatLabel>
                        <InputNumber 
                            id="lenguaje" 
                            v-model="lenguajeValue" 
                            :min="150" 
                            :max="1000" 
                            :useGrouping="false"
                            class="form-input"
                            :class="{ 'p-invalid': formData.rendioPAES && (formData.paes?.lenguaje === null || formData.paes?.lenguaje === undefined) }"
                        />
                        <label for="lenguaje">Comprensión Lectora *</label>
                    </FloatLabel>
                </div>

                <!-- Matemática 1 (solo si rindió PAES) -->
                <div v-if="formData.rendioPAES" class="form-field">
                    <FloatLabel>
                        <InputNumber 
                            id="matematica" 
                            v-model="matematicaValue" 
                            :min="150" 
                            :max="1000" 
                            :useGrouping="false"
                            class="form-input"
                            :class="{ 'p-invalid': formData.rendioPAES && (formData.paes?.matematica === null || formData.paes?.matematica === undefined) }"
                        />
                        <label for="matematica">Matemática 1 *</label>
                    </FloatLabel>
                </div>

                <!-- Opciones de financiamiento -->
                <div class="form-field financing-options-field">
                    <h4 class="section-title">¿Qué tipo de financiamiento planeas utilizar?</h4>
                    <div class="options-grid">
                        <!-- CAE -->
                        <div class="option-card" :class="{ 'selected': formData.planeaUsarCAE }">
                            <label class="option-label">
                                <input
                                    v-model="formData.planeaUsarCAE"
                                    type="checkbox"
                                    @change="handleFinancingChange"
                                    class="option-checkbox"
                                />
                                <div class="option-content">
                                    <div class="option-icon">
                                        <TrendingUp class="w-6 h-6" />
                                    </div>
                                    <div class="option-text">
                                        <div class="flex items-center gap-2">
                                            <h5>CAE (Crédito con Aval del Estado)</h5>
                                            <span ref="caeIconRef" class="inline-flex">
                                                <Info 
                                                    class="w-4 h-4 text-gray-500 cursor-help hover:text-gray-700" 
                                                    @click.stop="showCAETooltip"
                                                    @mouseenter="showCAETooltip"
                                                    @mouseleave="hideCAETooltip"
                                                />
                                            </span>
                                        </div>
                                        <p>Crédito para financiar tu carrera universitaria</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <OverlayPanel ref="caeTooltipRef" class="custom-tooltip-panel">
                            <div class="custom-tooltip">
                                <h4 class="tooltip-title">Financiamiento</h4>
                                <p class="tooltip-description">Crédito del Estado para complementar de forma de pago del arancel</p>
                            </div>
                        </OverlayPanel>

                        <!-- Becas del Estado -->
                        <div class="option-card" :class="{ 'selected': formData.usaBecasEstado }">
                            <label class="option-label">
                                <input
                                    v-model="formData.usaBecasEstado"
                                    type="checkbox"
                                    @change="handleFinancingChange"
                                    class="option-checkbox"
                                />
                                <div class="option-content">
                                    <div class="option-icon">
                                        <CheckCircle class="w-6 h-6" />
                                    </div>
                                    <div class="option-text">
                                        <div class="flex items-center gap-2">
                                            <h5>Becas del Estado</h5>
                                            <span ref="becasIconRef" class="inline-flex">
                                                <Info 
                                                    class="w-4 h-4 text-gray-500 cursor-help hover:text-gray-700" 
                                                    @click.stop="showBecasTooltip"
                                                    @mouseenter="showBecasTooltip"
                                                    @mouseleave="hideBecasTooltip"
                                                />
                                            </span>
                                        </div>
                                        <p>Becas estatales como Beca Vocación de Profesor, etc.</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <OverlayPanel ref="becasTooltipRef" class="custom-tooltip-panel">
                            <div class="custom-tooltip">
                                <h4 class="tooltip-title">Beneficio</h4>
                                <p class="tooltip-description">Beca que cubre un monto que no debes pagar más adelante</p>
                            </div>
                        </OverlayPanel>
                    </div>
                </div>

                <!-- Select de Decil (solo si selecciona alguna opción de financiamiento) -->
                <div v-if="showDecilSelection" class="form-field">
                    <label for="decil" class="form-label decil-label">
                        Rango de Ingresos *
                        <i 
                            v-tooltip="'Toma el total de ingresos y dividelos por la cantidad de personas que viven en él'"
                            class="pi pi-question-circle decil-icon"
                        ></i>
                    </label>
                    <Dropdown
                        id="decil"
                        v-model="selectedDecilValue"
                        :options="decilesOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona rango"
                        class="form-input w-full"
                        :class="{ 'p-invalid': showDecilSelection && (formData.decil === null || formData.decil === undefined) }"
                        :loading="decilesLoading"
                    />
                    <small v-if="decilesError" class="p-error">{{ decilesError }}</small>
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
