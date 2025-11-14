<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { useSimuladorStore } from '@/stores/simuladorStore'
import { formatCurrency } from '@/utils/formatters'
import type { FormData } from '@/types/simulador'
import { useProspectos } from '@/composables/useProspectos'
import { Award, CheckCircle, FileText, Download } from 'lucide-vue-next'
import html2pdf from 'html2pdf.js'
import Button from 'primevue/button'

// Props
interface Props {
    formData?: Partial<FormData>
}

const props = defineProps<Props>()

// Store y servicios
const simuladorStore = useSimuladorStore()
const { insertarProspecto, error: prospectoError } = useProspectos()

// Estado
const isLoading = ref(false)
const error = ref<string | null>(null)
const pdfContentRef = ref<HTMLElement | null>(null)
const isGeneratingPDF = ref(false)

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

// Computed para becas del estado elegibles
const becasEstadoElegibles = computed(() => {
    return simuladorStore.becasStore.becasElegiblesEstado || []
})

// Computed para becas del estado aplicadas (solo las elegibles)
const becasEstadoAplicadas = computed(() => {
    return becasEstadoElegibles.value.filter(b => b.elegible)
})

// Computed para becas del estado con montos calculados
const becasEstadoConMontos = computed(() => {
    if (!calculoBecas.value || becasEstadoAplicadas.value.length === 0) return []

    let arancelActual = calculoBecas.value.arancel_base
    const becasConMontos = becasEstadoAplicadas.value.map(becaEstado => {
        let montoDescuento = 0
        if (becaEstado.beca.tipo_descuento === 'porcentaje' && becaEstado.descuento_aplicado) {
            montoDescuento = (arancelActual * becaEstado.descuento_aplicado) / 100
        } else if (becaEstado.beca.tipo_descuento === 'monto_fijo' && becaEstado.monto_descuento) {
            montoDescuento = becaEstado.monto_descuento
        }
        arancelActual -= montoDescuento
        return {
            ...becaEstado,
            monto_descuento: montoDescuento
        }
    })

    return becasConMontos
})

// Computed para calcular descuento total de becas del estado
const descuentoBecasEstado = computed(() => {
    return becasEstadoConMontos.value.reduce((total, beca) => total + beca.monto_descuento, 0)
})

// Computed para arancel después de aplicar becas del estado
const arancelDespuesBecasEstado = computed(() => {
    if (!calculoBecas.value) return 0
    return calculoBecas.value.arancel_base - descuentoBecasEstado.value
})

// Computed para descuento total (becas del estado + becas internas) - sin CAE
const descuentoTotalReal = computed(() => {
    if (!calculoBecas.value) return 0
    return descuentoBecasEstado.value + calculoBecas.value.descuento_total
})

// Computed para obtener arancel referencia CAE
const arancelReferenciaCae = computed(() => {
    if (!formData.value.carrera || !formData.value.planeaUsarCAE) return 0
    return simuladorStore.carrerasStore.obtenerArancelReferenciaCae(formData.value.carrera) || 0
})

// Computed para arancel después de becas internas (remanente antes de CAE)
const arancelDespuesBecasInternas = computed(() => {
    if (!calculoBecas.value) return 0
    return calculoBecas.value.arancel_final
})

// Computed para descuento CAE aplicado
const descuentoCae = computed(() => {
    if (arancelReferenciaCae.value === 0) return 0
    return Math.min(arancelReferenciaCae.value, arancelDespuesBecasInternas.value)
})

// Computed para arancel después de aplicar CAE
const arancelDespuesCae = computed(() => {
    return Math.max(0, arancelDespuesBecasInternas.value - descuentoCae.value)
})

// Computed para arancel final real (incluye descuento CAE)
const arancelFinalReal = computed(() => {
    return arancelDespuesCae.value
})

// Computed para descuento total real (incluye CAE)
const descuentoTotalRealConCae = computed(() => {
    if (!calculoBecas.value) return 0
    return descuentoBecasEstado.value + calculoBecas.value.descuento_total + descuentoCae.value
})

// Porcentaje total de descuento aplicado sobre el arancel base
const descuentoPorcentualTotal = computed(() => {
    if (!calculoBecas.value) return 0
    const base = calculoBecas.value.arancel_base
    if (!base || base <= 0) return 0
    return Math.round((descuentoTotalRealConCae.value / base) * 100)
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

        const prospectoGuardado = await insertarProspecto(simuladorStore.formData as FormData)
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

// Método para exportar PDF
const handleExportPDF = async () => {
    try {
        if (!pdfContentRef.value) {
            console.warn('No se encontró el elemento a capturar')
            return
        }

        // Ocultar el botón durante la generación
        isGeneratingPDF.value = true

        // Esperar un momento para que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 100))

        // Configuración para html2pdf.js
        const options = {
            margin: [10, 10, 10, 10],
            filename: 'simulacion-uniacc.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' as const,
                compress: true
            },
            pagebreak: { 
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.page-break-before',
                after: '.page-break-after',
                avoid: ['.no-break', 'table', 'tr']
            }
        }

        // Generar PDF directamente desde HTML
        await html2pdf().set(options).from(pdfContentRef.value).save()
    } catch (e) {
        console.error('No se pudo generar el PDF:', e)
    } finally {
        // Restaurar el botón después de la generación
        isGeneratingPDF.value = false
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
                                    <th class="table-header text-center">Tipo</th>
                                    <th class="table-header text-center">Descuento</th>
                                    <th class="table-header text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="table-row base-row">
                                    <td class="table-cell font-semibold">Arancel Base</td>
                                    <td class="table-cell text-center text-gray-500">-</td>
                                    <td class="table-cell text-center text-gray-500">-</td>
                                    <td class="table-cell text-right font-semibold">
                                        {{ formatCurrency(calculoBecas?.arancel_base || 0) }}
                                    </td>
                                </tr>

                                <template v-if="becasEstadoConMontos.length > 0">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Beneficios del Estado
                                            <i v-tooltip="'Según tus datos, podrías optar a estos beneficios estatales'"
                                                class="pi pi-question-circle section-tooltip-icon"></i>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr v-for="becaEstado in becasEstadoConMontos" :key="`estado-${becaEstado.beca.id}`"
                                        class="table-row benefit-row estado-row">
                                        <td class="table-cell">
                                            <div class="benefit-name">
                                                <i class="pi pi-star-fill text-purple-600 mr-2"></i>
                                                {{ becaEstado.beca.nombre || 'Beca del Estado' }}
                                            </div>
                                        </td>
                                        <td class="table-cell text-center">
                                            <span class="badge-type badge-estado">
                                                {{ becaEstado.beca.tipo_descuento === 'porcentaje' ? 'Porcentaje' :
                                                    becaEstado.beca.tipo_descuento === 'monto_fijo' ? 'Monto Fijo' : 'Mixto'
                                                }}
                                            </span>
                                        </td>
                                        <td class="table-cell text-center">
                                            <span v-if="becaEstado.beca.tipo_descuento === 'porcentaje'"
                                                class="discount-percentage">
                                                {{ becaEstado.descuento_aplicado }}%
                                            </span>
                                            <span v-else class="text-gray-500">-</span>
                                        </td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(becaEstado.monto_descuento) }}
                                        </td>
                                    </tr>
                                    <tr class="table-row subtotal-row subtotal-estado-row">
                                        <td class="table-cell font-semibold" colspan="3">
                                            Subtotal después de Beneficios del Estado
                                        </td>
                                        <td class="table-cell text-right font-semibold">
                                            {{ formatCurrency(arancelDespuesBecasEstado) }}
                                        </td>
                                    </tr>
                                </template>

                                <template v-if="becasAplicadas.length > 0">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Beneficios Internos (UNIACC)
                                            <i v-tooltip="'Además, calificas para los siguientes beneficios UNIACC'"
                                                class="pi pi-question-circle section-tooltip-icon"></i>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr v-for="beca in becasAplicadas" :key="`interno-${beca.beca.id}`"
                                        class="table-row benefit-row interno-row">
                                        <td class="table-cell">
                                            <div class="benefit-name">
                                                <i class="pi pi-star mr-2 text-blue-600"></i>
                                                {{ beca.beca.nombre }}
                                            </div>
                                        </td>
                                        <td class="table-cell text-center">
                                            <span class="badge-type">
                                                {{ beca.beca.tipo_descuento === 'porcentaje' ? 'Porcentaje' :
                                                    beca.beca.tipo_descuento === 'monto_fijo' ? 'Monto Fijo' : 'Mixto' }}
                                            </span>
                                        </td>
                                        <td class="table-cell text-center">
                                            <span v-if="beca.beca.tipo_descuento === 'porcentaje'"
                                                class="discount-percentage">
                                                {{ beca.descuento_aplicado }}%
                                            </span>
                                            <span v-else class="text-gray-500">
                                                Monto Fijo
                                            </span>
                                        </td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(beca.monto_descuento) }}
                                        </td>
                                    </tr>
                                    <tr class="table-row subtotal-row subtotal-interno-row">
                                        <td class="table-cell font-semibold" colspan="3">
                                            Subtotal después de Beneficios Internos
                                        </td>
                                        <td class="table-cell text-right font-semibold">
                                            {{ formatCurrency(arancelDespuesBecasInternas) }}
                                        </td>
                                    </tr>
                                </template>

                                <template v-if="arancelReferenciaCae > 0">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Arancel Referencia CAE
                                            <i v-tooltip="'El arancel restante puede ser financiado con CAE'"
                                                class="pi pi-question-circle section-tooltip-icon"></i>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr class="table-row benefit-row cae-row">
                                        <td class="table-cell">
                                            <div class="benefit-name">
                                                <i class="pi pi-briefcase mr-2 text-orange-600"></i>
                                                Descuento por Arancel Referencia CAE
                                            </div>
                                        </td>
                                        <td class="table-cell text-center">
                                            <span class="badge-type badge-cae">Monto Fijo</span>
                                        </td>
                                        <td class="table-cell text-center text-gray-500">-</td>
                                        <td class="table-cell text-right font-semibold text-red-600">
                                            -{{ formatCurrency(descuentoCae) }}
                                        </td>
                                    </tr>
                                    <tr class="table-row subtotal-row subtotal-cae-row">
                                        <td class="table-cell font-semibold" colspan="3">
                                            Subtotal después de Arancel Referencia CAE
                                        </td>
                                        <td class="table-cell text-right font-semibold">
                                            {{ formatCurrency(arancelDespuesCae) }}
                                        </td>
                                    </tr>
                                </template>

                                <template
                                    v-if="formData?.usaBecasEstado && becasEstadoElegibles.length > 0 && becasEstadoAplicadas.length === 0">
                                    <tr class="table-row section-header-row">
                                        <td class="table-cell section-title">
                                            Beneficios del Estado
                                            <i v-tooltip="'Según tus datos, podrías optar a estos beneficios estatales'"
                                                class="pi pi-question-circle section-tooltip-icon"></i>
                                        </td>
                                        <td></td>
                                        <td></td>   
                                        <td></td>
                                    </tr>
                                    <tr class="table-row info-row">
                                        <td class="table-cell text-sm text-gray-600 italic" colspan="4">
                                            No cumples con los requisitos para las becas del estado disponibles
                                        </td>
                                    </tr>
                                </template>

                                <tr class="table-row discount-total-row">
                                    <td class="table-cell font-semibold" colspan="3">
                                        Total Descuentos Aplicados
                                    </td>
                                    <td class="table-cell text-right font-bold text-red-600">
                                        -{{ formatCurrency(descuentoTotalRealConCae) }}
                                    </td>
                                </tr>
                                <tr class="table-row final-row">
                                    <td class="table-cell font-bold text-lg" colspan="3">
                                        Arancel Final a Pagar
                                    </td>
                                    <td class="table-cell text-right font-bold text-lg text-green-600">
                                        {{ formatCurrency(arancelFinalReal) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </Card>

            <!-- Resumen financiero -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card class="summary-item">
                    <template #content>
                        <div class="text-center">
                            <div class="text-sm text-gray-600 mb-2">Arancel Original</div>
                            <div class="text-2xl font-bold text-gray-900">
                                {{ formatCurrency(calculoBecas?.arancel_base || 0) }}
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="summary-item discount">
                    <template #content>
                        <div class="text-center">
                            <div class="text-sm text-gray-600 mb-2">Descuento Total</div>
                            <div class="text-2xl font-bold text-red-600">
                                -{{ formatCurrency(descuentoTotalRealConCae) }}
                            </div>
                        </div>
                    </template>
                </Card>

                <Card class="summary-item final">
                    <template #content>
                        <div class="text-center">
                            <div class="text-sm text-gray-600 mb-2">Arancel Final</div>
                            <div class="text-2xl font-bold text-green-600">
                                {{ formatCurrency(arancelFinalReal) }}
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Becas aplicadas -->
            <div v-if="becasAplicadas.length || becasEstadoConMontos.length" class="benefits-section">
                <h3 class="benefits-section-title">
                    <Award class="w-6 h-6" />
                    Becas Aplicadas
                </h3>

                <!-- Becas del Estado Aplicadas -->
                <div v-if="becasEstadoConMontos.length" class="benefits-subsection">
                    <h4 class="subsection-title">
                        <Award class="w-5 h-5 text-purple-600" />
                        Beneficios del Estado
                    </h4>
                    <div class="benefits-grid">
                        <div
                            v-for="becaEstado in becasEstadoConMontos"
                            :key="`estado-${becaEstado.beca.id}`"
                            class="benefit-card benefit-card-estado"
                        >
                            <div class="benefit-header">
                                <div class="benefit-icon">
                                    <CheckCircle class="w-5 h-5 text-purple-600" />
                                </div>
                                <div class="benefit-info">
                                    <h4 class="benefit-title">{{ becaEstado.beca.nombre || 'Beca del Estado' }}</h4>
                                    <p class="benefit-type">{{ becaEstado.beca.tipo_descuento || 'Descuento' }}</p>
                                </div>
                            </div>
                            <div class="benefit-details">
                                <div class="benefit-discount">
                                    <span class="discount-label">Descuento:</span>
                                    <span class="discount-value">
                                        {{ becaEstado.beca.tipo_descuento === 'porcentaje'
                                            ? `${becaEstado.descuento_aplicado}%`
                                            : formatCurrency(becaEstado.beca.descuento_monto || 0) }}
                                    </span>
                                </div>
                                <div class="benefit-applied">
                                    <span class="applied-label">Aplicado:</span>
                                    <span class="applied-value">{{ formatCurrency(becaEstado.monto_descuento) }}</span>
                                </div>
                            </div>
                            <div v-if="becaEstado.beca.descripcion" class="benefit-description">
                                <p class="description-text">{{ becaEstado.beca.descripcion }}</p>
                            </div>
                        </div>
                    </div>
                </div>

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
                La simulación es referencial; un asesor te confirma el monto final.
            </Message>
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
    @apply border-red-200 bg-red-50;
}

.summary-item.final {
    @apply border-green-200 bg-green-50;
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

.results-table tbody tr:hover:not(.section-header-row):not(.base-row) {
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

.table-cell {
    @apply px-4 py-3 text-sm text-gray-900;
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
</style>
