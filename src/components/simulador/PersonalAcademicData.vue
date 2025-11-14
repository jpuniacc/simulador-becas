<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import FloatLabel from 'primevue/floatlabel'
import SelectButton from 'primevue/selectbutton'
import Button from 'primevue/button'
import Message from 'primevue/message'
import SchoolSelectionModal from '@/components/modals/SchoolSelectionModal.vue'
import type { FormData } from '@/types/simulador'
import type { Region, Comuna, Colegio } from '@/composables/useColegios'
import { School } from 'lucide-vue-next'
import { validateEmail, validateRUT } from '@/utils/validation'
import { formatRUT, cleanRUT } from '@/utils/formatters'

// Props
interface Props {
    formData?: Partial<FormData>
}

const props = withDefaults(defineProps<Props>(), {
    formData: () => ({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        nivelEducativo: '' as FormData['nivelEducativo'],
        regionResidencia: '',
        comunaResidencia: '',
        colegio: ''
    })
})

// Emits
const emit = defineEmits<{
    'update:form-data': [data: Partial<FormData>]
    'validation-change': [isValid: boolean]
}>()

// Opciones de nivel educativo
const opcionesNivelEducativo = [
    { label: '1° Medio', value: '1ro Medio' },
    { label: '2° Medio', value: '2do Medio' },
    { label: '3° Medio', value: '3ro Medio' },
    { label: '4° Medio', value: '4to Medio' },
    { label: 'Egresado', value: 'Egresado' }
]

// Estado del modal de selección de colegio
const isSchoolModalOpen = ref(false)
const selectedRegion = ref<Region | null>(null)
const selectedComuna = ref<Comuna | null>(null)
const selectedColegio = ref<Colegio | null>(null)

// Estado local del formulario
const formData = ref<Partial<FormData>>({
    nombre: props.formData?.nombre || '',
    apellido: props.formData?.apellido || '',
    email: props.formData?.email || '',
    telefono: props.formData?.telefono || '',
    identificacion: props.formData?.identificacion || '',
    tipoIdentificacion: props.formData?.tipoIdentificacion || 'rut',
    nivelEducativo: props.formData?.nivelEducativo || '',
    regionResidencia: props.formData?.regionResidencia || '',
    comunaResidencia: props.formData?.comunaResidencia || '',
    colegio: props.formData?.colegio || '',
    añoEgreso: props.formData?.añoEgreso || '',
    ranking: props.formData?.ranking || null,
    nem: props.formData?.nem || null
})

// Computed para verificar si es egresado
const isEgresado = computed(() => formData.value.nivelEducativo === 'Egresado')

// Computed para manejar valores null en año de egreso
const añoEgresoValue = computed({
    get: () => formData.value.añoEgreso ? Number(formData.value.añoEgreso) : null,
    set: (value: number | null) => {
        formData.value.añoEgreso = value ? value.toString() : ''
    }
})

// Computed para manejar valores null en ranking
const rankingValue = computed({
    get: () => formData.value.ranking ?? null,
    set: (value: number | null) => {
        formData.value.ranking = value
    }
})

// Computed para manejar valores null en NEM
const nemValue = computed({
    get: () => formData.value.nem ?? null,
    set: (value: number | null) => {
        formData.value.nem = value
    }
})

// Estado de errores de validación
const emailError = ref<string | null>(null)
const rutError = ref<string | null>(null)
const telefonoError = ref<string | null>(null)

// Estado para controlar cuándo mostrar errores
const submitted = ref(false)
const touched = ref({
    nombre: false,
    apellido: false,
    email: false,
    telefono: false,
    identificacion: false,
    nivelEducativo: false,
    colegio: false
})

// Validar email cuando cambie
watch(() => formData.value.email, (newEmail) => {
    touched.value.email = true
    if (newEmail && newEmail.trim() !== '') {
        if (!validateEmail(newEmail)) {
            emailError.value = 'Por favor ingresa un email válido'
        } else {
            emailError.value = null
        }
    } else {
        emailError.value = null
    }
})

// Manejar input de RUT con formateo automático
const handleRUTInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const clean = cleanRUT(target.value)
    if (clean.length >= 8) {
        const formatted = formatRUT(target.value)
        if (formatted !== formData.value.identificacion) {
            formData.value.identificacion = formatted
        }
    }
}

// Manejar keydown de teléfono: prevenir letras y caracteres no numéricos
const handlePhoneKeydown = (event: KeyboardEvent) => {
    // Permitir teclas de control (backspace, delete, tab, etc.)
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Tab' || 
        event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || 
        event.key === 'ArrowDown' || event.ctrlKey || event.metaKey) {
        return
    }
    // Solo permitir números
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault()
    }
}

// Manejar paste de teléfono: filtrar solo números
const handlePhonePaste = (event: ClipboardEvent) => {
    event.preventDefault()
    const paste = (event.clipboardData || (window as any).clipboardData).getData('text')
    const numbersOnly = paste.replace(/[^0-9]/g, '').slice(0, 8)
    if (numbersOnly) {
        formData.value.telefono = numbersOnly
    }
}

// Manejar input de teléfono: solo números y máximo 8 dígitos
const handlePhoneInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    // Remover todo lo que no sea número
    const numbersOnly = target.value.replace(/[^0-9]/g, '')
    // Limitar a 8 dígitos
    const limited = numbersOnly.slice(0, 8)
    if (limited !== formData.value.telefono) {
        formData.value.telefono = limited
    }
}

// Validar RUT cuando cambie
watch(() => formData.value.identificacion, (newRUT) => {
    touched.value.identificacion = true
    if (newRUT && newRUT.trim() !== '') {
        if (!validateRUT(newRUT)) {
            rutError.value = 'Por favor ingresa un RUT válido'
        } else {
            rutError.value = null
        }
    } else {
        rutError.value = null
    }
})

// Validar teléfono cuando cambie
watch(() => formData.value.telefono, (newPhone) => {
    touched.value.telefono = true
    if (newPhone && newPhone.trim() !== '') {
        // Validar que tenga exactamente 8 dígitos
        const phoneNumbers = newPhone.replace(/[^0-9]/g, '')
        if (phoneNumbers.length !== 8) {
            telefonoError.value = 'El teléfono debe tener 8 dígitos'
        } else {
            telefonoError.value = null
        }
    } else {
        telefonoError.value = null
    }
})

// Computed para verificar si el formulario es válido
const isFormValid = computed(() => {
    const hasRequiredFields = 
        formData.value.nombre?.trim() !== '' &&
        formData.value.apellido?.trim() !== '' &&
        formData.value.email?.trim() !== '' &&
        formData.value.telefono?.trim() !== '' &&
        formData.value.identificacion?.trim() !== '' &&
        formData.value.nivelEducativo !== '' &&
        formData.value.colegio?.trim() !== ''
    
    const isEmailValid = formData.value.email ? validateEmail(formData.value.email) : false
    const isRUTValid = formData.value.identificacion ? validateRUT(formData.value.identificacion) : false
    const isPhoneValid = formData.value.telefono ? formData.value.telefono.replace(/[^0-9]/g, '').length === 8 : false
    
    return hasRequiredFields && isEmailValid && isRUTValid && isPhoneValid && !emailError.value && !rutError.value && !telefonoError.value
})

// Emitir cambios de validación
watch(isFormValid, (newValue) => {
    emit('validation-change', newValue)
}, { immediate: true })

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
    emailError,
    markAsSubmitted
})

// Métodos del modal
const openSchoolModal = () => {
    isSchoolModalOpen.value = true
}

const handleSchoolSelectionComplete = (region: Region, comuna: Comuna, colegio: Colegio) => {
    selectedRegion.value = region
    selectedComuna.value = comuna
    selectedColegio.value = colegio

    // Actualizar formData con la información del colegio
    formData.value.colegio = colegio.nombre
    formData.value.regionResidencia = colegio.region_nombre || region.region_nombre
    formData.value.comunaResidencia = colegio.comuna_nombre || comuna.comuna_nombre
    touched.value.colegio = true

    isSchoolModalOpen.value = false
}

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
        // Verificar si hay cambios reales antes de actualizar
        const hasChanges = 
            formData.value.nombre !== (newData.nombre || '') ||
            formData.value.apellido !== (newData.apellido || '') ||
            formData.value.email !== (newData.email || '') ||
            formData.value.telefono !== (newData.telefono || '') ||
            formData.value.identificacion !== (newData.identificacion || '') ||
            formData.value.tipoIdentificacion !== (newData.tipoIdentificacion || 'rut') ||
            formData.value.nivelEducativo !== (newData.nivelEducativo || '') ||
            formData.value.regionResidencia !== (newData.regionResidencia || '') ||
            formData.value.comunaResidencia !== (newData.comunaResidencia || '') ||
            formData.value.colegio !== (newData.colegio || '') ||
            formData.value.añoEgreso !== (newData.añoEgreso || '') ||
            formData.value.ranking !== (newData.ranking || null) ||
            formData.value.nem !== (newData.nem || null)

        if (hasChanges) {
            isUpdatingFromProps.value = true
            formData.value = {
                nombre: newData.nombre || '',
                apellido: newData.apellido || '',
                email: newData.email || '',
                telefono: newData.telefono || '',
                identificacion: newData.identificacion || '',
                tipoIdentificacion: newData.tipoIdentificacion || 'rut',
                nivelEducativo: newData.nivelEducativo || '',
                regionResidencia: newData.regionResidencia || '',
                comunaResidencia: newData.comunaResidencia || '',
                colegio: newData.colegio || '',
                añoEgreso: newData.añoEgreso || '',
                ranking: newData.ranking || null,
                nem: newData.nem || null
            }
            // Resetear el flag después de un pequeño delay
            setTimeout(() => {
                isUpdatingFromProps.value = false
            }, 0)
        }
    }
}, { deep: true })

// Watcher para limpiar campos de egresado si cambia el nivel educativo
watch(() => formData.value.nivelEducativo, (newNivel) => {
    if (newNivel !== 'Egresado') {
        formData.value.añoEgreso = ''
        formData.value.ranking = null
        formData.value.nem = null
    }
})
</script>

<template>
    <div class="step1-container">
        <div class="form-guide">
            <p class="guide-text">Cuéntanos un poco sobre ti y tus estudios</p>
        </div>
        <form class="personal-form" @submit.prevent>
            <div class="form-grid">
                <!-- Campo Nombre -->
                <div class="form-field">
                    <div class="flex flex-col gap-1">
                        <FloatLabel>
                            <InputText 
                                id="nombre" 
                                v-model="formData.nombre" 
                                class="form-input"
                                :invalid="(submitted || touched.nombre) && (!formData.nombre || formData.nombre.trim() === '')"
                                @blur="touched.nombre = true"
                            />
                            <label for="nombre">Nombre *</label>
                        </FloatLabel>
                        <Message 
                            v-if="(submitted || touched.nombre) && (!formData.nombre || formData.nombre.trim() === '')" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            Nombre es requerido
                        </Message>
                    </div>
                </div>

                <!-- Campo Apellido -->
                <div class="form-field">
                    <div class="flex flex-col gap-1">
                        <FloatLabel>
                            <InputText 
                                id="apellido" 
                                v-model="formData.apellido" 
                                class="form-input"
                                :invalid="(submitted || touched.apellido) && (!formData.apellido || formData.apellido.trim() === '')"
                                @blur="touched.apellido = true"
                            />
                            <label for="apellido">Apellido *</label>
                        </FloatLabel>
                        <Message 
                            v-if="(submitted || touched.apellido) && (!formData.apellido || formData.apellido.trim() === '')" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            Apellido es requerido
                        </Message>
                    </div>
                </div>

                <!-- Campo Email -->
                <div class="form-field">
                    <div class="flex flex-col gap-1">
                        <FloatLabel>
                            <InputText 
                                id="email" 
                                v-model="formData.email" 
                                type="email" 
                                class="form-input"
                                :invalid="(submitted || touched.email) && (emailError !== null || (formData.email && !validateEmail(formData.email)))"
                                @blur="touched.email = true"
                            />
                            <label for="email">Email *</label>
                        </FloatLabel>
                        <Message 
                            v-if="(submitted || touched.email) && (emailError || (formData.email && !validateEmail(formData.email)))" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            {{ emailError || 'Email no es válido' }}
                        </Message>
                    </div>
                </div>

                <!-- Campo Teléfono -->
                <div class="form-field">
                    <div class="flex flex-col gap-1">
                        <InputGroup class="form-input-group">
                            <InputGroupAddon>+569</InputGroupAddon>
                            <FloatLabel>
                                <InputText 
                                    id="telefono" 
                                    v-model="formData.telefono" 
                                    type="tel" 
                                    class="form-input"
                                    maxlength="8"
                                    :invalid="(submitted || touched.telefono) && (telefonoError !== null || (formData.telefono && formData.telefono.replace(/[^0-9]/g, '').length !== 8))"
                                    @keydown="handlePhoneKeydown"
                                    @paste="handlePhonePaste"
                                    @input="handlePhoneInput"
                                    @blur="touched.telefono = true"
                                />
                                <label for="telefono">Teléfono *</label>
                            </FloatLabel>
                        </InputGroup>
                        <Message 
                            v-if="(submitted || touched.telefono) && (telefonoError || (formData.telefono && formData.telefono.replace(/[^0-9]/g, '').length !== 8))" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            {{ telefonoError || 'El teléfono debe tener 8 dígitos' }}
                        </Message>
                    </div>
                </div>

                <!-- Campo RUT -->
                <div class="form-field">
                    <div class="flex flex-col gap-1">
                        <FloatLabel>
                            <InputText 
                                id="identificacion" 
                                v-model="formData.identificacion" 
                                type="text"
                                placeholder="12.345.678-9"
                                class="form-input"
                                :invalid="(submitted || touched.identificacion) && (rutError !== null || (formData.identificacion && !validateRUT(formData.identificacion)))"
                                @input="handleRUTInput"
                                @blur="touched.identificacion = true"
                            />
                            <label for="identificacion">RUT *</label>
                        </FloatLabel>
                        <Message 
                            v-if="(submitted || touched.identificacion) && (rutError || (formData.identificacion && !validateRUT(formData.identificacion)))" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            {{ rutError || 'RUT no es válido' }}
                        </Message>
                        <small v-if="!rutError && (!formData.identificacion || validateRUT(formData.identificacion))" class="text-gray-500 text-xs">Puedes utilizar un RUT provisorio</small>
                    </div>
                </div>

                <!-- Campo Nivel Educativo -->
                <div class="form-field nivel-educativo-field">
                    <div class="flex flex-col gap-1">
                        <label for="nivelEducativo" class="nivel-educativo-label">
                            Nivel Educativo *
                            <i 
                                v-tooltip="'Que año de enseñanza media cursas, si eres egresado te pediremos datos adicionales'"
                                class="pi pi-question-circle nivel-educativo-icon"
                            ></i>
                        </label>
                        <SelectButton 
                            id="nivelEducativo" 
                            v-model="formData.nivelEducativo"
                            :options="opcionesNivelEducativo" 
                            optionLabel="label" 
                            optionValue="value"
                            class="nivel-educativo-select"
                            @change="touched.nivelEducativo = true"
                        />
                        <Message 
                            v-if="(submitted || touched.nivelEducativo) && !formData.nivelEducativo" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            Nivel educativo es requerido
                        </Message>
                    </div>
                </div>

                <!-- Año de Egreso (solo para egresados) -->
                <div v-if="isEgresado" class="form-field">
                    <FloatLabel>
                        <InputNumber id="añoEgreso" v-model="añoEgresoValue" :min="2000" :max="2025"
                            :useGrouping="false" class="form-input" />
                        <label for="añoEgreso">Año de Egreso (Opcional)</label>
                    </FloatLabel>
                </div>

                <!-- Ranking de Notas (solo para egresados) -->
                <div v-if="isEgresado" class="form-field">
                    <FloatLabel>
                        <InputNumber id="ranking" v-model="rankingValue" :min="0" :max="1000" :useGrouping="false"
                            class="form-input" />
                        <label for="ranking">Ranking de Notas (Opcional)</label>
                    </FloatLabel>
                </div>

                <!-- NEM (solo para egresados) -->
                <div v-if="isEgresado" class="form-field">
                    <FloatLabel>
                        <InputNumber id="nem" v-model="nemValue" :min="1.0" :max="7.0" :step="0.1" :minFractionDigits="1" :maxFractionDigits="1"
                            :useGrouping="false" class="form-input" />
                        <label for="nem">NEM (Opcional)</label>
                    </FloatLabel>
                </div>

                <!-- Campo Selección de Colegio -->
                <div class="form-field colegio-field">
                    <div class="flex flex-col gap-1">
                        <label for="colegio" class="colegio-label">
                            Colegio *
                        </label>
                        <div class="colegio-selection-container">
                            <Button v-if="!formData.colegio" label="Seleccionar Colegio" icon="pi pi-map-marker"
                                @click="openSchoolModal" class="colegio-button" outlined />
                            <div v-else class="colegio-selected">
                                <div class="colegio-info">
                                    <School class="colegio-icon" />
                                    <div class="colegio-details">
                                        <div class="colegio-nombre">{{ formData.colegio }}</div>
                                        <div class="colegio-location">
                                            {{ formData.comunaResidencia }}{{ formData.regionResidencia ? `,
                                            ${formData.regionResidencia}` : '' }}
                                        </div>
                                    </div>
                                </div>
                                <Button label="Cambiar" icon="pi pi-pencil" @click="openSchoolModal"
                                    class="colegio-change-button colegio-completed" severity="success" text />
                            </div>
                        </div>
                        <Message 
                            v-if="(submitted || touched.colegio) && (!formData.colegio || formData.colegio.trim() === '')" 
                            severity="error" 
                            variant="simple" 
                            size="small"
                        >
                            Colegio es requerido
                        </Message>
                    </div>
                </div>
            </div>
        </form>

        <!-- Modal de Selección de Colegio -->
        <SchoolSelectionModal v-model:isOpen="isSchoolModalOpen" :selected-region="selectedRegion"
            :selected-comuna="selectedComuna" :selected-colegio="selectedColegio"
            @complete="handleSchoolSelectionComplete" />
    </div>
</template>

<style scoped>
@import '@/assets/form-styles.css';

.step1-container {
    @apply form-container;
}

/* Estilos para SelectButton de nivel educativo */
.nivel-educativo-field {
    @apply col-span-1 md:col-span-2;
}

.nivel-educativo-label {
    @apply block text-sm font-medium text-gray-700 mb-3;
    @apply flex items-center gap-2;
}

.nivel-educativo-icon {
    @apply text-gray-500 cursor-help;
    font-size: 1rem;
    width: 1rem;
    height: 1rem;
    display: inline-block;
    line-height: 1;
    transition: color 0.2s;
}

.nivel-educativo-icon:hover {
    @apply text-gray-700;
}

:deep(.nivel-educativo-select) {
    @apply w-full;
}

:deep(.nivel-educativo-select .p-button.p-highlight) {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
}

:deep(.nivel-educativo-select .p-button.p-highlight:hover) {
    background-color: #059669 !important;
    border-color: #059669 !important;
}

/* Estilos para selección de colegio */
.colegio-field {
    @apply col-span-1 md:col-span-2;
}

.colegio-label {
    @apply block text-sm font-medium text-gray-700 mb-3;
}

.colegio-selection-container {
    @apply w-full;
}

:deep(.colegio-button) {
    @apply w-full justify-start;
}

.colegio-selected {
    @apply flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg bg-gray-50;
}

.colegio-info {
    @apply flex items-center justify-center space-x-3 flex-1;
}

.colegio-icon {
    @apply w-5 h-5 text-gray-600 flex-shrink-0;
}

.colegio-details {
    @apply flex-1 min-w-0 text-center;
}

.colegio-nombre {
    @apply font-medium text-gray-900 truncate;
}

.colegio-location {
    @apply text-sm text-gray-600 mt-1;
}

:deep(.colegio-change-button) {
    @apply ml-4;
}

:deep(.colegio-completed .p-button) {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: white !important;
}

:deep(.colegio-completed .p-button:hover) {
    background-color: #059669 !important;
    border-color: #059669 !important;
}


/* Sobrescribir colores del SelectButton */
.p-togglebutton-content {
  background-color: red !important;
  color: white;
}


.p-selectbutton .p-button.p-highlight {
  background-color: red !important;
  border-color: blue !important;
}



/* Responsive */
@media (max-width: 768px) {
    .nivel-educativo-field {
        @apply col-span-1;
    }

    .colegio-field {
        @apply col-span-1;
    }

    :deep(.nivel-educativo-select .p-selectbutton) {
        @apply flex-col;
    }

    .colegio-selected {
        @apply flex-col items-center space-y-3;
    }

    .colegio-info {
        @apply justify-center;
    }

    .colegio-details {
        @apply text-center;
    }

    :deep(.colegio-change-button) {
        @apply ml-0 w-full;
    }
}
</style>