<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  DollarSign,
  Minus,
  TrendingUp,
  Award,
  Info,
  XCircle,
  RotateCcw,
  Share,
  Download,
  GraduationCap,
  BookOpen,
  Calendar,
  MapPin
} from 'lucide-vue-next'
import type { SimulationResults } from '@/types/simulador'
import { formatCurrency } from '@/utils/formatters'
import { useSimuladorStore } from '@/stores/simuladorStore'
import { useProspectos } from '@/composables/useProspectos'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Props
interface Props {
  results: SimulationResults | null
  error?: string | null
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'new-simulation': []
  share: []
  'export-pdf': []
}>()

// Store
const simuladorStore = useSimuladorStore()
const { insertarProspecto, error: insertError } = useProspectos()

// Ref para el elemento a capturar
const pdfContentRef = ref<HTMLElement | null>(null)

// Computed
const calculoBecas = computed(() => simuladorStore.calculoBecas)
const formData = computed(() => simuladorStore.formData)

// Computed para información de la carrera
const carreraInfo = computed(() => {
  if (!formData.value.carrera) return null
  return simuladorStore.carrerasStore.obtenerCarreraPorNombre(formData.value.carrera)
})

// Computed para becas aplicadas
const becasAplicadas = computed(() => {
  return calculoBecas.value?.becas_aplicadas || []
})

// Computed para becas no elegibles
const becasNoElegibles = computed(() => {
  if (!simuladorStore.becasStore.becas) return []
  const aplicadas = becasAplicadas.value.map(b => b.beca.codigo_beca)
  return simuladorStore.becasStore.becas
    .filter(beca => !aplicadas.includes(beca.codigo_beca))
    .map(beca => ({
      beca,
      elegible: false,
      razon: 'No cumple con los requisitos',
      descuento_aplicado: 0,
      monto_descuento: 0
    }))
})

// Computed para becas disponibles para estudiantes de enseñanza media
const becasDisponiblesMedia = computed(() => {
  if (!esEstudianteSinResultados.value) return []

  // Filtrar becas que podrían aplicar para estudiantes de enseñanza media
  return simuladorStore.becasStore.becas
    .filter(beca => {
      // Beca Apoyo Regional - aplica automáticamente si está fuera de RM
      if (beca.nombre.toLowerCase().includes('apoyo regional') || beca.nombre.toLowerCase().includes('regional')) {
        return formData.value.regionId !== 13
      }

      // Beca STEM - aplica para mujeres en Ingeniería Informática Multimedia
      if (beca.nombre.toLowerCase().includes('stem')) {
        return formData.value.genero === 'Femenino' &&
               formData.value.carrera.toLowerCase().includes('ingeniería') &&
               formData.value.carrera.toLowerCase().includes('informática') &&
               formData.value.carrera.toLowerCase().includes('multimedia')
      }

      // Beca Egresados UNIACC - no aplica para estudiantes de enseñanza media
      if (beca.nombre.toLowerCase().includes('egresados uniacc')) {
        return false
      }

      // Otras becas que no requieren NEM/PAES
      return !beca.nombre.toLowerCase().includes('mérito') &&
             !beca.nombre.toLowerCase().includes('paes') &&
             !beca.nombre.toLowerCase().includes('nem')
    })
    .map(beca => {
      let razon = ''
      let elegible = false

      // Beca Apoyo Regional
      if (beca.nombre.toLowerCase().includes('apoyo regional') || beca.nombre.toLowerCase().includes('regional')) {
        if (formData.value.regionId !== 13) {
          elegible = true
          razon = 'Elegible por residir fuera de Región Metropolitana'
        } else {
          razon = 'Solo aplica para estudiantes de regiones (fuera de RM)'
        }
      }

      // Beca STEM
      else if (beca.nombre.toLowerCase().includes('stem')) {
        if (formData.value.genero === 'Femenino' &&
            formData.value.carrera.toLowerCase().includes('ingeniería') &&
            formData.value.carrera.toLowerCase().includes('informática') &&
            formData.value.carrera.toLowerCase().includes('multimedia')) {
          elegible = true
          razon = 'Elegible por ser mujer en Ingeniería Informática Multimedia'
        } else {
          razon = 'Solo aplica para mujeres en Ingeniería Informática Multimedia'
        }
      }

      // Otras becas
      else {
        elegible = true
        razon = 'Disponible para tu perfil actual'
      }

      return {
        beca,
        elegible,
        razon,
        descuento_aplicado: elegible ? beca.descuento_porcentaje : 0,
        monto_descuento: 0
      }
    })
})

// Computed para porcentaje de ahorro
const porcentajeAhorro = computed(() => {
  if (!calculoBecas.value) return 0
  const { arancel_base, ahorro_total } = calculoBecas.value
  return arancel_base > 0 ? Math.round((ahorro_total / arancel_base) * 100) : 0
})

// Computed para detectar si es estudiante sin NEM/PAES
const esEstudianteSinResultados = computed(() => {
  return formData.value.nivelEducativo !== 'Egresado' ||
         (!formData.value.nem && !formData.value.rendioPAES)
})

// Computed para mensaje personalizado
const mensajePersonalizado = computed(() => {
  if (esEstudianteSinResultados.value) {
    const esEstudianteMedia = formData.value.nivelEducativo !== 'Egresado'

    return {
      titulo: '¡HAS FINALIZADO!',
      saludo: `¡Felicidades, ${formData.value.nombre}!`,
      email: formData.value.email,
      mensaje: esEstudianteMedia
        ? '¡Felicidades! Con los datos que ingresaste, podrías optar a las siguientes becas y beneficios. ¡Mantén tu motivación y sigue estudiando!'
        : 'Según los datos que nos brindaste, cuentas con los requisitos para postular. Pregunta tu beca o beneficio al 600 401 00 60',
      puntaje: null,
      explicacion: esEstudianteMedia
        ? 'Basándonos en tu perfil actual, te mostramos las becas a las que podrías acceder. Cuando tengas tus resultados NEM y PAES, podrás realizar una simulación más completa con todas las becas disponibles.'
        : 'Como aún no tienes NEM ni PAES, no podemos calcular con precisión todas las becas disponibles. Te invitamos a realizar una nueva simulación cuando tengas estos resultados para obtener un cálculo más completo.'
    }
  }
  return null
})

// Métodos
const handleNewSimulation = () => {
  emit('new-simulation')
}

const handleShare = () => {
  emit('share')
}

const handleExportPDF = async () => {
  try {
    if (!pdfContentRef.value) {
      console.warn('No se encontró el elemento a capturar')
      return
    }

    // Capturar el elemento como imagen
    const canvas = await html2canvas(pdfContentRef.value, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    let position = 0

    // Agregar primera página
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Agregar páginas adicionales si el contenido es más alto
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      doc.addPage()
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    doc.save('simulacion-uniacc.pdf')
  } catch (e) {
    console.warn('No se pudo generar el PDF:', e)
  }
}

// Guardar prospecto al montar el step de resultados
onMounted(async () => {
  try {
    // Insertar usando los datos actuales del formulario
    await insertarProspecto(formData.value)
    if (insertError.value) {
      console.warn('No se pudo guardar el prospecto:', insertError.value)
    }
  } catch (e) {
    console.warn('Fallo al guardar prospecto:', e)
  }
})
</script>

<template>
  <div class="results-step p-8 animate-fade-in min-h-full bg-white">
    <div ref="pdfContentRef" class="step-content">
      <!-- Header de resultados -->
      <div class="results-header">
        <div v-if="mensajePersonalizado" class="personalized-header">
          <div class="banner">
            <span class="banner-text">{{ mensajePersonalizado.titulo }}</span>
          </div>
          <h2 class="personalized-title">{{ mensajePersonalizado.saludo }}</h2>
          <p class="personalized-email">{{ mensajePersonalizado.email }}</p>
          <p class="personalized-message">{{ mensajePersonalizado.mensaje }}</p>
          <div class="explanation-card">
            <Info class="w-5 h-5 text-blue-600" />
            <p class="explanation-text">{{ mensajePersonalizado.explicacion }}</p>
          </div>
        </div>
        <div v-else class="standard-header">
          <div class="success-icon">
            <CheckCircle class="w-16 h-16 text-green-600" />
          </div>
          <h2 class="results-title">¡Simulación Completada!</h2>
          <p class="results-description">
            Aquí tienes los beneficios y descuentos que puedes obtener en UNIACC
          </p>
        </div>
      </div>

      <!-- Información de la carrera -->
      <div v-if="carreraInfo" class="career-info">
        <h3 class="section-title">
          <GraduationCap class="w-6 h-6" />
          Información de la Carrera
        </h3>
        <div class="career-card">
          <div class="career-header">
            <div class="career-title">
              <h4 class="career-name">{{ carreraInfo.nombre_programa }}</h4>
              <p class="career-degree">{{ carreraInfo.nivel_academico }}</p>
            </div>
            <div class="career-faculty">
              <BookOpen class="w-5 h-5 text-blue-600" />
              <span>{{ carreraInfo.modalidad_programa }}</span>
            </div>
          </div>
          <div class="career-details">
            <div class="career-detail">
              <Calendar class="w-4 h-4" />
              <span>{{ carreraInfo.duracion_programa }}</span>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Resumen financiero -->
      <div class="financial-summary">
        <h3 class="summary-title">Resumen Financiero</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-header">
              <DollarSign class="w-6 h-6 text-blue-600" />
              <h4 class="card-title">Arancel Original</h4>
            </div>
            <div class="card-value">
              {{ formatCurrency(calculoBecas?.arancel_base || 0) }}
            </div>
          </div>

          <div class="summary-card discount">
            <div class="card-header">
              <Minus class="w-6 h-6 text-red-600" />
              <h4 class="card-title">Descuento Total</h4>
            </div>
            <div class="card-value">
              -{{ formatCurrency(calculoBecas?.descuento_total || 0) }}
            </div>
          </div>

          <div class="summary-card final">
            <div class="card-header">
              <CheckCircle class="w-6 h-6 text-green-600" />
              <h4 class="card-title">Arancel Final</h4>
            </div>
            <div class="card-value">
              {{ formatCurrency(calculoBecas?.arancel_final || 0) }}
            </div>
          </div>
        </div>

        <!-- Ahorro total -->
        <div class="savings-card">
          <div class="savings-content">
            <div class="savings-icon">
              <TrendingUp class="w-8 h-8 text-green-600" />
            </div>
            <div class="savings-text">
              <h4 class="savings-title">¡Ahorras {{ formatCurrency(calculoBecas?.ahorro_total || 0) }}!</h4>
              <p class="savings-subtitle">
                {{ porcentajeAhorro }}% de descuento total
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Becas aplicadas -->
      <div v-if="becasAplicadas.length" class="benefits-section">
        <h3 class="section-title">
          <Award class="w-6 h-6" />
          Becas Aplicadas
        </h3>
        <div class="benefits-grid">
          <div
            v-for="beca in becasAplicadas"
            :key="beca.beca.id"
            class="benefit-card"
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
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay becas aplicadas -->
      <div v-else-if="esEstudianteSinResultados" class="no-benefits-section">
        <div class="no-benefits-card">
          <div class="no-benefits-icon">
            <Info class="w-12 h-12 text-blue-600" />
          </div>
          <h3 class="no-benefits-title">Información Importante</h3>
          <p class="no-benefits-message">
            Para calcular con precisión las becas y descuentos disponibles, necesitamos tus resultados académicos (NEM y PAES).
            Una vez que tengas estos datos, podrás realizar una simulación más completa.
          </p>
          <div class="no-benefits-actions">
            <Button
              variant="outline"
              size="lg"
              @click="handleNewSimulation"
              class="retry-button"
            >
              <RotateCcw class="w-5 h-5 mr-2" />
              Simular cuando tenga mis resultados
            </Button>
          </div>
        </div>
      </div>

      <!-- Becas disponibles para estudiantes de enseñanza media -->
      <div v-if="esEstudianteSinResultados && becasDisponiblesMedia.length" class="benefits-section">
        <h3 class="section-title">
          <Award class="w-6 h-6" />
          Becas Disponibles para Ti
        </h3>
        <div class="benefits-grid">
          <div
            v-for="beca in becasDisponiblesMedia"
            :key="beca.beca.id"
            :class="['benefit-card', beca.elegible ? 'available' : 'disabled']"
          >
            <div class="benefit-header">
              <div class="benefit-icon">
                <CheckCircle v-if="beca.elegible" class="w-5 h-5 text-green-500" />
                <XCircle v-else class="w-5 h-5 text-gray-400" />
              </div>
              <div class="benefit-info">
                <h4 class="benefit-title">{{ beca.beca.nombre }}</h4>
                <p class="benefit-type">{{ beca.beca.proceso_evaluacion }} • {{ beca.beca.tipo_descuento }}</p>
                <p v-if="beca.elegible" class="benefit-discount">
                  {{ beca.descuento_aplicado }}% de descuento
                </p>
              </div>
            </div>
            <div class="benefit-reason">
              <span class="reason-label">{{ beca.elegible ? '¡Elegible!' : 'Requisito:' }}</span>
              <span class="reason-text">{{ beca.razon }}</span>
            </div>
            <div v-if="beca.beca.descripcion" class="benefit-description">
              <p class="description-text">{{ beca.beca.descripcion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Becas no elegibles para egresados -->
      <div v-else-if="!esEstudianteSinResultados && becasNoElegibles.length" class="benefits-section">
        <h3 class="section-title">
          <Info class="w-6 h-6" />
          Otras Becas Disponibles
        </h3>
        <div class="benefits-grid">
          <div
            v-for="beca in becasNoElegibles"
            :key="beca.beca.id"
            class="benefit-card disabled"
          >
            <div class="benefit-header">
              <div class="benefit-icon">
                <XCircle class="w-5 h-5 text-gray-400" />
              </div>
              <div class="benefit-info">
                <h4 class="benefit-title">{{ beca.beca.nombre }}</h4>
                <p class="benefit-type">{{ beca.beca.proceso_evaluacion }} • {{ beca.beca.tipo_descuento }}</p>
              </div>
            </div>
            <div class="benefit-reason">
              <span class="reason-label">Razón:</span>
              <span class="reason-text">{{ beca.razon }}</span>
            </div>
            <div v-if="beca.beca.descripcion" class="benefit-description">
              <p class="description-text">{{ beca.beca.descripcion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Información del decil -->
      <div v-if="formData.decil" class="decil-info">
        <div class="decil-card">
          <div class="decil-header">
            <TrendingUp class="w-6 h-6 text-blue-600" />
            <h4 class="decil-title">Tu Decil Socioeconómico</h4>
          </div>
          <div class="decil-content">
            <div class="decil-number">{{ formData.decil }}° Decil</div>
            <p class="decil-description">
              Este decil se utilizó para calcular tus beneficios y descuentos disponibles
            </p>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="actions-section">
        <div class="actions-grid">
          <Button
            variant="outline"
            size="lg"
            @click="handleNewSimulation"
            class="action-button"
          >
            <RotateCcw class="w-5 h-5 mr-2" />
            Nueva Simulación
          </Button>

          <Button
            variant="outline"
            size="lg"
            @click="handleShare"
            class="action-button"
          >
            <Share class="w-5 h-5 mr-2" />
            Compartir
          </Button>

          <Button
            variant="outline"
            size="lg"
            @click="handleExportPDF"
            class="action-button"
          >
            <Download class="w-5 h-5 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="additional-info">
        <div class="info-card">
          <Info class="w-5 h-5 text-blue-600" />
          <div class="info-content">
            <h4 class="info-title">Próximos Pasos</h4>
            <ul v-if="esEstudianteSinResultados" class="info-list">
              <li>• Contacta a admisiones para validar tu perfil</li>
              <li>• Prepara la documentación necesaria</li>
              <li>• Postula a UNIACC en el período correspondiente</li>
              <li>• Realiza una nueva simulación cuando tengas tus resultados NEM y PAES</li>
            </ul>
            <ul v-else class="info-list">
              <li>• Contacta a admisiones para validar tu perfil</li>
              <li>• Revisa los requisitos específicos de cada beneficio</li>
              <li>• Prepara la documentación necesaria</li>
              <li>• Postula a UNIACC en el período correspondiente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-step {
  @apply max-w-6xl mx-auto;
}

.step-content {
  @apply space-y-8;
}

.results-header {
  @apply text-center py-8;
}

.standard-header {
  @apply text-center;
}

.success-icon {
  @apply mb-4;
}

.results-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.results-description {
  @apply text-lg text-gray-600;
}

.personalized-header {
  @apply text-center space-y-4;
}

.banner {
  @apply bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold text-lg;
}

.personalized-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.personalized-email {
  @apply text-lg text-gray-600 mb-4;
}

.personalized-message {
  @apply text-lg text-gray-700 mb-6;
}

.explanation-card {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 max-w-2xl mx-auto;
}

.explanation-text {
  @apply text-sm text-blue-800 flex-1;
}

.financial-summary {
  @apply space-y-6;
}

.summary-title {
  @apply text-2xl font-bold text-gray-900 text-center mb-6;
}

.summary-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.summary-card {
  @apply bg-white border border-gray-200 rounded-lg p-6 text-center;
}

.summary-card.discount {
  @apply border-red-200 bg-red-50;
}

.summary-card.final {
  @apply border-green-200 bg-green-50;
}

.card-header {
  @apply flex items-center justify-center space-x-2 mb-4;
}

.card-title {
  @apply text-sm font-medium text-gray-600;
}

.card-value {
  @apply text-2xl font-bold text-gray-900;
}

.summary-card.discount .card-value {
  @apply text-red-600;
}

.summary-card.final .card-value {
  @apply text-green-600;
}

.savings-card {
  @apply bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6;
}

.savings-content {
  @apply flex items-center space-x-4;
}

.savings-icon {
  @apply flex-shrink-0;
}

.savings-text {
  @apply flex-1;
}

.savings-title {
  @apply text-xl font-bold text-green-900 mb-1;
}

.savings-subtitle {
  @apply text-sm text-green-700;
}

.career-info {
  @apply space-y-6;
}

.career-card {
  @apply bg-white border border-gray-200 rounded-lg p-6;
}

.career-header {
  @apply flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4;
}

.career-title {
  @apply flex-1;
}

.career-name {
  @apply text-xl font-bold text-gray-900 mb-1;
}

.career-degree {
  @apply text-sm text-gray-600;
}

.career-faculty {
  @apply flex items-center space-x-2 text-sm text-blue-600;
}

.career-details {
  @apply flex flex-wrap gap-4 mt-4;
}

.career-detail {
  @apply flex items-center space-x-2 text-sm text-gray-600;
}

.benefits-section {
  @apply space-y-6;
}

.no-benefits-section {
  @apply space-y-6;
}

.no-benefits-card {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-8 text-center;
}

.no-benefits-icon {
  @apply mb-4;
}

.no-benefits-title {
  @apply text-xl font-bold text-blue-900 mb-4;
}

.no-benefits-message {
  @apply text-lg text-blue-800 mb-6 max-w-2xl mx-auto;
}

.no-benefits-actions {
  @apply flex justify-center;
}

.retry-button {
  @apply bg-blue-600 text-white hover:bg-blue-700 border-blue-600;
}

.section-title {
  @apply flex items-center space-x-2 text-xl font-bold text-gray-900 mb-4;
}

.benefits-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.benefit-card {
  @apply bg-white border border-gray-200 rounded-lg p-4;
}

.benefit-card.disabled {
  @apply bg-gray-50 border-gray-200;
}

.benefit-card.available {
  @apply bg-green-50 border-green-200;
}

.benefit-discount {
  @apply text-green-600 font-semibold text-sm mt-1;
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

.benefit-reason {
  @apply text-sm;
}

.reason-label {
  @apply font-medium text-gray-600;
}

.reason-text {
  @apply text-gray-500;
}

.benefit-description {
  @apply mt-3 pt-3 border-t border-gray-200;
}

.description-text {
  @apply text-sm text-gray-600;
}

.decil-info {
  @apply mt-8;
}

.decil-card {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-6;
}

.decil-header {
  @apply flex items-center space-x-3 mb-4;
}

.decil-title {
  @apply text-lg font-semibold text-blue-900;
}

.decil-content {
  @apply text-center;
}

.decil-number {
  @apply text-3xl font-bold text-blue-900 mb-2;
}

.decil-description {
  @apply text-sm text-blue-800;
}

.actions-section {
  @apply mt-8;
}

.actions-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.action-button {
  @apply w-full justify-center;
}

.additional-info {
  @apply mt-8;
}

.info-card {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3;
}

.info-content {
  @apply flex-1;
}

.info-title {
  @apply text-sm font-semibold text-blue-900 mb-3;
}

.info-list {
  @apply space-y-1 text-sm text-blue-800;
}

/* Animaciones */
.summary-card {
  @apply transform transition-all duration-300;
}

.summary-card:hover {
  @apply scale-105 shadow-lg;
}

.benefit-card {
  @apply transform transition-all duration-200;
}

.benefit-card:hover {
  @apply scale-105;
}

.action-button {
  @apply transform transition-all duration-200;
}

.action-button:hover {
  @apply scale-105;
}

/* Responsive */
@media (max-width: 768px) {
  .summary-grid {
    @apply grid-cols-1;
  }

  .benefits-grid {
    @apply grid-cols-1;
  }

  .actions-grid {
    @apply grid-cols-1;
  }

  .savings-content {
    @apply flex-col text-center space-x-0 space-y-3;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .results-title {
    @apply text-white;
  }

  .results-description {
    @apply text-gray-300;
  }

  .summary-title {
    @apply text-white;
  }

  .summary-card {
    @apply bg-gray-800 border-gray-700;
  }

  .card-title {
    @apply text-gray-300;
  }

  .card-value {
    @apply text-white;
  }

  .savings-card {
    @apply bg-gradient-to-r from-green-900 to-emerald-900 border-green-700;
  }

  .savings-title {
    @apply text-green-200;
  }

  .savings-subtitle {
    @apply text-green-300;
  }

  .section-title {
    @apply text-white;
  }

  .benefit-card {
    @apply bg-gray-800 border-gray-700;
  }

  .benefit-card.disabled {
    @apply bg-gray-900 border-gray-600;
  }

  .benefit-card.available {
    @apply bg-green-900/20 border-green-700;
  }

  .benefit-discount {
    @apply text-green-400;
  }

  .benefit-title {
    @apply text-white;
  }

  .benefit-type {
    @apply text-gray-400;
  }

  .discount-label,
  .applied-label {
    @apply text-gray-300;
  }

  .discount-value,
  .applied-value {
    @apply text-white;
  }

  .reason-label {
    @apply text-gray-300;
  }

  .reason-text {
    @apply text-gray-400;
  }

  .decil-card {
    @apply bg-blue-900 border-blue-700;
  }

  .decil-title {
    @apply text-blue-200;
  }

  .decil-number {
    @apply text-blue-200;
  }

  .decil-description {
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

  .career-card {
    @apply bg-gray-800 border-gray-700;
  }

  .career-name {
    @apply text-white;
  }

  .career-degree {
    @apply text-gray-300;
  }

  .career-faculty {
    @apply text-blue-400;
  }

  .career-detail {
    @apply text-gray-300;
  }

  .benefit-description {
    @apply border-gray-600;
  }

  .description-text {
    @apply text-gray-300;
  }

  .personalized-title {
    @apply text-white;
  }

  .personalized-email {
    @apply text-gray-300;
  }

  .personalized-message {
    @apply text-gray-200;
  }

  .explanation-card {
    @apply bg-blue-900 border-blue-700;
  }

  .explanation-text {
    @apply text-blue-200;
  }

  .no-benefits-card {
    @apply bg-blue-900 border-blue-700;
  }

  .no-benefits-title {
    @apply text-blue-200;
  }

  .no-benefits-message {
    @apply text-blue-300;
  }

  .retry-button {
    @apply bg-blue-600 text-white hover:bg-blue-700 border-blue-600;
  }
}
</style>
