<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Autocomplete from 'primevue/autocomplete'
import InputNumber from 'primevue/inputnumber'
import FloatLabel from 'primevue/floatlabel'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import OverlayPanel from 'primevue/overlaypanel'
import Message from 'primevue/message'
import { GraduationCap, TrendingUp, CheckCircle } from 'lucide-vue-next'
import { useCarreras, type Carrera } from '@/composables/useCarreras'
import { useDeciles } from '@/composables/useDeciles'
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

// Estado para el autocomplete de carreras
const carreraSeleccionada = ref<Carrera | null>(null)
const carrerasSugeridas = ['Danza', 'Psicología', 'Ingeniería Comercial']
const filteredCarreras = ref<Carrera[]>([])
const financingTooltipRef = ref<InstanceType<typeof OverlayPanel> | null>(null)
const financingIconRef = ref<HTMLElement | null>(null)
const decilTooltipRef = ref<InstanceType<typeof OverlayPanel> | null>(null)
const decilIconRef = ref<HTMLElement | null>(null)

// Detectar si es un dispositivo móvil
const isMobile = ref(false)

const handleMobileResize = () => {
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isSmallScreen = window.innerWidth <= 768
    isMobile.value = hasTouchSupport && isSmallScreen
}

// Estado para controlar cuándo mostrar errores
const submitted = ref(false)
const touched = ref({
    carrera: false,
    paesLenguaje: false,
    paesMatematica: false,
    financiamiento: false,
    decil: false
})

// Computed para verificar si es egresado o tiene educación media completa
const isEgresadoOr4to = computed(() => {
    const nivel = props.formData?.nivelEducativo
    return nivel === 'Educación media completa' ||
           nivel === 'Educación superior incompleta' ||
           nivel === 'Educación superior completa'
})

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

// JPS: Computed para verificar si es extranjero y reside fuera del país
// Modificación: Detectar cuando el usuario es extranjero Y reside fuera del país
// Funcionamiento: Si ambas condiciones se cumplen, solo se deben mostrar carreras online
// Esto es necesario porque los extranjeros fuera del país solo pueden acceder a programas online
const esExtranjeroFueraPais = computed(() => {
    return props.formData?.extranjero === true && props.formData?.residencia_chilena === false
})

// JPS: Función para filtrar carreras según modalidad cuando es extranjero fuera del país
// Modificación: Aplicar filtro de modalidad "Online" cuando esExtranjeroFueraPais es true
// Funcionamiento:
// - Si es extranjero fuera del país: filtra solo carreras con modalidad_programa === "Online"
// - Si no es extranjero fuera del país: retorna todas las carreras sin filtrar
// La comparación se hace en minúsculas y sin espacios para evitar problemas de formato
const aplicarFiltroModalidad = (carreras: Carrera[]): Carrera[] => {
    if (esExtranjeroFueraPais.value) {
        // Solo mostrar carreras online
        return carreras.filter(carrera => {
            const modalidad = carrera.modalidad_programa?.toLowerCase().trim()
            return modalidad === 'online'
        })
    }
    // Si no es extranjero fuera del país, mostrar todas las carreras
    return carreras
}

// JPS: Función para buscar carreras (usada por Autocomplete) - Modificada para aplicar filtro de modalidad
// Modificación: Aplicar filtro de modalidad después de buscar carreras
// Funcionamiento: Primero busca las carreras según el término de búsqueda, luego aplica el filtro
// de modalidad si es extranjero fuera del país
const searchCarreras = (event: { query: string }) => {
    let carreras: Carrera[] = []

    if (!event.query || !event.query.trim()) {
        carreras = carrerasVigentes.value
    } else {
        carreras = buscarCarreras(event.query)
    }

    // Aplicar filtro de modalidad si es extranjero fuera del país
    filteredCarreras.value = aplicarFiltroModalidad(carreras)
}

// JPS: Función para manejar el focus del Autocomplete - Modificada para aplicar filtro de modalidad
// Modificación: Aplicar filtro de modalidad al inicializar las carreras filtradas
// Funcionamiento: Cuando el usuario hace focus en el autocomplete, se cargan todas las carreras
// pero se aplica el filtro de modalidad si corresponde
const handleAutocompleteFocus = () => {
    touched.value.carrera = true
    if (filteredCarreras.value.length === 0) {
        // Aplicar filtro de modalidad al inicializar
        filteredCarreras.value = aplicarFiltroModalidad(carrerasVigentes.value)
    }
}

// Computed para verificar si es egresado (completó educación media)
const isEgresado = computed(() => {
    const nivel = props.formData?.nivelEducativo
    return nivel === 'Educación media completa' ||
           nivel === 'Educación superior incompleta' ||
           nivel === 'Educación superior completa'
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
    touched.value.carrera = true
}

// JPS: Función para seleccionar carrera sugerida - Modificada para respetar filtro de modalidad
// Modificación: Verificar que la carrera encontrada cumpla con el filtro de modalidad
// Funcionamiento: Busca la carrera pero solo la selecciona si es válida según el filtro
const seleccionarCarreraSugerida = (nombre: string) => {
    // Buscar la carrera en la lista de carreras vigentes
    const carreraEncontrada = carrerasVigentes.value.find(
        c => c.nombre_programa.toLowerCase().includes(nombre.toLowerCase())
    )
    if (carreraEncontrada) {
        // Verificar que la carrera sea válida según el filtro de modalidad
        const carrerasFiltradas = aplicarFiltroModalidad([carreraEncontrada])
        if (carrerasFiltradas.length > 0) {
            selectCarrera(carreraEncontrada)
        }
    }
}

const showFinancingTooltip = (event: MouseEvent) => {
    // Ignorar en móvil, solo usar click
    if (isMobile.value) return
    if (financingIconRef.value && financingTooltipRef.value) {
        financingTooltipRef.value.toggle(event, financingIconRef.value)
    }
}

const hideFinancingTooltip = () => {
    // Ignorar en móvil, solo usar click
    if (isMobile.value) return
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
    // Ignorar en móvil, solo usar click
    if (isMobile.value) return
    if (decilIconRef.value && decilTooltipRef.value) {
        decilTooltipRef.value.toggle(event, decilIconRef.value)
    }
}

const hideDecilTooltip = () => {
    // Ignorar en móvil, solo usar click
    if (isMobile.value) return
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

// JPS: Watcher para actualizar el filtro cuando cambien extranjero o residencia_chilena
// Modificación: Agregar watcher que reacciona a cambios en extranjero y residencia_chilena
// Funcionamiento:
// - Si el usuario se marca como extranjero fuera del país y tiene una carrera seleccionada que NO es online,
//   se limpia la selección automáticamente
// - Se re-aplica el filtro de modalidad a las carreras disponibles
// - Esto asegura que el usuario solo pueda seleccionar carreras online cuando corresponde
watch(() => [props.formData?.extranjero, props.formData?.residencia_chilena], () => {
    // Si hay una carrera seleccionada que no es online y ahora debe filtrarse, limpiar la selección
    if (esExtranjeroFueraPais.value && carreraSeleccionada.value) {
        const modalidad = carreraSeleccionada.value.modalidad_programa?.toLowerCase().trim()
        if (modalidad !== 'online') {
            // Limpiar la selección si la carrera actual no es online
            carreraSeleccionada.value = null
            formData.value.carrera = ''
            formData.value.carreraId = 0
            touched.value.carrera = false
        }
    }

    // Re-aplicar el filtro a las carreras disponibles
    if (filteredCarreras.value.length > 0 || carrerasVigentes.value.length > 0) {
        filteredCarreras.value = aplicarFiltroModalidad(carrerasVigentes.value)
    }
}, { deep: true })

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
            // Actualizar carrera seleccionada si hay un carreraId válido
            if (newData.carreraId && newData.carreraId > 0) {
                const carrera = carrerasVigentes.value.find(c => c.id === newData.carreraId)
                if (carrera) {
                    carreraSeleccionada.value = carrera
                } else {
                    carreraSeleccionada.value = null
                }
            } else {
                carreraSeleccionada.value = null
            }
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
    // JPS: Inicializar las carreras filtradas aplicando el filtro de modalidad
    // Modificación: Aplicar filtro de modalidad desde el inicio si es extranjero fuera del país
    // Funcionamiento: Al montar el componente, se aplica el filtro de modalidad para que solo
    // se muestren carreras online si corresponde
    filteredCarreras.value = aplicarFiltroModalidad(carrerasVigentes.value)
    // Detectar si es móvil basándose en touch support y tamaño de pantalla
    handleMobileResize()
    window.addEventListener('resize', handleMobileResize)

    // Si hay una carrera en las props, buscar y seleccionar
    if (props.formData?.carreraId && props.formData.carreraId > 0) {
        const carrera = carrerasVigentes.value.find(c => c.id === props.formData.carreraId)
        if (carrera) {
            // JPS: Verificar que la carrera seleccionada sea válida según el filtro de modalidad
            // Si es extranjero fuera del país y la carrera no es online, no seleccionarla
            if (esExtranjeroFueraPais.value) {
                const modalidad = carrera.modalidad_programa?.toLowerCase().trim()
                if (modalidad === 'online') {
                    carreraSeleccionada.value = carrera
                }
            } else {
                carreraSeleccionada.value = carrera
            }
        }
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleMobileResize)
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

                        <!-- Autocomplete de carreras -->
                        <div class="form-field">
                            <Autocomplete
                                id="carrera"
                                v-model="carreraSeleccionada"
                                :suggestions="filteredCarreras"
                                @complete="searchCarreras"
                                optionLabel="nombre_programa"
                                placeholder="Busca tu carrera..."
                                class="w-full carrera-autocomplete"
                                :class="{ 'p-invalid': (submitted || touched.carrera) && (!formData.carrera || formData.carreraId === 0) }"
                                :loading="carrerasLoading"
                                @focus="handleAutocompleteFocus"
                                @blur="touched.carrera = true"
                                @item-select="(event) => selectCarrera(event.value)"
                                :dropdown="true"
                                forceSelection
                                autocomplete="off"
                            >
                                <template #option="slotProps">
                                    <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                                        <div class="font-medium text-gray-900">{{ slotProps.option.nombre_programa }}</div>
                                        <div class="text-sm text-gray-500">{{ slotProps.option.nivel_academico }} - {{ slotProps.option.modalidad_programa }}</div>
                                        <div class="text-xs text-blue-600 mt-1">{{ slotProps.option.duracion_programa }}</div>
                                    </div>
                                </template>
                            </Autocomplete>
                            <p class="text-sm text-gray-500 mt-1">
                                Busca por nombre de carrera, facultad o área
                            </p>
                            <!-- JPS: Mensaje informativo cuando es extranjero fuera del país -->
                            <!-- Modificación: Mostrar mensaje indicando que solo se muestran carreras online -->
                            <!-- Funcionamiento: Se muestra solo cuando esExtranjeroFueraPais es true -->
                            <Message
                                v-if="esExtranjeroFueraPais"
                                severity="info"
                                variant="simple"
                                size="small"
                                class="mt-2"
                            >
                                Como extranjero que resides fuera del país, solo puedes acceder a carreras en modalidad online.
                            </Message>
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
                        <i
                            ref="financingIconRef"
                            class="pi pi-info-circle financing-icon ml-2"
                            @click.stop="toggleFinancingTooltip"
                            @mouseenter="!isMobile && showFinancingTooltip($event)"
                            @mouseleave="!isMobile && hideFinancingTooltip()"
                        ></i>
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
                            @mouseenter="!isMobile && showDecilTooltip($event)"
                            @mouseleave="!isMobile && hideDecilTooltip()"
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
                            <p>Toma el total de ingresos de tu hogar y divídelos por la cantidad de personas que viven en él</p>
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

.financing-icon {
    @apply text-gray-500 cursor-help;
    font-size: 0.875rem;
    width: 0.875rem;
    height: 0.875rem;
    display: inline-block;
    line-height: 1;
    transition: color 0.2s;
}

.financing-icon:hover {
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

/* Estilos para el Autocomplete de carreras */
:deep(.carrera-autocomplete) {
    width: 100%;
}

:deep(.carrera-autocomplete .p-autocomplete-input) {
    @apply w-full;
}

:deep(.carrera-autocomplete .p-autocomplete-panel) {
    @apply border border-gray-200 rounded-lg shadow-lg;
    max-height: 15rem;
}

:deep(.carrera-autocomplete .p-autocomplete-items) {
    padding: 0;
}
</style>
