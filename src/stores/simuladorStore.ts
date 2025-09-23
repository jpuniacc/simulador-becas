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
import { useDeciles } from '../composables/useDeciles'
import { useFormValidation } from '../composables/useFormValidation'
import { useSimulation } from '../composables/useSimulation'
import { useDecilCalculation } from '../composables/useDecilCalculation'
import { useCarrerasStore } from './carrerasStore'
import { useBecasStore, type CalculoBecas } from './becasStore'

export const useSimuladorStore = defineStore('simulador', () => {
  // Integrar stores de carreras y becas
  const carrerasStore = useCarrerasStore()
  const becasStore = useBecasStore()

  // Estado del wizard
  const currentStep = ref(0)
  const totalSteps = ref(6) // Flujo dinámico: 5 para no egresados, 6 para egresados
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
    tieneRUT: undefined,
    tipoIdentificacion: '',
    identificacion: '',
    nacionalidad: '',
    fechaNacimiento: '',
    genero: '',
    nivelEducativo: '', // Obligatorio seleccionar
    colegio: '',
    carrera: '',
    tipoPrograma: 'Regular',
    nem: null,
    ranking: null,
    añoEgreso: '',
    ingresoMensual: null,
    integrantes: '',
    planeaUsarCAE: false,
    usaBecasEstado: false,
    decil: null,
    regionResidencia: '', // Región del prospecto (puede ser cualquier región)
    comunaResidencia: '', // Se obtiene del colegio seleccionado
    regionId: null, // Se obtiene del colegio seleccionado
    rendioPAES: false,
    paes: {
      matematica: null,
      lenguaje: null,
      ciencias: null,
      historia: null,
      matematica2: null,
      terceraAsignatura: null
    }
  })

  // Resultados de simulación
  const results = ref<SimulationResults | null>(null)
  const error = ref<string | null>(null)
  const lastSimulation = ref<Date | null>(null)

  // Cálculo de becas
  const calculoBecas = ref<CalculoBecas | null>(null)
  const costosCarrera = ref<any>(null)

  // Validación por paso
  const stepValidation = ref<StepValidation>({
    0: true,  // Bienvenida
    1: false, // Datos Personales
    2: false, // Datos de Escuela
    3: false, // Selección de Carrera
    4: false, // Datos de Egreso (solo egresados)
    5: false, // Socioeconómico
    6: false  // Resultados
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
  const deciles = ref<any[]>([])
  const beneficios = ref<BeneficioUniaccInfo[]>([])
  const nacionalidades = ref<NacionalidadInfo[]>([])
  const colegios = ref<ColegioInfo[]>([])

  // Composable de deciles
  const {
    deciles: decilesFromSupabase,
    loading: decilesLoading,
    error: decilesError,
    cargarDeciles: cargarDecilesFromSupabase,
    formatearRango
  } = useDeciles()

  // Computed
  const canGoNext = computed(() => {
    const canGo = stepValidation.value[currentStep.value] || false
    console.log('canGoNext computed:', {
      currentStep: currentStep.value,
      stepValidation: stepValidation.value[currentStep.value],
      canGo
    })
    return canGo
  })

  const canGoBack = computed(() => {
    return currentStep.value > 0
  })

  const isLastStep = computed(() => {
    const isEgresado = formData.value.nivelEducativo === 'Egresado'
    const maxSteps = isEgresado ? 6 : 5 // Egresados: 6 pasos, No egresados: 5 pasos
    return currentStep.value === maxSteps - 1
  })

  const progressPercentage = computed(() => {
    const isEgresado = formData.value.nivelEducativo === 'Egresado'
    const maxSteps = isEgresado ? 6 : 5
    return Math.round((currentStep.value / maxSteps) * 100)
  })

  const canSimulate = computed(() => {
    const required = {
      nombre: formData.value.nombre,
      apellido: formData.value.apellido,
      email: formData.value.email,
      nivelEducativo: formData.value.nivelEducativo,
      genero: formData.value.genero,
      colegio: formData.value.colegio,
      carrera: formData.value.carrera
    }

    console.log('Validación de simulación:', required)
    console.log('formData completo:', formData.value)

    const isValid = !!(required.nombre &&
           required.apellido &&
           required.email &&
           required.nivelEducativo &&
           required.genero &&
           required.colegio &&
           required.carrera)

    console.log('canSimulate resultado:', isValid)
    console.log('Valores individuales:', {
      nombre: !!required.nombre,
      apellido: !!required.apellido,
      email: !!required.email,
      nivelEducativo: !!required.nivelEducativo,
      genero: !!required.genero,
      colegio: !!required.colegio,
      carrera: !!required.carrera
    })
    return isValid
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

  // Inicializar simulación (se recreará en cada simulación con datos actuales)
  let simulation = useSimulation(formData.value, beneficios.value, deciles.value, simulationConfig.value)

  // Inicializar cálculo de decil
  const decilCalculation = useDecilCalculation({
    ingresoMensual: formData.value.ingresoMensual || 0,
    integrantes: parseInt(formData.value.integrantes) || 1,
    deciles: deciles.value,
    autoCalculate: false // Deshabilitar cálculo automático inicialmente
  })

  // Acciones del wizard
  const nextStep = () => {
    const isEgresado = formData.value.nivelEducativo === 'Egresado'
    const maxSteps = isEgresado ? 6 : 5

    if (canGoNext.value && currentStep.value < maxSteps - 1) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (canGoBack.value) {
      currentStep.value--
    }
  }

  const goToStep = (step: number) => {
    const isEgresado = formData.value.nivelEducativo === 'Egresado'
    const maxSteps = isEgresado ? 6 : 5 // Egresados: 6 pasos, No egresados: 5 pasos

    if (step >= 0 && step < maxSteps) {
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
    console.log('updateFormData recibió:', data)
    console.log('formData antes de actualizar:', formData.value)

    formData.value = { ...formData.value, ...data }

    console.log('formData después de actualizar:', formData.value)

    // Si se actualiza el colegio, actualizar comuna y región de residencia
    if (data.colegio) {
      const colegioSeleccionado = colegios.value.find(c => c.nombre === data.colegio)
      if (colegioSeleccionado) {
        console.log('Colegio seleccionado:', colegioSeleccionado)
        console.log('region_id del colegio:', (colegioSeleccionado as any).region_id)
        formData.value.comunaResidencia = colegioSeleccionado.comunaNombre
        formData.value.regionResidencia = colegioSeleccionado.regionNombre // Usar la región real del colegio
        formData.value.regionId = (colegioSeleccionado as any).region_id // Usar el ID de la región
        console.log('regionId actualizado en formData:', formData.value.regionId)
      }
    }

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
      tieneRUT: undefined,
      tipoIdentificacion: '',
      identificacion: '',
      nacionalidad: '',
      fechaNacimiento: '',
      genero: '',
      nivelEducativo: '', // Obligatorio seleccionar
      colegio: '',
      carrera: '',
      tipoPrograma: 'Regular',
      nem: null,
      ranking: null,
      añoEgreso: '',
      ingresoMensual: null,
      integrantes: '',
      planeaUsarCAE: false,
      usaBecasEstado: false,
      decil: null,
      regionResidencia: '', // Región del prospecto (puede ser cualquier región)
      comunaResidencia: '',
      regionId: null, // Se obtiene del colegio seleccionado
      rendioPAES: false,
    paes: {
      matematica: null,
      lenguaje: null,
      ciencias: null,
      historia: null,
      matematica2: null,
      terceraAsignatura: null
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
    console.log(`Validating step ${step}:`, isValid)
    stepValidation.value[step] = isValid
    console.log('Current stepValidation:', stepValidation.value)
  }

  const validateCurrentStep = () => {
    const step = currentStep.value
    const isEgresado = formData.value.nivelEducativo === 'Egresado'
    let isValid = false

    switch (step) {
      case 0: // Bienvenida
        isValid = true
        break
      case 1: // Datos Personales
        isValid = !!(
          formData.value.identificacion &&
          formData.value.telefono &&
          formData.value.genero
        )
        console.log('Validating step 1 (Datos Personales):', {
          identificacion: formData.value.identificacion,
          telefono: formData.value.telefono,
          genero: formData.value.genero,
          isValid
        })
        break
      case 2: // Datos de Escuela
        isValid = !!(
          formData.value.nivelEducativo && // Ahora obligatorio
          formData.value.colegio
        )
        console.log('Validating step 2 (Datos de Escuela):', {
          nivelEducativo: formData.value.nivelEducativo,
          colegio: formData.value.colegio,
          isValid
        })
        break
      case 3: // Selección de Carrera (para todos)
        isValid = !!formData.value.carrera
        console.log('Validating step 3 (Selección de Carrera):', {
          carrera: formData.value.carrera,
          isValid
        })
        break
      case 4: // Datos de Egreso (solo para egresados)
        if (isEgresado) {
          // Para egresados: solo requiere carrera (NEM, ranking, año y PAES son opcionales)
          isValid = !!formData.value.carrera
          console.log('Validating step 4 (Datos de Egreso):', {
            carrera: formData.value.carrera,
            nem: formData.value.nem,
            ranking: formData.value.ranking,
            añoEgreso: formData.value.añoEgreso,
            rendioPAES: formData.value.rendioPAES,
            isValid
          })
        } else {
          // Para no egresados: este paso no existe, saltar al siguiente
          isValid = true
        }
        break
      case 5: // Socioeconómico (para todos)
        // Si no selecciona ninguna opción de financiamiento, es válido
        if (!formData.value.planeaUsarCAE && !formData.value.usaBecasEstado) {
          isValid = true
        } else {
          // Si selecciona alguna opción, debe seleccionar decil
          isValid = !!formData.value.decil
        }
        console.log('Validating step 5 (Socioeconómico):', {
          planeaUsarCAE: formData.value.planeaUsarCAE,
          usaBecasEstado: formData.value.usaBecasEstado,
          decil: formData.value.decil,
          isValid
        })
        break
      case 6: // Resultados (para todos)
        isValid = !!results.value
        console.log('Validating step 6 (Resultados):', {
          results: !!results.value,
          isValid
        })
        break
    }

    validateStep(step, isValid)
  }

  // Simulación
  const simulate = async (): Promise<SimulationResults> => {
    console.log('=== INICIO DE SIMULATE ===')
    console.log('canSimulate.value:', canSimulate.value)
    console.log('formData en simulate:', formData.value)

    if (!canSimulate.value) {
      console.log('ERROR: canSimulate es false, no se puede simular')
      throw new Error('No se puede simular: faltan datos requeridos')
    }

    console.log('canSimulate es true, continuando con simulación...')

    isSimulating.value = true
    error.value = null

    try {
      // Cargar datos necesarios si no están cargados
      if (carrerasStore.carreras.length === 0) {
        await carrerasStore.cargarCarreras()
      }
      if (becasStore.becas.length === 0) {
        await becasStore.cargarBecas()
      }

      // Obtener costos de la carrera seleccionada
      if (formData.value.carrera) {
        costosCarrera.value = becasStore.obtenerCostosCarrera(formData.value.carrera)
      }

      // Calcular becas elegibles
      calculoBecas.value = becasStore.calcularBecas(formData.value)

      // Recrear simulación con datos actuales
      simulation = useSimulation(formData.value, beneficios.value, deciles.value, simulationConfig.value)

      // Ejecutar simulación
      const resultados = await simulation.simulate()

      results.value = resultados
      lastSimulation.value = new Date()
      isCompleted.value = true

      // Ir al paso de resultados
      const isEgresado = formData.value.nivelEducativo === 'Egresado'
      const resultsStep = isEgresado ? 6 : 5 // Egresados: paso 6, No egresados: paso 5
      currentStep.value = resultsStep
      validateStep(resultsStep, true)

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
    calculoBecas.value = null
    costosCarrera.value = null
  }

  // Carga de datos de referencia
  const loadDeciles = async (decilesData: DecilInfo[]) => {
    deciles.value = decilesData
  }

  const loadDecilesFromSupabase = async () => {
    await cargarDecilesFromSupabase()
    deciles.value = decilesFromSupabase.value
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
      c.comunaNombre.toLowerCase().includes(query.toLowerCase()) ||
      c.regionNombre.toLowerCase().includes(query.toLowerCase())
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

  // Watchers con debounce para evitar bucles
  let saveTimeout: NodeJS.Timeout | null = null

  watch(formData, () => {
    validateCurrentStep()

    // Debounce para saveToLocalStorage
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      saveToLocalStorage()
    }, 1000) // Guardar después de 1 segundo de inactividad
  }, { deep: true })

  watch(currentStep, () => {
    validateCurrentStep()
  })

  watch(results, () => {
    if (results.value) {
      const isEgresado = formData.value.nivelEducativo === 'Egresado'
      const resultsStep = isEgresado ? 6 : 5 // Egresados: paso 6, No egresados: paso 5
      validateStep(resultsStep, true)
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

    // Cálculo de becas
    calculoBecas,
    costosCarrera,

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
    loadDecilesFromSupabase,
    loadBeneficios,
    loadNacionalidades,
    loadColegios,

    // Deciles desde Supabase
    decilesFromSupabase,
    decilesLoading,
    decilesError,
    formatearRango,

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
    decilCalculation,

    // Stores integrados
    carrerasStore,
    becasStore
  }
})

