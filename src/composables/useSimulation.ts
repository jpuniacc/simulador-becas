// Composable para simulación de beneficios
import { ref, computed, watch } from 'vue'
import type {
  FormData,
  SimulationResults,
  BeneficioElegible,
  ArancelInfo,
  DescuentoInfo,
  SimulationProgress,
  SimulationConfig
} from '../types/simulador'
import type {
  DecilInfo,
  BeneficioUniaccInfo,
  CalculoBeneficio,
  ResumenBeneficios
} from '../types/beneficios'
import {
  calculateDecilWithData,
  calculateFinalArancel,
  calculatePAESTotal,
  calculatePAESWeighted,
  calculateSelectionScore,
  calculateAnnualSavings,
  calculateTotalSavings,
  calculateTotalDiscountPercentage,
  calculateEligibilityScore,
  calculateBenefitOrder,
  calculateMaxDiscount,
  calculateEffectiveDiscount
} from '../utils/calculations'

export interface UseSimulationOptions {
  arancelBase?: number
  matriculaBase?: number
  duracionCarrera?: number
  salarioPromedio?: number
  tasaDescuento?: number
  maxDescuentoPorcentaje?: number
  maxDescuentoMonto?: number
  beneficiosActivos?: boolean
  calculoDecil?: boolean
  incluirPAES?: boolean
}

export function useSimulation(
  formData: FormData,
  beneficios: BeneficioUniaccInfo[],
  deciles: DecilInfo[],
  options: UseSimulationOptions = {}
) {
  const {
    arancelBase = 2500000,
    matriculaBase = 150000,
    duracionCarrera = 4,
    salarioPromedio = 800000,
    tasaDescuento = 0.05,
    maxDescuentoPorcentaje = 100,
    maxDescuentoMonto = 2500000,
    beneficiosActivos = true,
    calculoDecil = true,
    incluirPAES = true
  } = options

  // Estado de la simulación
  const isSimulating = ref(false)
  const progress = ref(0)
  const currentStep = ref('')
  const totalSteps = ref(0)
  const results = ref<SimulationResults | null>(null)
  const error = ref<string | null>(null)
  const lastSimulation = ref<Date | null>(null)

  // Configuración de simulación
  const config = ref<SimulationConfig>({
    arancelBase,
    matriculaBase,
    maxDescuentoPorcentaje,
    maxDescuentoMonto,
    beneficiosActivos,
    calculoDecil,
    incluirPAES
  })

  // Computed
  const canSimulate = computed(() => {
    console.log('canSimulate computed:', {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      nivelEducativo: formData.nivelEducativo,
      colegio: formData.colegio,
      carrera: formData.carrera
    })
    return formData.nombre &&
           formData.apellido &&
           formData.email &&
           formData.nivelEducativo &&
           (formData.colegio != '' || formData.tipoIdentificacion == 'pasaporte') &&
           formData.carrera
  })

  const decilCalculado = computed(() => {
    // Para el MVP, usar decil por defecto ya que no tenemos ingresoMensual e integrantes
    return formData.decil || 10
  })

  const paesTotal = computed(() => {
    if (!incluirPAES || !formData.rendioPAES || !formData.paes) {
      return 0
    }
    return calculatePAESTotal(formData.paes)
  })

  const paesWeighted = computed(() => {
    if (!incluirPAES || !formData.rendioPAES || !formData.paes) {
      return 0
    }
    return calculatePAESWeighted(formData.paes)
  })

  const selectionScore = computed(() => {
    return calculateSelectionScore(
      formData.nem,
      formData.ranking,
      paesWeighted.value
    )
  })

  // Simular beneficios elegibles
  const simulateEligibleBenefits = (): BeneficioElegible[] => {
    const elegibles: BeneficioElegible[] = []

    for (const beneficio of beneficios) {
      if (!beneficio.vigente) continue

      const elegible = checkBenefitEligibility(beneficio)
      elegibles.push(elegible)
    }

    return elegibles
  }

  // Verificar elegibilidad de un beneficio
  const checkBenefitEligibility = (beneficio: BeneficioUniaccInfo): BeneficioElegible => {
    let elegible = false
    let razonElegibilidad = ''

    // Verificar criterios básicos
    if (!beneficio.vigente) {
      razonElegibilidad = 'Beneficio no vigente'
    } else if (beneficio.tipoBeneficio === 'BECA' && decilCalculado.value > 7) {
      razonElegibilidad = 'Decil socioeconómico muy alto para becas'
    } else if (beneficio.tipoBeneficio === 'FINANCIAMIENTO' && decilCalculado.value > 8) {
      razonElegibilidad = 'Decil socioeconómico muy alto para financiamiento'
    } else if (beneficio.tipoBeneficio === 'FINANCIERO' && decilCalculado.value > 9) {
      razonElegibilidad = 'Decil socioeconómico muy alto para beneficios financieros'
    } else {
      elegible = true
      razonElegibilidad = 'Cumple criterios de elegibilidad'
    }

    // Verificar requisitos específicos si existen
    if (elegible && beneficio.requisitos) {
      const requisitos = beneficio.requisitos as any

      // Verificar NEM si es requerido
      if (requisitos.nemMinimo && formData.nem && formData.nem < requisitos.nemMinimo) {
        elegible = false
        razonElegibilidad = `NEM insuficiente (requerido: ${requisitos.nemMinimo})`
      }

      // Verificar ranking si es requerido
      if (requisitos.rankingMinimo && formData.ranking && formData.ranking < requisitos.rankingMinimo) {
        elegible = false
        razonElegibilidad = `Ranking insuficiente (requerido: ${requisitos.rankingMinimo})`
      }

      // Verificar PAES si es requerido
      if (requisitos.paesMinimo && formData.rendioPAES && paesTotal.value < requisitos.paesMinimo) {
        elegible = false
        razonElegibilidad = `PAES insuficiente (requerido: ${requisitos.paesMinimo})`
      }

      // Verificar tipo de colegio si es requerido
      if (requisitos.tipoColegio && formData.colegio) {
        const tipoColegio = formData.colegio.toLowerCase()
        if (requisitos.tipoColegio === 'municipal' && !tipoColegio.includes('municipal')) {
          elegible = false
          razonElegibilidad = 'Tipo de colegio no elegible'
        }
      }
    }

    return {
      id: beneficio.id,
      codigoBeneficio: beneficio.codigoBeneficio,
      descripcion: beneficio.descripcion,
      porcentajeMaximo: beneficio.porcentajeMaximo,
      montoMaximo: beneficio.montoMaximo,
      tipoBeneficio: beneficio.tipoBeneficio,
      origenBeneficio: beneficio.origenBeneficio,
      aplicacionConcepto: beneficio.aplicacionConcepto,
      aplicacion: beneficio.aplicacion,
      prioridad: beneficio.prioridad,
      vigente: beneficio.vigente,
      requisitos: beneficio.requisitos,
      elegible,
      razonElegibilidad,
      fechaModificacion: beneficio.fechaModificacion
    }
  }

  // Calcular descuentos aplicables
  const calculateApplicableDiscounts = (beneficiosElegibles: BeneficioElegible[]): DescuentoInfo[] => {
    const descuentos: DescuentoInfo[] = []

    for (const beneficio of beneficiosElegibles) {
      if (!beneficio.elegible) continue

      const descuento = calculateBenefitDiscount(beneficio, arancelBase, decilCalculado.value)
      descuentos.push(descuento)
    }

    return descuentos
  }

  // Calcular beneficio individual
  const calculateBenefitDiscount = (
    beneficio: BeneficioElegible,
    arancelBase: number,
    decil: number
  ): DescuentoInfo => {
    let descuentoCalculado = 0
    let montoCalculado = 0
    let aplicadoA: 'arancel' | 'matricula' | 'total' = 'arancel'

    // Determinar a qué se aplica el beneficio
    if (beneficio.aplicacionConcepto === 'A') {
      aplicadoA = 'arancel'
    } else if (beneficio.aplicacionConcepto === 'M') {
      aplicadoA = 'matricula'
    } else {
      aplicadoA = 'total'
    }

    // Calcular descuento por porcentaje
    if (beneficio.porcentajeMaximo && beneficio.porcentajeMaximo > 0) {
      const porcentajeAplicable = Math.min(beneficio.porcentajeMaximo, 100)
      descuentoCalculado = (arancelBase * porcentajeAplicable) / 100
    }

    // Calcular descuento por monto fijo
    if (beneficio.montoMaximo && beneficio.montoMaximo > 0) {
      montoCalculado = Math.min(beneficio.montoMaximo, arancelBase)
    }

    // Aplicar el mayor descuento entre porcentaje y monto fijo
    const descuentoFinal = Math.max(descuentoCalculado, montoCalculado)

    // Aplicar límites por decil (deciles más bajos = más descuento)
    const factorDecil = Math.max(0.5, 1 - (decil - 1) * 0.05) // Factor de 0.5 a 1.0
    const descuentoConDecil = descuentoFinal * factorDecil

    return {
      beneficio,
      tipo: beneficio.porcentajeMaximo ? 'porcentaje' : 'monto_fijo',
      valor: beneficio.porcentajeMaximo || beneficio.montoMaximo || 0,
      aplicadoA,
      descuentoCalculado: descuentoConDecil,
      razonAplicacion: `Aplicado por ${beneficio.tipoBeneficio} - Decil ${decil}`
    }
  }

  // Ejecutar simulación completa
  const simulate = async (): Promise<SimulationResults> => {
    if (!canSimulate.value) {
      throw new Error('No se puede simular: faltan datos requeridos')
    }

    isSimulating.value = true
    progress.value = 0
    currentStep.value = 'Iniciando simulación...'
    totalSteps.value = 5
    error.value = null

    try {
      // Paso 1: Calcular decil socioeconómico
      progress.value = 20
      currentStep.value = 'Calculando decil socioeconómico...'
      await new Promise(resolve => setTimeout(resolve, 100))

      const decil = decilCalculado.value

      // Paso 2: Simular beneficios elegibles
      progress.value = 40
      currentStep.value = 'Evaluando beneficios elegibles...'
      await new Promise(resolve => setTimeout(resolve, 200))

      const beneficiosElegibles = simulateEligibleBenefits()
      const beneficiosAplicables = beneficiosElegibles.filter(b => b.elegible)
      const beneficiosNoAplicables = beneficiosElegibles.filter(b => !b.elegible)

      // Paso 3: Calcular descuentos
      progress.value = 60
      currentStep.value = 'Calculando descuentos...'
      await new Promise(resolve => setTimeout(resolve, 200))

      const descuentos = calculateApplicableDiscounts(beneficiosAplicables)

      // Paso 4: Calcular arancel final
      progress.value = 80
      currentStep.value = 'Calculando arancel final...'
      await new Promise(resolve => setTimeout(resolve, 200))

      const arancelInfo = calculateFinalArancel(arancelBase, matriculaBase, beneficiosAplicables, decil)

      // Paso 5: Generar resultados
      progress.value = 100
      currentStep.value = 'Finalizando simulación...'
      await new Promise(resolve => setTimeout(resolve, 100))

      const resultados: SimulationResults = {
        arancelBase: arancelInfo.arancelBase,
        descuentoTotal: arancelInfo.totalDescuentos,
        arancelFinal: arancelInfo.arancelFinal,
        beneficiosAplicables: beneficiosAplicables.map(b => ({
          ...b,
          descuentoAplicado: descuentos.find(d => d.beneficio.id === b.id)?.descuentoCalculado || 0
        })),
        beneficiosNoAplicables,
        decilCalculado: decil,
        fechaSimulacion: new Date().toISOString()
      }

      results.value = resultados
      lastSimulation.value = new Date()

      return resultados

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido en la simulación'
      throw err
    } finally {
      isSimulating.value = false
      progress.value = 0
      currentStep.value = ''
    }
  }

  // Simular con configuración personalizada
  const simulateWithConfig = async (customConfig: Partial<SimulationConfig>): Promise<SimulationResults> => {
    const originalConfig = { ...config.value }
    config.value = { ...config.value, ...customConfig }

    try {
      return await simulate()
    } finally {
      config.value = originalConfig
    }
  }

  // Obtener resumen de beneficios
  const getBenefitsSummary = (): ResumenBeneficios => {
    if (!results.value) {
      return {
        totalBeneficios: 0,
        beneficiosElegibles: 0,
        beneficiosNoElegibles: 0,
        descuentoTotal: 0,
        montoTotal: 0,
        ahorroAnual: 0,
        ahorroTotal: 0,
        beneficiosPorTipo: { beca: 0, financiamiento: 0, financiero: 0 },
        beneficiosPorOrigen: { interno: 0, externo: 0 },
        beneficiosPorConcepto: { arancel: 0, matricula: 0 }
      }
    }

    const { beneficiosAplicables, beneficiosNoAplicables, descuentoTotal } = results.value

    return {
      totalBeneficios: beneficiosAplicables.length + beneficiosNoAplicables.length,
      beneficiosElegibles: beneficiosAplicables.length,
      beneficiosNoElegibles: beneficiosNoAplicables.length,
      descuentoTotal,
      montoTotal: descuentoTotal,
      ahorroAnual: calculateAnnualSavings(arancelBase, results.value.arancelFinal),
      ahorroTotal: calculateTotalSavings(arancelBase, results.value.arancelFinal, duracionCarrera),
      beneficiosPorTipo: {
        beca: beneficiosAplicables.filter(b => b.tipoBeneficio === 'BECA').length,
        financiamiento: beneficiosAplicables.filter(b => b.tipoBeneficio === 'FINANCIAMIENTO').length,
        financiero: beneficiosAplicables.filter(b => b.tipoBeneficio === 'FINANCIERO').length
      },
      beneficiosPorOrigen: {
        interno: beneficiosAplicables.filter(b => b.origenBeneficio === 'INTERNO').length,
        externo: beneficiosAplicables.filter(b => b.origenBeneficio === 'EXTERNO').length
      },
      beneficiosPorConcepto: {
        arancel: beneficiosAplicables.filter(b => b.aplicacionConcepto === 'A').length,
        matricula: beneficiosAplicables.filter(b => b.aplicacionConcepto === 'M').length
      }
    }
  }

  // Obtener progreso de simulación
  const getSimulationProgress = (): SimulationProgress => {
    return {
      isSimulating: isSimulating.value,
      progress: progress.value,
      currentStep: currentStep.value,
      totalSteps: totalSteps.value
    }
  }

  // Limpiar resultados
  const clearResults = () => {
    results.value = null
    error.value = null
    lastSimulation.value = null
  }

  // Actualizar configuración
  const updateConfig = (newConfig: Partial<SimulationConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  // Watchers
  watch(formData, () => {
    // Limpiar resultados cuando cambien los datos
    if (results.value) {
      clearResults()
    }
  }, { deep: true })

  return {
    // Estado
    isSimulating,
    progress,
    currentStep,
    totalSteps,
    results,
    error,
    lastSimulation,
    config,

    // Computed
    canSimulate,
    decilCalculado,
    paesTotal,
    paesWeighted,
    selectionScore,

    // Métodos
    simulate,
    simulateWithConfig,
    simulateEligibleBenefits,
    checkBenefitEligibility,
    calculateApplicableDiscounts,
    calculateBenefitDiscount,
    getBenefitsSummary,
    getSimulationProgress,
    clearResults,
    updateConfig
  }
}

// Composable específico para simulación de UNIACC
export function useUniaccSimulation(
  formData: FormData,
  beneficios: BeneficioUniaccInfo[],
  deciles: DecilInfo[]
) {
  return useSimulation(formData, beneficios, deciles, {
    arancelBase: 2500000,
    matriculaBase: 150000,
    duracionCarrera: 4,
    salarioPromedio: 800000,
    tasaDescuento: 0.05,
    maxDescuentoPorcentaje: 100,
    maxDescuentoMonto: 2500000,
    beneficiosActivos: true,
    calculoDecil: true,
    incluirPAES: true
  })
}
