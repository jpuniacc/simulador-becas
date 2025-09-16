<script setup lang="ts">
import { computed } from 'vue'
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
  Download
} from 'lucide-vue-next'
import type { SimulationResults } from '@/types/simulador'
import { formatCurrency } from '@/utils/formatters'

// Props
interface Props {
  results: SimulationResults | null
  error?: string | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'new-simulation': []
  share: []
  'export-pdf': []
}>()

// Computed
const hasResults = computed(() => !!props.results)

// Métodos
const handleNewSimulation = () => {
  emit('new-simulation')
}

const handleShare = () => {
  emit('share')
}

const handleExportPDF = () => {
  emit('export-pdf')
}
</script>

<template>
  <div class="results-step">
    <div class="step-content">
      <!-- Header de resultados -->
      <div class="results-header">
        <div class="success-icon">
          <CheckCircle class="w-16 h-16 text-green-600" />
        </div>
        <h2 class="results-title">¡Simulación Completada!</h2>
        <p class="results-description">
          Aquí tienes los beneficios y descuentos que puedes obtener en UNIACC
        </p>
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
              {{ formatCurrency(results?.arancelBase || 0) }}
            </div>
          </div>

          <div class="summary-card discount">
            <div class="card-header">
              <Minus class="w-6 h-6 text-red-600" />
              <h4 class="card-title">Descuento Total</h4>
            </div>
            <div class="card-value">
              -{{ formatCurrency(results?.descuentoTotal || 0) }}
            </div>
          </div>

          <div class="summary-card final">
            <div class="card-header">
              <CheckCircle class="w-6 h-6 text-green-600" />
              <h4 class="card-title">Arancel Final</h4>
            </div>
            <div class="card-value">
              {{ formatCurrency(results?.arancelFinal || 0) }}
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
              <h4 class="savings-title">¡Ahorras {{ formatCurrency((results?.arancelBase || 0) - (results?.arancelFinal || 0)) }}!</h4>
              <p class="savings-subtitle">
                {{ Math.round(((results?.arancelBase || 0) - (results?.arancelFinal || 0)) / (results?.arancelBase || 1) * 100) }}% de descuento total
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Beneficios aplicables -->
      <div v-if="results?.beneficiosAplicables?.length" class="benefits-section">
        <h3 class="section-title">
          <Award class="w-6 h-6" />
          Beneficios Aplicables
        </h3>
        <div class="benefits-grid">
          <div
            v-for="beneficio in results.beneficiosAplicables"
            :key="beneficio.id"
            class="benefit-card"
          >
            <div class="benefit-header">
              <div class="benefit-icon">
                <CheckCircle class="w-5 h-5 text-green-600" />
              </div>
              <div class="benefit-info">
                <h4 class="benefit-title">{{ beneficio.descripcion }}</h4>
                <p class="benefit-type">{{ beneficio.tipoBeneficio }} • {{ beneficio.origenBeneficio }}</p>
              </div>
            </div>
            <div class="benefit-details">
              <div class="benefit-discount">
                <span class="discount-label">Descuento:</span>
                <span class="discount-value">
                  {{ beneficio.porcentajeMaximo ? `${beneficio.porcentajeMaximo}%` : formatCurrency(beneficio.montoMaximo || 0) }}
                </span>
              </div>
              <div class="benefit-applied">
                <span class="applied-label">Aplicado:</span>
                <span class="applied-value">{{ formatCurrency(beneficio.descuentoAplicado || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Beneficios no aplicables -->
      <div v-if="results?.beneficiosNoAplicables?.length" class="benefits-section">
        <h3 class="section-title">
          <Info class="w-6 h-6" />
          Otros Beneficios Disponibles
        </h3>
        <div class="benefits-grid">
          <div
            v-for="beneficio in results.beneficiosNoAplicables"
            :key="beneficio.id"
            class="benefit-card disabled"
          >
            <div class="benefit-header">
              <div class="benefit-icon">
                <XCircle class="w-5 h-5 text-gray-400" />
              </div>
              <div class="benefit-info">
                <h4 class="benefit-title">{{ beneficio.descripcion }}</h4>
                <p class="benefit-type">{{ beneficio.tipoBeneficio }} • {{ beneficio.origenBeneficio }}</p>
              </div>
            </div>
            <div class="benefit-reason">
              <span class="reason-label">Razón:</span>
              <span class="reason-text">{{ beneficio.razonElegibilidad }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información del decil -->
      <div class="decil-info">
        <div class="decil-card">
          <div class="decil-header">
            <TrendingUp class="w-6 h-6 text-blue-600" />
            <h4 class="decil-title">Tu Decil Socioeconómico</h4>
          </div>
          <div class="decil-content">
            <div class="decil-number">{{ results?.decilCalculado || 0 }}° Decil</div>
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
            <ul class="info-list">
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

.success-icon {
  @apply mb-4;
}

.results-title {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.results-description {
  @apply text-lg text-gray-600;
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

.benefits-section {
  @apply space-y-6;
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
}
</style>
