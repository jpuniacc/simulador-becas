<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, Check } from 'lucide-vue-next'

const router = useRouter()
const selectedOption = ref<string | null>(null)

interface SegmentOption {
  id: string
  title: string
  subtitle: string
  bullets: string[]
  icon: any
  colorClass: string
  iconBgClass: string
}

const options: SegmentOption[] = [
  {
    id: 'primera-carrera',
    title: 'Pregrado',
    subtitle: 'Comienza tu camino profesional desde cero. Ideal si estás recién egresado de la educación media o buscas cambiar de área completamente.',
    bullets: [
      'Egresados de educación media',
      'Personas sin estudios superiores previos',
      'Quienes buscan iniciar su carrera profesional'
    ],
    icon: GraduationCap,
    colorClass: 'text-uniacc-blue',
    iconBgClass: 'bg-gradient-to-br from-uniacc-blue/10 to-uniacc-blue/5'
  },
  {
    id: 'especializacion',
    title: 'Advance?',
    subtitle: 'Profundiza tus conocimientos y avanza en tu carrera. Perfecto si ya tienes una formación previa y quieres especializarte.',
    bullets: [
      'Profesionales con título técnico o profesional',
      'Quienes buscan especializarse en su área',
      'Personas que quieren continuar estudios superiores'
    ],
    icon: BookOpen,
    colorClass: 'text-uniacc-pink',
    iconBgClass: 'bg-gradient-to-br from-uniacc-pink/10 to-uniacc-pink/5'
  }
]

const selectOption = (optionId: string) => {
  selectedOption.value = optionId
  if (optionId === 'primera-carrera') {
    router.push('/simulador')
  }
  if (optionId === 'especializacion') {
    router.push('/postgrado')
  }
}

const getCardClasses = (option: SegmentOption) => {
  const base = 'segmentation-card'
  const selected = selectedOption.value === option.id ? 'selected' : ''
  const cardType = `card-${option.id}`
  return [base, selected, cardType].filter(Boolean).join(' ')
}
</script>

<template>
  <div class="segmentation-view">
    <div class="segmentation-container">
      <div class="segmentation-header">
        <h2 class="segmentation-title">¿Qué tipo de carrera buscas?</h2>
        <p class="segmentation-subtitle">
          Selecciona la opción que mejor se adapte a tu situación actual
        </p>
      </div>

      <div class="segmentation-cards">
        <Card
          v-for="option in options"
          :key="option.id"
          :class="getCardClasses(option)"
          @click="selectOption(option.id)"
        >
          <CardHeader class="card-header">
            <div class="card-icon-wrapper" :class="option.iconBgClass">
              <component :is="option.icon" :class="[option.colorClass, 'icon']" />
            </div>
            <CardTitle class="card-title">{{ option.title }}</CardTitle>
            <CardDescription class="card-subtitle">
              {{ option.subtitle }}
            </CardDescription>
          </CardHeader>
          <CardContent class="card-content">
            <ul class="card-bullets">
              <li v-for="(bullet, index) in option.bullets" :key="index" class="bullet-item">
                <Check :class="[option.colorClass, 'bullet-icon']" />
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.segmentation-view {
  @apply min-h-screen pb-16 pt-1 px-4 sm:px-8 lg:px-12;
  background-color: #0d0d0d;
}

.segmentation-container {
  @apply max-w-5xl mx-auto;
}

.segmentation-header {
  @apply text-center mb-8;
  position: relative;
  padding-top: 2rem;
}

.segmentation-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(to right,
    #FF6B35 0%,
    #FF6B35 33.33%,
    #4ECDC4 33.33%,
    #4ECDC4 66.66%,
    #FF6B9D 66.66%,
    #FF6B9D 100%);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
}

.segmentation-title {
  @apply text-2xl md:text-3xl lg:text-4xl font-bold mb-4;
  color: #ffffff;
}

.segmentation-subtitle {
  @apply text-base md:text-lg max-w-2xl mx-auto;
  color: rgba(255, 255, 255, 0.8);
}

.segmentation-cards {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8;
}

.segmentation-card {
  @apply cursor-pointer transition-all duration-300;
  @apply border-2 hover:scale-105;
  @apply hover:shadow-xl;
  background-color: #252525;
  border-color: #3a3a3a;
}

.segmentation-card:hover {
  border-color: #0056b3;
  box-shadow: 0 20px 25px -5px rgba(0, 86, 179, 0.2), 0 10px 10px -5px rgba(0, 86, 179, 0.1);
}

.segmentation-card.selected {
  border-color: #0056b3;
  box-shadow: 0 20px 25px -5px rgba(0, 86, 179, 0.3), 0 10px 10px -5px rgba(0, 86, 179, 0.2);
  @apply scale-105;
  @apply ring-4 ring-uniacc-blue/30;
}

.card-header {
  @apply text-center pb-4;
}

.card-icon-wrapper {
  @apply w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center;
  @apply transition-all duration-300;
}

.segmentation-card:hover .card-icon-wrapper {
  @apply scale-110;
}

.segmentation-card.selected .card-icon-wrapper {
  @apply scale-110;
}

.icon {
  @apply w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8;
}

.card-title {
  @apply text-xl md:text-2xl font-bold mb-3;
  color: #ffffff;
}

.card-subtitle {
  @apply text-sm md:text-base leading-relaxed;
  @apply min-h-[4rem];
  color: rgba(255, 255, 255, 0.7);
}

.card-content {
  @apply pt-0;
}

.card-bullets {
  @apply space-y-2 md:space-y-3 list-none;
}

.bullet-item {
  @apply flex items-start gap-3;
  @apply transition-all duration-200;
  @apply text-sm md:text-base;
  color: rgba(255, 255, 255, 0.8);
}

.bullet-item span {
  @apply leading-relaxed;
}

.segmentation-card:hover .bullet-item {
  color: rgba(255, 255, 255, 0.95);
}

.bullet-icon {
  @apply w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0;
}

/* Colores específicos para cada card */
.card-primera-carrera.selected {
  border-color: #0056b3;
}

.card-primera-carrera.selected .card-icon-wrapper {
  background-color: rgba(0, 86, 179, 0.25);
}

.card-especializacion.selected {
  border-color: #e91e63;
}

.card-especializacion.selected .card-icon-wrapper {
  background-color: rgba(233, 30, 99, 0.25);
}

.card-primera-carrera:hover {
  border-color: #0056b3;
}

.card-especializacion:hover {
  border-color: #e91e63;
}

/* Responsive */
@media (max-width: 768px) {
  .segmentation-title {
    @apply text-xl;
  }

  .segmentation-subtitle {
    @apply text-sm;
  }

  .card-title {
    @apply text-lg;
  }

  .card-subtitle {
    @apply text-xs min-h-[3rem];
  }

  .bullet-item {
    @apply text-xs;
  }

  .bullet-icon {
    @apply w-3.5 h-3.5;
  }

  .card-icon-wrapper {
    @apply w-12 h-12 mb-3;
  }

  .icon {
    @apply w-6 h-6;
  }

  .segmentation-card {
    @apply hover:scale-100;
  }

  .segmentation-card.selected {
    @apply scale-100;
  }
}

/* Animaciones suaves */
@keyframes pulse-selected {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 86, 179, 0.5);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(0, 86, 179, 0);
  }
}

.segmentation-card.selected {
  animation: pulse-selected 2s infinite;
}
</style>