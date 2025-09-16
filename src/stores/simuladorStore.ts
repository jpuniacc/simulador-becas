// Store principal del simulador
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  FormData,
  SimulationResults,
  WizardStep,
  WizardState,
  StepValidation,
  SimulationProgress,
  SimulationConfig,
  BeneficioElegible,
  ArancelInfo
} from '../types/simulador'
import type {
  DecilInfo,
  BeneficioUniaccInfo,
  NacionalidadInfo,
  ColegioInfo
} from '../types/beneficios'
import { useFormValidation } from '../composables/useFormValidation'
import { useSimulation } from '../composables/useSimulation'
import { useDecilCalculation } from '../composables/useDecilCalculation'

export const useSimuladorStore = defineStore('simulador', () => {
  // Estado del wizard
  const currentStep = ref(0)
  const totalSteps = ref(6)
  const isCompleted = ref(false)
  const isSimulating = ref(false)
  const simulationProgress = ref<SimulationProgress>({
    isSimulating: false,
    progress: 0,
    currentStep: '',
    totalSteps: 0
  })

  // Datos del formulario
  const formData = ref<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoIdentificacion: '',
    identificacion: '',
    nacionalidad: '',
    fechaNacimiento: '',
    nivelEducativo: 'Egresado',
    colegio: '',
    carrera: '',
    nem: null,
    ranking: null,
    añoEgreso: '',
    ingresoMensual: null,
    integrantes: '',
    tieneCAE: false,
    rendioPAES: false,
    paes: {
      matematica: null,
      lenguaje: null,
      ciencias: null,
      historia: null
    }
  })

  // Resultados de simulación
  const results = ref<SimulationResults | null>(null)
  const error = ref<string | null>(null)
  const lastSimulation = ref<Date | null>(null)

  // Validación por paso
  const stepValidation = ref<StepValidation>({
    0: true,  // Bienvenida
    1: false, // Datos Personales
    2: false, // Datos Académicos
    3: false, // Socioeconómico
    4: true,  // PAES (opcional)
    5: false  // Resultados
  })

  // Configuración de simulación
  const simulationConfig = ref<SimulationConfig>({
    arancelBase: 2500000,
    matriculaBase: 150000,
    maxDescuentoPorcentaje: 100,
    maxDescuentoMonto: 2500000,
    beneficiosActivos: true,
    calculoDecil: true,
    incluirPAES: true
  })

  // Datos de referencia
  const deciles = ref<DecilInfo[]>([])
  const beneficios = ref<BeneficioUniaccInfo[]>([])
  const nacionalidades = ref<NacionalidadInfo[]>([])
  const colegios = ref<ColegioInfo[]>([])

  // Computed
  const canGoNext = computed(() => {
    return stepValidation.value[currentStep.value] || false
  })

  const canGoBack = computed(() => {
    return currentStep.value > 0
  })

  const isLastStep = computed(() => {
    return currentStep.value === totalSteps.value - 1
  })

  const progressPercentage = computed(() => {
    return Math.round((currentStep.value / totalSteps.value) * 100)
  })

  const canSimulate = computed(() => {
    return formData.value.nombre &&
           formData.value.apellido &&
           formData.value.email &&
           formData.value.nivelEducativo &&
           formData.value.ingresoMensual &&
           formData.value.integrantes
  })

  const decilCalculado = computed(() => {
    if (!formData.value.ingresoMensual || !formData.value.integrantes) {
      return 10
    }
    return useDecilCalculation({
      ingresoMensual: formData.value.ingresoMensual,
      integrantes: parseInt(formData.value.integrantes),
      deciles: deciles.value
    }).decilCalculado.value
  })

  // Inicializar validación del formulario
  const formValidation = useFormValidation(formData.value, {}, {
    validationMode: 'onBlur',
    debounceMs: 300,
    showErrors: true,
    showWarnings: true,
    validateOnMount: false
  })

  // Inicializar simulación
  const simulation = useSimulation(formData.value, beneficios.value, deciles.value, simulationConfig.value)

  // Inicializar cálculo de decil
  const decilCalculation = useDecilCalculation({
    ingresoMensual: formData.value.ingresoMensual || 0,
    integrantes: parseInt(formData.value.integrantes) || 1,
    deciles: deciles.value,
    autoCalculate: false // Deshabilitar cálculo automático inicialmente
  })

  // Acciones del wizard
  const nextStep = () => {
    if (canGoNext.value && currentStep.value < totalSteps.value - 1) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (canGoBack.value) {
      currentStep.value--
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps.value) {
      currentStep.value = step
    }
  }

  const resetWizard = () => {
    currentStep.value = 0
    isCompleted.value = false
    isSimulating.value = false
    results.value = null
    error.value = null
    lastSimulation.value = null
    stepValidation.value = {
      0: true,
      1: false,
      2: false,
      3: false,
      4: true,
      5: false
    }
  }

  // Acciones de datos del formulario
  const updateFormData = (data: Partial<FormData>) => {
    formData.value = { ...formData.value, ...data }

    // Actualizar validación
    formValidation.updateFields(data)

    // Validar paso actual
    validateCurrentStep()
  }

  const resetFormData = () => {
    formData.value = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      tipoIdentificacion: '',
      identificacion: '',
      nacionalidad: '',
      fechaNacimiento: '',
      nivelEducativo: 'Egresado',
      colegio: '',
      carrera: '',
      nem: null,
      ranking: null,
      añoEgreso: '',
      ingresoMensual: null,
      integrantes: '',
      tieneCAE: false,
      rendioPAES: false,
      paes: {
        matematica: null,
        lenguaje: null,
        ciencias: null,
        historia: null
      }
    }

    formValidation.resetForm()
    clearResults()
  }

  const reset = () => {
    resetWizard()
    resetFormData()
  }

  // Validación de pasos
  const validateStep = (step: number, isValid: boolean) => {
    stepValidation.value[step] = isValid
  }

  const validateCurrentStep = () => {
    const step = currentStep.value
    let isValid = false

    switch (step) {
      case 0: // Bienvenida
        isValid = true
        break
      case 1: // Datos Personales
        isValid = !!(
          formData.value.nombre &&
          formData.value.apellido &&
          formData.value.email &&
          formData.value.telefono &&
          formData.value.tipoIdentificacion &&
          formData.value.identificacion &&
          formData.value.nacionalidad &&
          formData.value.fechaNacimiento
        )
        break
      case 2: // Datos Académicos
        isValid = !!(
          formData.value.nivelEducativo &&
          formData.value.colegio &&
          formData.value.carrera
        )
        break
      case 3: // Socioeconómico
        isValid = !!(
          formData.value.ingresoMensual &&
          formData.value.integrantes
        )
        break
      case 4: // PAES (opcional)
        isValid = true
        break
      case 5: // Resultados
        isValid = !!results.value
        break
    }

    validateStep(step, isValid)
  }

  // Simulación
  const simulate = async (): Promise<SimulationResults> => {
    if (!canSimulate.value) {
      throw new Error('No se puede simular: faltan datos requeridos')
    }

    isSimulating.value = true
    error.value = null

    try {
      // Actualizar configuración de simulación
      simulation.updateConfig(simulationConfig.value)

      // Ejecutar simulación
      const resultados = await simulation.simulate()

      results.value = resultados
      lastSimulation.value = new Date()
      isCompleted.value = true

      // Ir al paso de resultados
      currentStep.value = totalSteps.value - 1
      validateStep(5, true)

      return resultados
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido en la simulación'
      throw err
    } finally {
      isSimulating.value = false
    }
  }

  const clearResults = () => {
    results.value = null
    error.value = null
    lastSimulation.value = null
    isCompleted.value = false
  }

  // Carga de datos de referencia
  const loadDeciles = async (decilesData: DecilInfo[]) => {
    deciles.value = decilesData
  }

  const loadBeneficios = async (beneficiosData: BeneficioUniaccInfo[]) => {
    beneficios.value = beneficiosData
  }

  const loadNacionalidades = async (nacionalidadesData: NacionalidadInfo[]) => {
    nacionalidades.value = nacionalidadesData
  }

  const loadColegios = async (colegiosData: ColegioInfo[]) => {
    colegios.value = colegiosData
  }

  // Búsqueda de datos
  const searchNacionalidades = (query: string): NacionalidadInfo[] => {
    if (!query) return nacionalidades.value
    return nacionalidades.value.filter(n =>
      n.nombreEspanol.toLowerCase().includes(query.toLowerCase()) ||
      n.nombreIngles.toLowerCase().includes(query.toLowerCase())
    )
  }

  const searchColegios = (query: string): ColegioInfo[] => {
    if (!query) return colegios.value
    return colegios.value.filter(c =>
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.comuna.toLowerCase().includes(query.toLowerCase()) ||
      c.region.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Exportación de resultados
  const exportResults = (format: 'json' | 'pdf' | 'excel' = 'json') => {
    if (!results.value) return null

    const data = {
      simulacion: results.value,
      formulario: formData.value,
      configuracion: simulationConfig.value,
      fecha: new Date().toISOString()
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2)
    }

    // Implementar otros formatos según sea necesario
    return data
  }

  // Persistencia
  const saveToLocalStorage = () => {
    try {
      const data = {
        formData: formData.value,
        currentStep: currentStep.value,
        results: results.value,
        lastSimulation: lastSimulation.value
      }
      localStorage.setItem('simulador-uniacc', JSON.stringify(data))
    } catch (error) {
      console.error('Error al guardar en localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem('simulador-uniacc')
      if (data) {
        const parsed = JSON.parse(data)
        formData.value = { ...formData.value, ...parsed.formData }
        // Siempre empezar desde el paso 0 (WelcomeStep)
        currentStep.value = 0
        results.value = parsed.results || null
        lastSimulation.value = parsed.lastSimulation ? new Date(parsed.lastSimulation) : null
      }
    } catch (error) {
      console.error('Error al cargar desde localStorage:', error)
    }
  }

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('simulador-uniacc')
    } catch (error) {
      console.error('Error al limpiar localStorage:', error)
    }
  }

  // Watchers
  watch(formData, () => {
    validateCurrentStep()
    saveToLocalStorage()
  }, { deep: true })

  watch(currentStep, () => {
    validateCurrentStep()
  })

  watch(results, () => {
    if (results.value) {
      validateStep(5, true)
    }
  })

  // Estado del wizard
  const wizardState: WizardState = {
    currentStep: currentStep.value,
    totalSteps: totalSteps.value,
    isCompleted: isCompleted.value,
    canGoNext: canGoNext.value,
    canGoBack: canGoBack.value,
    isLastStep: isLastStep.value,
    progressPercentage: progressPercentage.value
  }

  return {
    // Estado del wizard
    currentStep,
    totalSteps,
    isCompleted,
    isSimulating,
    simulationProgress,

    // Datos del formulario
    formData,
    results,
    error,
    lastSimulation,
    stepValidation,
    simulationConfig,

    // Datos de referencia
    deciles,
    beneficios,
    nacionalidades,
    colegios,

    // Computed
    canGoNext,
    canGoBack,
    isLastStep,
    progressPercentage,
    canSimulate,
    decilCalculado,

    // Acciones del wizard
    nextStep,
    prevStep,
    goToStep,
    resetWizard,

    // Acciones de datos
    updateFormData,
    resetFormData,
    reset,
    validateStep,
    validateCurrentStep,

    // Simulación
    simulate,
    clearResults,

    // Carga de datos
    loadDeciles,
    loadBeneficios,
    loadNacionalidades,
    loadColegios,

    // Búsqueda
    searchNacionalidades,
    searchColegios,

    // Exportación
    exportResults,

    // Persistencia
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,

    // Estado
    wizardState,

    // Composables
    formValidation,
    simulation,
    decilCalculation
  }
})
