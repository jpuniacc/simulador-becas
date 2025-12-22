<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import OverlayPanel from 'primevue/overlaypanel'
import Drawer from 'primevue/drawer'
import Slider from 'primevue/slider'
import Select from 'primevue/select'
import { useSimuladorStore } from '@/stores/simuladorStore'
import { useDescuentosStore } from '@/stores/descuentosStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { FormData } from '@/types/simulador'
import { useProspectos } from '@/composables/useProspectos'
import { ANIO_POSTULACION } from '@/utils/config'
import { Award, CheckCircle, FileText, Info } from 'lucide-vue-next'
import html2pdf from 'html2pdf.js'
import Button from 'primevue/button'

// Props
interface Props {
    formData?: Partial<FormData>
}

const props = defineProps<Props>()

// Store y servicios
const simuladorStore = useSimuladorStore()
const descuentosStore = useDescuentosStore()
const { insertarProspecto, error: prospectoError } = useProspectos()

// Estado
const isLoading = ref(false)
const error = ref<string | null>(null)
const pdfContentRef = ref<HTMLElement | null>(null)
const isGeneratingPDF = ref(false)
const windowWidth = ref(window.innerWidth)
const overlayPanel = ref<InstanceType<typeof OverlayPanel> | null>(null)
const selectedBeca = ref<any>(null)
let hideTimeout: ReturnType<typeof setTimeout> | null = null
const showCaeDialog = ref(false)
const descuentosInfoPanel = ref<InstanceType<typeof OverlayPanel> | null>(null)
const descuentosInfoIconRef = ref<HTMLElement | null>(null)
let descuentosHideTimeout: ReturnType<typeof setTimeout> | null = null
const numeroCuotas = ref(10)
const tipoPago = ref<string | null>(null)

// Opciones para el tipo de pago
const opcionesTipoPago = [
    { label: 'Seleccione', value: null },
    { label: 'Cheque', value: 'cheque' },
    { label: 'Al contado', value: 'contado' },
    { label: 'Pagaré', value: 'pagare' }
]

// Computed para determinar si el slider debe estar deshabilitado
const isSliderDisabled = computed(() => {
    return tipoPago.value === 'contado'
})

// Watcher para cambiar el número de cuotas cuando se selecciona "Al contado"
watch(tipoPago, (newValue) => {
    if (newValue === 'contado') {
        numeroCuotas.value = 1
    }
})

// Detectar si es un dispositivo móvil
const isMobile = ref(false)

// Computed para colspan responsive
// En desktop: Concepto + Tipo + Descuento = 3 columnas
// En mobile: Concepto + Tipo/Descuento = 2 columnas
const subtotalColspan = computed(() => {
    return windowWidth.value <= 1024 ? 2 : 3
})

// Actualizar ancho de ventana
const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth
}

const handleMobileResize = () => {
    const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isSmallScreen = window.innerWidth <= 768
    isMobile.value = hasTouchSupport && isSmallScreen
}

onMounted(() => {
    console.log('Results mounted - becas aplicadas:', becasAplicadas.value);
    window.addEventListener('resize', updateWindowWidth)
    updateWindowWidth()
    // Cargar descuentos de pago anticipado y modo de pago
    descuentosStore.cargarDescuentosPagoAnticipado()
    descuentosStore.cargarDescuentosModoPago()

    // Detectar si es móvil basándose en touch support y tamaño de pantalla
    handleMobileResize()
    window.addEventListener('resize', handleMobileResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth)
    window.removeEventListener('resize', handleMobileResize)
})

// Computed
const calculoBecas = computed(() => simuladorStore.calculoBecas)
const formData = computed(() => simuladorStore.formData)

// Computed para información de la carrera
const carreraInfo = computed(() => {
    if (!formData.value.carrera) return null
    return simuladorStore.carrerasStore.obtenerCarreraPorNombre(formData.value.carrera)
})

// Computed para becas aplicadas (internas)
const becasAplicadas = computed(() => {
    return calculoBecas.value?.becas_aplicadas || []
})

// Computed para arancel después de becas internas
// Calculado explícitamente: arancel base - descuento de becas internas solamente
const arancelDespuesBecasInternas = computed(() => {
    if (!calculoBecas.value) return 0
    return calculoBecas.value.arancel_base - calculoBecas.value.descuento_total
})

// Computed para descuento del CAE (el monto máximo que financia el CAE)
const descuentoCae = computed(() => {
    if (!formData.value?.planeaUsarCAE || !maximoFinanciamientoCae.value) {
        return 0
    }
    // El descuento del CAE es el máximo financiamiento CAE (el monto que financia el CAE)
    // Este monto se resta del arancel después de becas internas
    return maximoFinanciamientoCae.value
})

// Computed para descuento total (becas internas + descuento CAE si aplica)
const descuentoTotalRealConCae = computed(() => {
    if (!calculoBecas.value) return 0
    // Incluye descuentos de becas internas + descuento del CAE
    console.log('DESUENTOS - CAE', descuentoCae.value)
    console.log('DESUENTOS - TOTAL', calculoBecas.value.descuento_total)
    return calculoBecas.value.descuento_total + descuentoCae.value
})

// Computed para arancel final (aplica CAE si corresponde)
const arancelFinalReal = computed(() => {
    // Si planea usar CAE y hay máximo financiamiento CAE, restar ese valor del arancel después de becas
    if (formData.value?.planeaUsarCAE && maximoFinanciamientoCae.value) {
        // El arancel final es el arancel después de becas menos el máximo financiamiento CAE
        // Mínimo 0 (si el máximo CAE es mayor al arancel después de becas, el arancel final es 0)
        return Math.max(0, arancelDespuesBecasInternas.value - maximoFinanciamientoCae.value)
    }
    // Si no usa CAE, retornar el arancel después de becas internas
    return arancelDespuesBecasInternas.value
})

// Computed para descuentos de modo de pago que coinciden con el tipo seleccionado
const descuentoModoPagoAplicable = computed(() => {
    if (!tipoPago.value) return null
    // Mapear los valores del select a posibles nombres en los descuentos
    const tipoPagoMap: Record<string, string[]> = {
        'cheque': ['cheque'],
        'contado': ['contado', 'al contado', 'efectivo'],
        'pagare': ['pagaré', 'pagare', 'pagar']
    }
    const posiblesNombres = tipoPagoMap[tipoPago.value] || [tipoPago.value]

    return descuentosModoPagoActivos.value.find(descuento => {
        const nombreDescuento = descuento.nombre?.toLowerCase() || ''
        return posiblesNombres.some(nombre => nombreDescuento.includes(nombre.toLowerCase()))
    }) || null
})

// Computed para calcular descuento de pago anticipado sobre arancel y matrícula
const descuentoPagoAnticipadoArancel = computed(() => {
    if (!descuentoPagoAnticipadoVigente.value?.dscto_arancel) return 0
    return Math.round(arancelFinalReal.value * (descuentoPagoAnticipadoVigente.value.dscto_arancel / 100))
})

const descuentoPagoAnticipadoMatricula = computed(() => {
    if (!descuentoPagoAnticipadoVigente.value?.dscto_matricula) return 0
    const matricula = carreraInfo.value?.matricula || 0
    return Math.round(matricula * (descuentoPagoAnticipadoVigente.value.dscto_matricula / 100))
})

// Computed para calcular descuento de modo de pago sobre arancel
const descuentoModoPagoArancel = computed(() => {
    if (!descuentoModoPagoAplicable.value?.dscto_arancel) return 0
    return Math.round(arancelFinalReal.value * (descuentoModoPagoAplicable.value.dscto_arancel / 100))
})

// Computed para arancel final después de descuentos adicionales
const arancelFinalConDescuentosAdicionales = computed(() => {
    let arancel = arancelFinalReal.value
    // Aplicar descuento de pago anticipado si existe
    arancel -= descuentoPagoAnticipadoArancel.value
    // Aplicar descuento de modo de pago si existe
    arancel -= descuentoModoPagoArancel.value
    return Math.max(0, arancel)
})

// Computed para matrícula final después de descuentos adicionales
const matriculaFinalConDescuentosAdicionales = computed(() => {
    const matricula = carreraInfo.value?.matricula || 0
    return Math.max(0, matricula - descuentoPagoAnticipadoMatricula.value)
})

// Computed para arancel final + matrícula después de todos los descuentos
const arancelMasMatricula = computed(() => {
    return arancelFinalConDescuentosAdicionales.value + matriculaFinalConDescuentosAdicionales.value
})

// Computed para el valor mensual (dividido por numeroCuotas)
const valorMensual = computed(() => {
    return Math.round(arancelMasMatricula.value / numeroCuotas.value)
})

// Porcentaje total de descuento aplicado sobre el arancel base
const descuentoPorcentualTotal = computed(() => {
    if (!calculoBecas.value) return 0
    const base = calculoBecas.value.arancel_base
    if (!base || base <= 0) return 0
    return Math.round((descuentoTotalRealConCae.value / base) * 100)
})

// Computed para obtener el arancel referencia CAE
const arancelReferenciaCae = computed(() => {
    return carreraInfo.value?.arancel_referencia || null
})

// Computed para calcular el máximo financiamiento CAE aplicable
// El CAE financia sobre el arancel después de becas internas, pero no puede exceder el arancel_referencia
const maximoFinanciamientoCae = computed(() => {
    if (!arancelReferenciaCae.value || arancelReferenciaCae.value <= 0) return null
    // El máximo financiamiento es el menor entre el arancel_referencia y el arancel después de becas internas
    return Math.min(arancelReferenciaCae.value, arancelDespuesBecasInternas.value)
})

// Computed para descuento de pago anticipado vigente
const descuentoPagoAnticipadoVigente = computed(() => {
    return descuentosStore.obtenerDescuentoPagoAnticipadoVigente()
})

// Computed para descuentos de modo de pago activos
const descuentosModoPagoActivos = computed(() => {
    return descuentosStore.descuentosModoPagoActivos
})

// Computed para verificar si hay descuentos disponibles
const tieneDescuentosDisponibles = computed(() => {
    return descuentoPagoAnticipadoVigente.value !== null || descuentosModoPagoActivos.value.length > 0
})

// Computed para formatear la fecha de término
const fechaTerminoFormateada = computed(() => {
    if (!descuentoPagoAnticipadoVigente.value?.fecha_termino) return ''
    return formatDate(descuentoPagoAnticipadoVigente.value.fecha_termino, { format: 'long' })
})

// Métodos
const handleSimulate = async () => {
    try {
        isLoading.value = true
        error.value = null

        // Actualizar formData en el store antes de simular
        if (props.formData) {
            simuladorStore.updateFormData(props.formData)
        }

        await simuladorStore.simulate()

        const prospectoGuardado = await insertarProspecto(simuladorStore.formData as FormData, 'pregrado')
        if (!prospectoGuardado && prospectoError.value) {
            console.warn('No se pudo guardar el prospecto:', prospectoError.value)
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Error al realizar la simulación'
        console.error('Error en simulación:', err)
    } finally {
        isLoading.value = false
    }
}

// Método para exportar PDF usando html2pdf.js
const handleExportPDF = async () => {
    try {
        if (!calculoBecas.value || !carreraInfo.value) {
            console.warn('No hay datos para generar el PDF')
            return
        }

        // Ocultar el botón durante la generación
        isGeneratingPDF.value = true

        // Esperar un momento para que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 300))

        // Usar html2pdf.js para generar el PDF desde el contenido HTML
        if (pdfContentRef.value) {
            const element = pdfContentRef.value

            // Remover temporalmente los Message de PrimeVue del DOM (causan problemas al renderizar el PDF)
            const toRemove = Array.from(
                element.querySelectorAll('.contact-message, .anticipado-message, .confirmation-message')
            ) as HTMLElement[]

            // Guardar referencias a los padres y posiciones para restaurar después
            const elementsData = toRemove.map(el => ({
                element: el,
                parent: el.parentNode,
                nextSibling: el.nextSibling
            }))

            // Remover elementos del DOM
            elementsData.forEach(({ element }) => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element)
                }
            })

            // Agregar page break después de la tabla de detalle
            const summaryCard = element.querySelector('.summary-card') as HTMLElement
            let pageBreakElement: HTMLElement | null = null
            if (summaryCard && summaryCard.parentNode) {
                // Crear un div con la clase que html2pdf.js reconoce para page breaks
                pageBreakElement = document.createElement('div')
                pageBreakElement.className = 'html2pdf__page-break'
                pageBreakElement.style.height = '0'
                pageBreakElement.style.margin = '0'
                pageBreakElement.style.padding = '0'
                // Insertar después del summary-card
                summaryCard.parentNode.insertBefore(pageBreakElement, summaryCard.nextSibling)
            }

            // Esperar a que el DOM se actualice completamente
            await nextTick()
            await new Promise(resolve => setTimeout(resolve, 100))

            try {
                const opt: any = {
                    // Márgenes más pequeños para aprovechar la página
                    margin: [12, 20, 12, 20],
                    filename: 'simulacion-uniacc.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                }

                await html2pdf().set(opt).from(element).save()
            } finally {
                // Remover el elemento de page break
                if (pageBreakElement && pageBreakElement.parentNode) {
                    pageBreakElement.parentNode.removeChild(pageBreakElement)
                }

                // Restaurar elementos en su posición original
                elementsData.forEach(({ element, parent, nextSibling }) => {
                    if (parent) {
                        if (nextSibling) {
                            parent.insertBefore(element, nextSibling)
                        } else {
                            parent.appendChild(element)
                        }
                    }
                })
            }
        }
    } catch (e) {
        console.error('No se pudo generar el PDF:', e)
    } finally {
        // Restaurar el botón después de la generación
        isGeneratingPDF.value = false
    }
}

// Método para mostrar overlay panel con descripción de beca en hover
const showBecaInfo = (event: Event, beca: any) => {
    // Ignorar en móvil, solo usar click
    if (isMobile.value) return
    // Cancelar cualquier timeout pendiente
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }
    selectedBeca.value = beca
    overlayPanel.value?.show(event)
}

// Método para ocultar overlay panel
const hideBecaInfo = () => {
    // Ignorar en móvil, solo usar click
    if (isMobile.value) return
    // Pequeño delay para permitir movimiento del mouse al overlay
    hideTimeout = setTimeout(() => {
        overlayPanel.value?.hide()
        hideTimeout = null
    }, 150)
}

// Método para toggle overlay panel (para mobile)
const toggleBecaInfo = (event: Event, beca: any) => {
    event.preventDefault()
    event.stopPropagation()
    // Cancelar cualquier timeout pendiente
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }

    // Si es la misma beca, hacer toggle (cerrar si está abierto, abrir si está cerrado)
    if (selectedBeca.value?.beca.id === beca.beca.id) {
        // Si ya está seleccionada, cerrar
        overlayPanel.value?.hide()
        selectedBeca.value = null
    } else {
        // Abrir el panel con la nueva beca
        selectedBeca.value = beca
        overlayPanel.value?.show(event)
    }
}

// Método para mantener el overlay visible cuando el mouse está sobre él
const keepBecaInfoVisible = () => {
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }
}

// Métodos para mostrar/ocultar overlay de información de descuentos
const showDescuentosInfo = (event: Event) => {
    if (isMobile.value) return
    if (descuentosHideTimeout) {
        clearTimeout(descuentosHideTimeout)
        descuentosHideTimeout = null
    }
    if (descuentosInfoIconRef.value && descuentosInfoPanel.value) {
        descuentosInfoPanel.value.show(event, descuentosInfoIconRef.value)
    }
}

const hideDescuentosInfo = () => {
    if (isMobile.value) return
    descuentosHideTimeout = setTimeout(() => {
        if (descuentosInfoPanel.value) {
            descuentosInfoPanel.value.hide()
        }
        descuentosHideTimeout = null
    }, 150)
}

const toggleDescuentosInfo = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
    if (descuentosHideTimeout) {
        clearTimeout(descuentosHideTimeout)
        descuentosHideTimeout = null
    }
    if (descuentosInfoIconRef.value && descuentosInfoPanel.value) {
        descuentosInfoPanel.value.toggle(event, descuentosInfoIconRef.value)
    }
}

const keepDescuentosInfoVisible = () => {
    if (descuentosHideTimeout) {
        clearTimeout(descuentosHideTimeout)
        descuentosHideTimeout = null
    }
}

// Método para obtener el texto del badge del proceso de evaluación
const getProcesoEvaluacionBadge = (proceso: string): string => {
    switch (proceso) {
        case 'Evaluacion':
            return 'Requiere evaluación'
        case 'Postulacion':
            return 'Requiere postulación'
        case 'Automatico':
            return 'Beneficio automático'
        default:
            return ''
    }
}

// Método para obtener la clase del badge según el proceso
const getProcesoEvaluacionBadgeClass = (proceso: string): string => {
    switch (proceso) {
        case 'Evaluacion':
            return 'beca-badge-evaluacion'
        case 'Postulacion':
            return 'beca-badge-postulacion'
        case 'Automatico':
            return 'beca-badge-automatico'
        default:
            return ''
    }
}

// Exponer método para ser llamado desde el padre
defineExpose({
    simulate: handleSimulate
})

</script>

<template>
    <div class="results-container">
        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
            <div class="loading-content">
                <p class="loading-message">Calculando beneficios...</p>
                <ProgressSpinner />
            </div>
        </div>

        <!-- Error -->
        <Message v-if="error" severity="error" :closable="false" class="mb-4">
            {{ error }}
        </Message>

        <!-- Contenido -->
        <div v-if="!isLoading && !error && calculoBecas" ref="pdfContentRef" class="space-y-6">
            <!-- Información de la carrera -->
            <Card v-if="carreraInfo" class="career-card">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-graduation-cap"></i>
                        <span>Información de la Carrera</span>
                    </div>
                </template>
                <template #content>
                    <div class="career-info-content">
                        <div class="career-name">{{ carreraInfo.nombre_programa }}</div>
                        <div class="career-details">
                            <Tag :value="carreraInfo.nivel_academico" severity="info" class="mr-2" />
                            <Tag :value="carreraInfo.modalidad_programa" severity="secondary" class="mr-2" />
                            <span class="text-sm text-gray-600">{{ carreraInfo.duracion_programa }}</span>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Tabla de resumen -->
            <Card class="summary-card">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-dollar"></i>
                        <span>Detalle de la Simulación</span>
                    </div>
                </template>
                <template #content>
                    <div class="table-container">
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th class="table-header">Concepto</th>
                                    <th class="table-header text-center desktop-only">Tipo</th>
                                    <th class="table-header text-center desktop-only">Descuento</th>
                                    <th class="table-header text-center mobile-only">Descuento</th>
                                    <th class="table-header text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="table-row base-row">
                                    <td class="table-cell font-semibold">Arancel Base</td>
                                    <td class="table-cell text-center text-gray-500 desktop-only">-</td>
                                    <td class="table-cell text-center text-gray-500 desktop-only">-</td>
                                    <td class="table-cell text-center text-gray-500 mobile-only">-</td>
                                    <td class="table-cell text-right font-semibold">
                                        {{ formatCurrency(calculoBecas?.arancel_base || 0) }}
                                    </td>
                                </tr>
                                <tr class="table-row matricula-row">
                                    <td class="table-cell font-semibold">Matrícula</td>
                                    <td class="table-cell text-center text-gray-500 desktop-only">-</td>
                                    <td class="table-cell text-center text-gray-500 desktop-only">-</td>
                                    <td class="table-cell text-center text-gray-500 mobile-only">-</td>
                                    <td class="table-cell text-right font-semibold">
                                        {{ formatCurrency(carreraInfo?.matricula || 0) }}
                                    </td>
                                </tr>
                                <template v-if="formData?.usaBecasEstado">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Beneficios del Estado
                                        </td>
                                        <td class="desktop-only"></td>
                                        <td class="desktop-only"></td>
                                        <td class="mobile-only"></td>
                                        <td></td>
                                    </tr>
                                    <tr class="table-row info-row estado-info-row">
                                        <td class="table-cell text-sm text-gray-700 italic" :colspan="subtotalColspan + 1">
                                            <div class="flex items-start gap-2">
                                                <i class="pi pi-info-circle text-purple-600 mt-0.5"></i>
                                                <span>
                                                    Becas Mineduc dependen de tu postulación en el FUAS. La asignación es realizada por el Estado y puede modificar el arancel final.
                                                    <a href="https://postulacion.beneficiosestudiantiles.cl/fuas/" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-800 underline font-medium ml-1">
                                                        Más info en sitio FUAS
                                                    </a>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </template>

                                <template v-if="becasAplicadas.length > 0">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Beneficios Internos (UNIACC)
                                        </td>
                                        <td class="desktop-only"></td>
                                        <td class="desktop-only"></td>
                                        <td class="mobile-only"></td>
                                        <td></td>
                                    </tr>
                                    <tr v-for="beca in becasAplicadas" :key="`interno-${beca.beca.id}`"
                                        class="table-row benefit-row interno-row">
                                        <td class="table-cell">
                                            <div class="benefit-name">
                                                <i class="pi pi-star mr-2 text-blue-600 text-sm"></i>
                                                <span class="text-sm">{{ beca.beca.nombre }}</span>
                                                <i
                                                    v-if="beca.beca.proceso_evaluacion || beca.beca.descripcion || (beca.beca.requiere_documentacion && beca.beca.requiere_documentacion.length > 0)"
                                                    class="pi pi-info-circle ml-2 text-gray-500 cursor-help hover:text-blue-600 transition-colors text-xs"
                                                    @mouseenter="!isMobile && showBecaInfo($event, beca)"
                                                    @mouseleave="!isMobile && hideBecaInfo()"
                                                    @click="toggleBecaInfo($event, beca)"
                                                    :aria-label="`Información sobre ${beca.beca.nombre}`"
                                                ></i>
                                            </div>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span class="badge-type">
                                                {{ beca.beca.tipo_descuento === 'porcentaje' ? 'Porcentaje' :
                                                    beca.beca.tipo_descuento === 'monto_fijo' ? 'Monto Fijo' : 'Mixto' }}
                                            </span>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span v-if="beca.beca.tipo_descuento === 'porcentaje'"
                                                class="discount-percentage">
                                                {{ beca.descuento_aplicado }}%
                                            </span>
                                            <span v-else class="text-gray-500">
                                                Monto Fijo
                                            </span>
                                        </td>
                                        <td class="table-cell text-center mobile-only">
                                            <span v-if="beca.beca.tipo_descuento === 'porcentaje'"
                                                class="discount-percentage">
                                                {{ beca.descuento_aplicado }}%
                                            </span>
                                            <span v-else class="text-xs text-gray-600">Fijo</span>
                                        </td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(beca.monto_descuento) }}
                                        </td>
                                    </tr>
                                    <tr class="table-row subtotal-row subtotal-interno-row">
                                        <td class="table-cell font-semibold" :colspan="subtotalColspan">
                                            Después de Beneficios Internos
                                        </td>
                                        <td class="table-cell text-right font-semibold">
                                            {{ formatCurrency(arancelDespuesBecasInternas) }}
                                        </td>
                                    </tr>
                                </template>
                                <template v-if="formData?.planeaUsarCAE">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            <div class="flex items-center gap-2">
                                                <span>
                                                    Arancel Referencia CAE
                                                    <span v-if="carreraInfo?.anio_arancel_referencia && carreraInfo.anio_arancel_referencia < ANIO_POSTULACION">
                                                        - {{ carreraInfo.anio_arancel_referencia }} *
                                                    </span>
                                                </span>
                                                <i
                                                    class="pi pi-info-circle text-orange-600 cursor-pointer hover:text-orange-800 transition-colors"
                                                    @click="showCaeDialog = true"
                                                    title="Información sobre el crédito CAE"
                                                ></i>
                                            </div>
                                        </td>
                                        <td class="desktop-only"></td>
                                        <td class="desktop-only"></td>
                                        <td class="mobile-only"></td>
                                        <td></td>
                                    </tr>
                                    <tr v-if="arancelReferenciaCae && arancelReferenciaCae > 0 && descuentoCae > 0" class="table-row cae-row">
                                        <td class="table-cell font-semibold">
                                            Máximo Financiamiento CAE
                                        </td>
                                        <td class="table-cell text-center desktop-only">CAE</td>
                                        <td class="table-cell text-center text-gray-500 desktop-only">-</td>
                                        <td class="table-cell text-center mobile-only">CAE</td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(descuentoCae) }}
                                            <span v-if="carreraInfo?.anio_arancel_referencia" class="text-xs text-orange-600 block">(Ref. {{ carreraInfo.anio_arancel_referencia }})</span>
                                        </td>
                                    </tr>
                                    <tr v-if="arancelReferenciaCae && arancelReferenciaCae > 0 && descuentoCae > 0 && carreraInfo?.anio_arancel_referencia && carreraInfo.anio_arancel_referencia < ANIO_POSTULACION" class="table-row info-row cae-info-row">
                                        <td class="table-cell text-sm text-gray-700 italic" :colspan="subtotalColspan + 1">
                                            <div class="flex items-start gap-2">
                                                <i class="pi pi-info-circle text-orange-600 mt-0.5"></i>
                                                <span>
                                                    * Los valores mostrados corresponden al <strong>arancel de referencia CAE {{ carreraInfo?.anio_arancel_referencia || '' }}</strong>.
                                                    El Mineduc publicará los nuevos aranceles de referencia durante el mes de enero {{ ANIO_POSTULACION }}.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="arancelReferenciaCae && arancelReferenciaCae > 0 && maximoFinanciamientoCae" class="table-row subtotal-row subtotal-cae-row">
                                        <td class="table-cell font-semibold" :colspan="subtotalColspan">
                                            Después de CAE
                                        </td>
                                        <td class="table-cell text-right font-semibold">
                                            {{ formatCurrency(arancelFinalReal) }}
                                        </td>
                                    </tr>
                                    <!-- <tr class="table-row info-row cae-info-row">
                                        <td class="table-cell text-sm text-gray-700 italic" :colspan="subtotalColspan + 1">
                                            <div class="flex items-start gap-2">
                                                <i class="pi pi-info-circle text-orange-600 mt-0.5"></i>
                                                <span>
                                                    <template v-if="arancelReferenciaCae && arancelReferenciaCae > 0">
                                                        Si firmas el CAE, el máximo financiamiento aplicable es de {{ formatCurrency(maximoFinanciamientoCae || 0) }}.
                                                        El monto exacto se confirmará al momento de la firma.
                                                    </template>
                                                    <template v-else>
                                                        Si firmas el CAE, se aplicará el arancel de referencia definido para tu carrera. El monto exacto se confirmará al momento de la firma.
                                                    </template>
                                                </span>
                                            </div>
                                        </td>
                                    </tr> -->
                                </template>


                                <tr class="table-row discount-total-row">
                                    <td class="table-cell font-semibold" :colspan="subtotalColspan">
                                        Total Descuentos Aplicados
                                    </td>
                                    <td class="table-cell text-right font-bold text-red-600">
                                        -{{ formatCurrency(descuentoTotalRealConCae) }}
                                    </td>
                                </tr>
                                <!-- Descuentos adicionales por pago anticipado -->
                                <template v-if="descuentoPagoAnticipadoVigente && (descuentoPagoAnticipadoArancel > 0 || descuentoPagoAnticipadoMatricula > 0)">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Descuentos Adicionales
                                        </td>
                                        <td class="desktop-only"></td>
                                        <td class="desktop-only"></td>
                                        <td class="mobile-only"></td>
                                        <td></td>
                                    </tr>
                                    <tr v-if="descuentoPagoAnticipadoArancel > 0" class="table-row benefit-row">
                                        <td class="table-cell">
                                            <div class="benefit-name">
                                                <i class="pi pi-calendar mr-2 text-green-600 text-sm"></i>
                                                <span class="text-sm">Descuento por pago anticipado (Arancel)</span>
                                            </div>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span class="badge-type">Porcentaje</span>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span class="discount-percentage">{{ descuentoPagoAnticipadoVigente.dscto_arancel }}%</span>
                                        </td>
                                        <td class="table-cell text-center mobile-only">
                                            <span class="discount-percentage">{{ descuentoPagoAnticipadoVigente.dscto_arancel }}%</span>
                                        </td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(descuentoPagoAnticipadoArancel) }}
                                        </td>
                                    </tr>
                                    <tr v-if="descuentoPagoAnticipadoMatricula > 0" class="table-row benefit-row">
                                        <td class="table-cell">
                                            <div class="benefit-name">
                                                <i class="pi pi-calendar mr-2 text-green-600 text-sm"></i>
                                                <span class="text-sm">Descuento por pago anticipado (Matrícula)</span>
                                            </div>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span class="badge-type">Porcentaje</span>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span class="discount-percentage">{{ descuentoPagoAnticipadoVigente.dscto_matricula }}%</span>
                                        </td>
                                        <td class="table-cell text-center mobile-only">
                                            <span class="discount-percentage">{{ descuentoPagoAnticipadoVigente.dscto_matricula }}%</span>
                                        </td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(descuentoPagoAnticipadoMatricula) }}
                                        </td>
                                    </tr>
                                </template>

                                <!-- Descuentos adicionales por modo de pago -->
                                <template v-if="descuentoModoPagoAplicable && descuentoModoPagoArancel > 0">
                                    <tr v-if="!descuentoPagoAnticipadoVigente || (descuentoPagoAnticipadoArancel === 0 && descuentoPagoAnticipadoMatricula === 0)" class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Descuentos Adicionales
                                        </td>
                                        <td class="desktop-only"></td>
                                        <td class="desktop-only"></td>
                                        <td class="mobile-only"></td>
                                        <td></td>
                                    </tr>
                                    <tr class="table-row benefit-row">
                                        <td class="table-cell">
                                            <div class="benefit-name">
                                                <i class="pi pi-credit-card mr-2 text-blue-600 text-sm"></i>
                                                <span class="text-sm">Descuento por medio de pago{{ descuentoModoPagoAplicable.nombre ? ` - ${descuentoModoPagoAplicable.nombre}` : '' }}</span>
                                            </div>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span class="badge-type">Porcentaje</span>
                                        </td>
                                        <td class="table-cell text-center desktop-only">
                                            <span class="discount-percentage">{{ descuentoModoPagoAplicable.dscto_arancel }}%</span>
                                        </td>
                                        <td class="table-cell text-center mobile-only">
                                            <span class="discount-percentage">{{ descuentoModoPagoAplicable.dscto_arancel }}%</span>
                                        </td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(descuentoModoPagoArancel) }}
                                        </td>
                                    </tr>
                                </template>

                                <tr class="table-row final-row">
                                    <td class="table-cell font-bold text-lg" :colspan="subtotalColspan">
                                        Arancel + Matrícula final a pactar
                                    </td>
                                    <td class="table-cell text-right font-bold text-lg text-green-600">
                                        {{ formatCurrency(arancelMasMatricula) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </Card>

            <!-- Simulación de cuotas y medios de pago -->
            <Card class="payment-simulation-card">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-credit-card"></i>
                        <span>Simulación de cuotas y medios de pago</span>
                        <i
                            v-if="tieneDescuentosDisponibles"
                            ref="descuentosInfoIconRef"
                            class="pi pi-info-circle text-gray-500 cursor-help hover:text-blue-600 transition-colors text-sm"
                            @mouseenter="!isMobile && showDescuentosInfo($event)"
                            @mouseleave="!isMobile && hideDescuentosInfo()"
                            @click="toggleDescuentosInfo($event)"
                            title="Información sobre descuentos adicionales"
                        ></i>
                    </div>
                </template>
                <template #content>
                    <div class="payment-simulation-content">
                        <div class="payment-control-group">
                            <label for="numeroCuotas" class="payment-label">Número de cuotas: <span class="slider-value">{{ numeroCuotas }}</span></label>

                            <div class="slider-container">
                                <Slider
                                    id="numeroCuotas"
                                    v-model="numeroCuotas"
                                    :min="1"
                                    :max="12"
                                    :disabled="isSliderDisabled"
                                    class="payment-slider"
                                />
                            </div>
                        </div>
                        <div class="payment-control-group">
                            <label for="tipoPago" class="payment-label">Medio de pago</label>
                            <Select
                                id="tipoPago"
                                v-model="tipoPago"
                                :options="opcionesTipoPago"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Seleccione un medio de pago"
                                class="payment-select"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Resumen financiero -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                <div class="flex flex-col gap-4 h-full">
                    <Card class="summary-item first-column-card flex-1">
                        <template #content>
                            <div class="text-center first-column-content h-full flex flex-col justify-center">
                                <div class="text-sm text-black-700 mb-2 first-column-label font-bold">Arancel Original</div>
                                <div class="text-sm text-gray-600 mb-0 font-semibold">{{ numeroCuotas }} cuotas de</div>
                                <div class="text-2xl font-bold text-gray-900 first-column-value">
                                    {{ formatCurrency(calculoBecas?.arancel_base / numeroCuotas || 0) }}
                                </div>
                            </div>
                        </template>
                    </Card>
                    <Card class="summary-item matricula-card first-column-card flex-1">
                        <template #content>
                            <div class="text-center first-column-content h-full flex flex-col justify-center">
                                <div class="text-sm text-black-700 mb-2 first-column-label font-bold">Matrícula</div>
                                <div class="text-sm text-gray-600 mb-0 font-semibold">{{ numeroCuotas }} cuotas de</div>
                                <div class="text-2xl font-bold text-gray-900 first-column-value">
                                    {{ formatCurrency(carreraInfo?.matricula / numeroCuotas || 0) }}
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
                <Card class="summary-item discount">
                    <template #content>
                        <div class="text-center">
                            <div class="text-sm text-black-700 mb-2 font-bold">Descuento Total</div>
                            <div class="text-2xl font-bold text-red-600">
                                -{{ formatCurrency(descuentoTotalRealConCae) }}
                            </div>
                        </div>
                    </template>
                </Card>
                <Card class="summary-item final">
                    <template #content>
                        <div class="text-center">
                            <div class="text-sm text-black-700 mb-2 font-bold">Total Final a Pagar</div>
                            <div class="text-sm text-gray-600 mb-0 font-semibold">{{ numeroCuotas }} cuotas de</div>
                            <div class="text-2xl font-bold text-green-600 mb-2">
                                {{ formatCurrency(valorMensual) }}
                            </div>
                            <div class="text-xs text-gray-500 valor-anual mb-1">
                                <div>* Arancel final: {{ formatCurrency(arancelFinalConDescuentosAdicionales) }}</div>
                                <div>* Matrícula final: {{ formatCurrency(matriculaFinalConDescuentosAdicionales) }}</div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Mensaje de contacto con descuento -->
            <Message
                v-if="descuentoPorcentualTotal > 0"
                severity="success"
                :closable="false"
                class="contact-message"
                size="large"
            >
                <div class="contact-message-content">
                    <div class="contact-message-text">
                        <b class="simulation-question">¿Te gustó la simulación?</b>
                        Podrías estudiar con hasta un <b>{{ descuentoPorcentualTotal }}% de descuento.</b>
                        Si quieres saber tu descuento real, escríbenos a <a href="mailto:admision@uniacc.cl" class="contact-link">admision@uniacc.cl</a> o llámanos al <b>+56 2 1234 5678.</b>
                    </div>
                </div>
            </Message>

            <!-- Mensaje informativo sobre confirmación -->
            <Message
                v-if="descuentoPorcentualTotal > 0"
                severity="info"
                :closable="false"
                class="confirmation-message"
                size="small"
            >
                <div class="confirmation-message-content">
                    <Info class="confirmation-message-icon" />
                    <div class="confirmation-message-text-wrapper">
                        <div class="confirmation-message-title">Simulación referencial.</div>
                        <div class="confirmation-message-text">Un asesor revisará tu caso y confirmará el monto final.</div>
                    </div>
                </div>
            </Message>

            <!-- Becas aplicadas -->
            <div v-if="becasAplicadas.length" class="benefits-section">
                <h3 class="benefits-section-title">
                    <Award class="w-6 h-6" />
                    Becas Aplicadas
                </h3>

                <!-- Becas Internas Aplicadas -->
                <div v-if="becasAplicadas.length" class="benefits-subsection">
                    <h4 class="subsection-title">
                        <Award class="w-5 h-5 text-blue-600" />
                        Beneficios Internos (UNIACC)
                    </h4>
                    <div class="benefits-grid">
                        <div
                            v-for="beca in becasAplicadas"
                            :key="beca.beca.id"
                            class="benefit-card benefit-card-interno"
                        >
                            <div class="benefit-header">
                                <div class="benefit-icon">
                                    <CheckCircle class="w-5 h-5 text-green-600" />
                                </div>
                                <div class="benefit-info">
                                    <h4 class="benefit-title">{{ beca.beca.nombre }}</h4>
                                    <p class="benefit-type">{{ beca.beca.proceso_evaluacion }} • {{ beca.beca.tipo_descuento }}</p>
                                </div>
                            </div>
                            <div class="benefit-details">
                                <div class="benefit-discount">
                                    <span class="discount-label">Descuento:</span>
                                    <span class="discount-value">
                                        {{ beca.beca.tipo_descuento === 'porcentaje'
                                            ? `${beca.descuento_aplicado}%`
                                            : formatCurrency(beca.beca.descuento_monto_fijo || 0) }}
                                    </span>
                                </div>
                                <div class="benefit-applied">
                                    <span class="applied-label">Aplicado:</span>
                                    <span class="applied-value">{{ formatCurrency(beca.monto_descuento) }}</span>
                                </div>
                            </div>
                            <div v-if="beca.beca.descripcion" class="benefit-description">
                                <p class="description-text">{{ beca.beca.descripcion }}</p>
                            </div>
                            <div v-if="beca.beca.requiere_documentacion && beca.beca.requiere_documentacion.length > 0" class="benefit-documentation">
                                <div class="documentation-header">
                                    <FileText class="w-4 h-4 text-blue-600" />
                                    <span class="documentation-title">Documentación Requerida:</span>
                                </div>
                                <ul class="documentation-list">
                                    <li v-for="(doc, index) in beca.beca.requiere_documentacion" :key="index" class="documentation-item">
                                        {{ doc }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botón de exportar PDF (fuera del contenido del PDF) -->
        <div v-if="!isLoading && !error && calculoBecas && !isGeneratingPDF" class="export-pdf-section">
            <Button
                label="Exportar PDF"
                icon="pi pi-download"
                @click="handleExportPDF"
                class="export-pdf-button"
                severity="secondary"
                outlined
            />
        </div>

        <!-- Overlay Panel para mostrar descripción de beca -->
        <OverlayPanel ref="overlayPanel" class="beca-info-overlay" :dismissable="false" @mouseenter="keepBecaInfoVisible" @mouseleave="hideBecaInfo">
            <div v-if="selectedBeca" class="beca-info-content">
                <!-- Header con título y badge -->
                <div class="beca-info-header">
                    <h4 class="beca-info-title">{{ selectedBeca.beca.nombre }}</h4>
                    <span
                        v-if="selectedBeca.beca.proceso_evaluacion"
                        :class="['beca-info-badge', getProcesoEvaluacionBadgeClass(selectedBeca.beca.proceso_evaluacion)]"
                    >
                        {{ getProcesoEvaluacionBadge(selectedBeca.beca.proceso_evaluacion) }}
                    </span>
                </div>
                <div v-if="selectedBeca.beca.descripcion || (selectedBeca.beca.requiere_documentacion && selectedBeca.beca.requiere_documentacion.length > 0)" class="beca-info-divider"></div>

                <!-- Descripción -->
                <div v-if="selectedBeca.beca.descripcion" class="beca-info-body">
                    <div class="beca-info-description-section">
                        <p class="beca-info-description">
                            {{ selectedBeca.beca.descripcion }}
                        </p>
                    </div>
                    <div v-if="selectedBeca.beca.requiere_documentacion && selectedBeca.beca.requiere_documentacion.length > 0" class="beca-info-divider"></div>
                </div>

                <!-- Documentación requerida -->
                <div v-if="selectedBeca.beca.requiere_documentacion && selectedBeca.beca.requiere_documentacion.length > 0" class="beca-info-footer">
                    <h5 class="beca-info-subtitle">Documentación Requerida:</h5>
                    <ul class="beca-info-list">
                        <li v-for="(doc, index) in selectedBeca.beca.requiere_documentacion" :key="index" class="beca-info-item">
                            {{ doc }}
                        </li>
                    </ul>
                </div>
            </div>
        </OverlayPanel>

        <!-- Overlay Panel para mostrar información de descuentos adicionales -->
        <OverlayPanel
            ref="descuentosInfoPanel"
            class="descuentos-info-overlay"
            :dismissable="false"
            @mouseenter="keepDescuentosInfoVisible"
            @mouseleave="hideDescuentosInfo"
        >
            <div class="descuentos-info-content">
                <div class="descuentos-info-title">
                    <b>Tenemos descuentos adicionales disponibles.</b>
                </div>
                <ul class="descuentos-info-list">
                    <li v-if="descuentoPagoAnticipadoVigente" class="descuentos-info-item">
                        <b>Por pago anticipado:</b>
                        <ul class="descuentos-info-sublist">
                            <li v-if="descuentoPagoAnticipadoVigente.dscto_matricula">
                                <b>{{ descuentoPagoAnticipadoVigente.dscto_matricula }}%</b> en matrícula
                            </li>
                            <li v-if="descuentoPagoAnticipadoVigente.dscto_arancel">
                                <b>{{ descuentoPagoAnticipadoVigente.dscto_arancel }}%</b> en arancel
                            </li>
                            <li v-if="fechaTerminoFormateada">
                                Válido hasta el <b>{{ fechaTerminoFormateada }}</b>
                            </li>
                        </ul>
                    </li>
                    <li v-if="descuentosModoPagoActivos.length > 0" class="descuentos-info-item">
                        <b>Por medio de pago:</b>
                        <ul class="descuentos-info-sublist">
                            <li v-for="descuento in descuentosModoPagoActivos" :key="descuento.id">
                                <b>{{ descuento.dscto_arancel }}%</b> en arancel{{ descuento.nombre ? ` - ${descuento.nombre}` : '' }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </OverlayPanel>

        <!-- Drawer para información del CAE -->
        <Drawer
            v-model:visible="showCaeDialog"
            position="bottom"
            :style="{ height: 'auto', maxHeight: '80vh' }"
            :modal="true"
        >
            <template #header>
                <div class="flex items-center gap-2">
                    <i class="pi pi-info-circle text-orange-600"></i>
                    <span class="text-lg font-semibold">Consideraciones para la simulación del crédito CAE</span>
                </div>
            </template>
            <div class="cae-drawer-content p-4">
                <p class="mb-4">
                    <strong>El monto financiado anualmente</strong> corresponde al 100% del arancel de referencia vigente a la fecha.
                </p>
                <p class="mb-4">
                    Se ha considerado una <strong>tasa de interés de UF + 2% anual</strong>; un período de <strong>18 meses</strong> a contar del egreso del estudiante, previo al inicio del cobro; y un plazo de <strong>120, 180 o 240 meses</strong> para pagar el total del crédito, según el monto total adeudado.
                </p>
                <p class="mb-4">
                    El <strong>financiamiento total</strong> entregado para tu carrera en esta simulación, se otorga por iguales montos cada año y por el número de años de financiamiento que solicitas, considerando como tope el número de años de duración de la respectiva carrera.
                </p>
                <p class="mb-4">
                    El cálculo considera <strong>meses de 30 días</strong> y el <strong>año de 360 días</strong>.
                </p>
                <p class="mb-0 text-sm text-gray-600 italic">
                    El resultado de este ejercicio constituye una estimación. No debe utilizarse para otros fines que no sean proyectar una cuota aproximada a pagar, considerando los supuestos y parámetros definidos. Atendido lo anterior, la cuota calculada tiene carácter referencial y no genera obligación ni restricción alguna para la Comisión Administradora del Sistema de Créditos para Estudios Superiores ni para los bancos participantes en el sistema.
                </p>
            </div>
        </Drawer>
    </div>
</template>

<style scoped>
.results-container {
    @apply w-full max-w-4xl mx-auto p-6;
}

.loading-container {
    @apply flex justify-center items-center py-16 px-6;
}

.loading-content {
    @apply flex flex-col items-center justify-center gap-6;
    @apply bg-gray-50 border border-gray-200 rounded-lg shadow-sm;
    @apply px-12 py-10;
    min-width: 300px;
}

.loading-message {
    @apply text-lg font-medium text-gray-700 mb-0;
    margin: 0;
}

.career-card {
    @apply mb-6;
}

.career-info-content {
    @apply space-y-3;
}

.career-name {
    @apply text-xl font-bold text-gray-900;
}

.career-details {
    @apply flex items-center flex-wrap gap-2;
}

.summary-card {
    @apply mb-6;
}

.summary-item {
    @apply text-center;
}

.summary-item.discount {
    background-color: #FEE2E2;
    border-color: #FCA5A5;
}

.summary-item.final {
    @apply border-green-200 bg-green-50;
}

/* Estilos para el valor anual en la card final */
.summary-item.final .valor-anual {
    opacity: 0.7;
    font-weight: 400;
}

/* Card de Arancel Original - versión suave del naranja de la tabla (#FF6B35) */
.summary-item.first-column-card:not(.matricula-card) {
    background-color: #FFF5F0;
    border-color: #FFE5D9;
}

/* Card de Matrícula - versión suave del morado de la tabla (#8d01b3) */
.summary-item.matricula-card {
    background-color: #F5F0FF;
    border-color: #E8D9FF;
}

/* Centrar verticalmente el contenido de las cards de descuento y final en desktop */
@media (min-width: 768px) {
    :deep(.summary-item.discount .p-card-body),
    :deep(.summary-item.final .p-card-body) {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100%;
    }

    :deep(.summary-item.discount .p-card-content),
    :deep(.summary-item.final .p-card-content) {
        width: 100%;
    }
}

.summary-item.matricula-card {
    @apply border-purple-200 bg-purple-50;
}

/* Estilos para cards de la primera columna - solo en desktop */
@media (min-width: 768px) {
    :deep(.summary-item.first-column-card) {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    :deep(.summary-item.first-column-card .p-card-body) {
        padding: 0.25rem 0.5rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    :deep(.summary-item.first-column-card .p-card-content) {
        padding: 0.25rem 0;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .first-column-content {
        @apply py-0;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .first-column-label {
        @apply text-xs mb-0.5;
    }

    .first-column-value {
        @apply text-lg;
    }
}

.table-container {
    @apply overflow-x-auto;
}

.results-table {
    @apply w-full border-collapse bg-white rounded-lg shadow-sm overflow-hidden;
}

.table-header {
    @apply px-4 py-3 text-xs font-semibold uppercase tracking-wide;
    background-color: #000000;
    color: #ffffff;
    border-bottom: 1px solid #000000;
}

.results-table tbody tr {
    @apply border-b border-gray-200 transition-colors;
}

.results-table tbody tr:hover:not(.section-header-row):not(.base-row):not(.matricula-row) {
    @apply bg-gray-50;
}

.table-row.base-row {
    background-color: #FF6B35;
    color: #ffffff;
    font-weight: 600;
}

.table-row.base-row .table-cell {
    color: #ffffff;
}

.table-row.matricula-row {
    background-color: var(--uniacc-purple);
    color: #ffffff;
    font-weight: 600;
}

.table-row.matricula-row .table-cell {
    color: #ffffff;
}

.table-row.section-header-row {
    background-color: #4A5568;
}

.table-row.section-header-row .table-cell {
    color: #ffffff;
    font-weight: 600;
}

.table-row.benefit-row {
    @apply bg-white;
}

.table-row.estado-row {
    @apply bg-purple-50;
}

.table-row.interno-row {
    @apply bg-blue-50;
}

.table-row.cae-row {
    @apply bg-orange-50;
}

.table-row.subtotal-row {
    @apply bg-gray-100;
}

.table-row.discount-total-row {
    @apply bg-red-50;
    border-top: 2px solid #FCA5A5;
}

.table-row.final-row {
    @apply bg-green-50;
    border-top: 2px solid #86EFAC;
}

.table-row.info-row {
    @apply bg-gray-50;
}

.table-row.estado-info-row {
    @apply bg-purple-50;
}

.table-row.cae-info-row {
    @apply bg-orange-50;
}

.table-cell {
    @apply px-4 py-3 text-sm text-gray-900;
}

/* Clases para responsive */
.desktop-only {
    display: table-cell;
}

.mobile-only {
    display: none;
}

/* Estilos responsive para pantallas pequeñas y medianas */
@media (max-width: 1024px) {
    .desktop-only {
        display: none;
    }

    .mobile-only {
        display: table-cell;
    }

    .table-header,
    .table-cell {
        @apply px-2 py-2 text-xs;
    }

    .table-cell.font-bold.text-lg {
        @apply text-base;
    }

    .benefit-name {
        @apply text-xs;
    }

    .benefit-name i {
        @apply mr-1;
        font-size: 0.75rem;
    }

    .section-title {
        @apply text-xs;
    }

    .discount-percentage {
        @apply text-xs;
    }
}

.table-cell.text-red-600 {
    color: #dc2626 !important;
}

.benefit-name {
    @apply flex items-center;
}

.badge-type {
    @apply inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800;
}

.badge-estado {
    @apply bg-purple-100 text-purple-800;
}

.badge-cae {
    @apply bg-orange-100 text-orange-800;
}

.discount-percentage {
    @apply font-semibold text-blue-600;
}

.section-title {
    @apply text-sm uppercase tracking-wide;
    @apply flex items-center gap-2;
}

.section-tooltip-icon {
    @apply ml-2 cursor-help;
    font-size: 0.875rem;
    opacity: 0.9;
    transition: opacity 0.2s;
}

.section-tooltip-icon:hover {
    opacity: 1;
}

/* Estilos para mensaje de contacto */
.contact-message {
    @apply mt-8;
}

.contact-message-content {
    @apply flex flex-col;
}

.contact-message-text {
    @apply text-sm;
    line-height: 1.5;
}

.contact-message-text .simulation-question {
    @apply text-base;
    display: block;
    margin-bottom: 0.5rem;
}

.contact-message-text b:not(.simulation-question) {
    font-weight: 600;
}

.contact-link {
    @apply underline font-medium;
    color: inherit;
}

.contact-link:hover {
    @apply opacity-80;
}

.contact-phone {
    @apply font-semibold;
}

.confirmation-message {
    @apply mt-4;
}

.confirmation-message-content {
    @apply flex items-start gap-3;
}

.confirmation-message-icon {
    @apply flex-shrink-0 mt-0.5;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--p-info-color);
}

.confirmation-message-text-wrapper {
    @apply flex flex-col;
}

.confirmation-message-title {
    @apply font-semibold mb-1 text-base;
}

.confirmation-message-text {
    @apply text-sm leading-relaxed;
}

.anticipado-message {
    @apply mt-6;
}

.anticipado-message-content {
    @apply flex flex-col;
}

.anticipado-message-title {
    @apply mb-2;
    font-size: 0.9375rem;
}

.anticipado-message-list {
    @apply list-disc pl-6 mt-2 space-y-2;
}

.anticipado-message-list li {
    @apply text-sm;
    line-height: 1.6;
}

.anticipado-message-list li b {
    font-weight: 600;
}

.anticipado-message-list .subtitle-item {
    @apply mb-1;
}

.anticipado-sublist {
    @apply list-disc pl-5 mt-1 space-y-1;
    font-size: 0.875rem;
}

.anticipado-sublist li {
    @apply text-xs;
    line-height: 1.5;
}

.subtotal-estado-row {
    @apply bg-purple-50 font-semibold;
}

.subtotal-interno-row {
    @apply bg-blue-50 font-semibold;
}

.subtotal-cae-row {
    @apply bg-orange-50 font-semibold;
}

/* Estilos para sección de becas aplicadas */
.benefits-section {
    @apply space-y-6 mt-8;
}

.benefits-subsection {
    @apply space-y-4 mt-6;
}

.benefits-section-title {
    @apply flex items-center space-x-2 text-xl font-bold text-gray-900 mb-4;
}

.subsection-title {
    @apply flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200;
}

.benefits-grid {
    @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.benefit-card {
    @apply bg-white border border-gray-200 rounded-lg p-4;
}

.benefit-card-estado {
    @apply border-purple-200 bg-purple-50/30;
}

.benefit-card-interno {
    @apply border-blue-200 bg-blue-50/30;
}

.benefit-header {
    @apply flex items-start space-x-3 mb-3;
}

.benefit-icon {
    @apply flex-shrink-0 mt-1;
}

.benefit-info {
    @apply flex-1;
}

.benefit-title {
    @apply text-sm font-semibold text-gray-900 mb-1;
}

.benefit-type {
    @apply text-xs text-gray-500;
}

.benefit-details {
    @apply space-y-2;
}

.benefit-discount,
.benefit-applied {
    @apply flex justify-between items-center text-sm;
}

.discount-label,
.applied-label {
    @apply text-gray-600;
}

.discount-value,
.applied-value {
    @apply font-semibold text-gray-900;
}

.benefit-description {
    @apply mt-3 pt-3 border-t border-gray-200;
}

.description-text {
    @apply text-sm text-gray-600;
}

.benefit-documentation {
    @apply mt-3 pt-3 border-t border-gray-200;
}

.documentation-header {
    @apply flex items-center space-x-2 mb-2;
}

.documentation-title {
    @apply text-sm font-semibold text-gray-700;
}

.documentation-list {
    @apply list-none space-y-1.5 pl-0;
}

.documentation-item {
    @apply text-sm text-gray-600 flex items-start;
}

.documentation-item::before {
    content: '•';
    @apply text-blue-600 font-bold mr-2 mt-0.5;
}

/* Estilos para botón de exportar PDF */
.export-pdf-section {
    @apply flex justify-center mt-8 pt-6 border-t border-gray-200;
}

.export-pdf-button {
    @apply min-w-[200px];
}

/* Estilos para overlay panel de información de beca */
.beca-info-overlay {
    max-width: 320px;
}

.beca-info-overlay :deep(.p-overlaypanel-content) {
    padding: 0 !important;
}

.beca-info-content {
    display: flex;
    flex-direction: column;
}

.beca-info-header {
    @apply flex items-start justify-between gap-2 px-3 py-2 mb-0;
}

.beca-info-content > *:not(.beca-info-header):not(.beca-info-divider) {
    @apply px-3;
}

.beca-info-content > .beca-info-body,
.beca-info-content > .beca-info-footer {
    @apply py-2;
}

.beca-info-content > .beca-info-divider {
    @apply mx-3;
}

.beca-info-title {
    @apply text-sm font-semibold text-gray-900;
    flex: 1;
    margin: 0;
}

.beca-info-badge {
    @apply inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap;
    flex-shrink: 0;
}

.beca-badge-automatico {
    @apply bg-green-100 text-green-800;
}

.beca-badge-evaluacion {
    @apply bg-yellow-100 text-yellow-800;
}

.beca-badge-postulacion {
    @apply bg-blue-100 text-blue-800;
}

.beca-info-divider {
    @apply my-2;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    border: none;
    width: 100%;
}

.beca-info-body {
    @apply flex flex-col;
}

.beca-info-description-section {
    @apply mb-0;
}

.beca-info-description {
    @apply text-xs text-gray-700 leading-relaxed;
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 0;
}

.beca-info-footer {
    @apply mt-0;
}

.beca-info-subtitle {
    @apply text-xs font-semibold text-gray-800 mb-1.5;
    margin-top: 0;
}

.beca-info-list {
    @apply list-disc pl-4 space-y-1;
    margin: 0;
}

.beca-info-item {
    @apply text-xs text-gray-700 leading-relaxed;
}

/* Estilos para simulación de cuotas y medios de pago */
.payment-simulation-card {
    @apply mb-6;
}

.payment-simulation-content {
    @apply flex flex-col md:flex-row gap-6;
}

.payment-control-group {
    @apply flex-1 flex flex-col gap-2;
}

.payment-label {
    @apply text-sm font-medium text-gray-600 mb-3;
    @apply flex items-center gap-2;
}

.slider-container {
    @apply w-full;
}

.payment-slider {
    @apply w-full;
}

.slider-value {
    @apply inline-flex items-center justify-center;
    @apply min-w-[2.5rem] px-2 py-0.5;
    @apply text-lg font-bold text-gray-900;
    @apply bg-gray-100 rounded-md;
    @apply border border-gray-200;
}

.payment-select {
    @apply w-full;
}

/* Estilos para overlay de información de descuentos */
.descuentos-info-overlay {
    max-width: 400px;
}

.descuentos-info-overlay :deep(.p-overlaypanel-content) {
    padding: 1rem !important;
}

.descuentos-info-content {
    display: flex;
    flex-direction: column;
}

.descuentos-info-title {
    @apply mb-3;
    font-size: 0.9375rem;
}

.descuentos-info-list {
    @apply list-disc pl-6 space-y-2;
    margin: 0;
}

.descuentos-info-item {
    @apply text-sm;
    line-height: 1.6;
}

.descuentos-info-item b {
    font-weight: 600;
}

.descuentos-info-sublist {
    @apply list-disc pl-5 mt-1 space-y-1;
    font-size: 0.875rem;
}

.descuentos-info-sublist li {
    @apply text-xs;
    line-height: 1.5;
}

</style>
