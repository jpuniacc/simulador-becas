import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { FormData } from '@/types/simulador'
import { useCarrerasStore } from './carrerasStore'

// Tipos para becas
export interface BecasUniacc {
  id: string
  codigo_beca: string
  nombre: string
  descripcion: string
  descuento_porcentaje: number | null
  descuento_monto_fijo: number | null
  tipo_descuento: 'porcentaje' | 'monto_fijo' | 'mixto'
  requiere_nem: boolean
  nem_minimo: number | null
  requiere_paes: boolean
  paes_minimo: number | null
  requiere_region_especifica: boolean
  region_excluida: string | null
  requiere_genero: 'Masculino' | 'Femenino' | null
  carreras_aplicables: string[] | null
  programas_excluidos: string[] | null
  max_anos_egreso: number | null
  max_anos_paes: number | null
  vigencia_desde: string
  vigencia_hasta: string | null
  modalidades_aplicables: string[]
  nivel_aplicable: 'Pregrado' | 'Postgrado' | 'Educacion_Continua'
  duracion_tipo: 'Anual' | 'Semestral' | 'Variable'
  duracion_meses: number | null
  proceso_evaluacion: 'Automatico' | 'Evaluacion' | 'Postulacion'
  cupos_disponibles: number | null
  cupos_utilizados: number
  requiere_documentacion: string[]
  es_combinable: boolean
  becas_incompatibles: string[] | null
  activa: boolean
  prioridad: number
  created_at: string
  updated_at: string
}

export interface BecasElegibles {
  beca: BecasUniacc
  elegible: boolean
  razon: string
  descuento_aplicado: number
  monto_descuento: number
}

export interface CalculoBecas {
  arancel_base: number
  becas_aplicadas: BecasElegibles[]
  descuento_total: number
  arancel_final: number
  ahorro_total: number
}

// Tipos para becas del estado
export interface BecasEstado {
  id: number
  codigo_beca: string | null
  nombre: string | null
  descripcion: string | null
  descuento_porcentaje: number | null
  descuento_monto: number | null
  tipo_descuento: string | null
  requiere_nem: boolean | null
  nem_minimo: number | null
  requiere_paes: boolean | null
  paes_minimo: number | null
  requeire_decil: boolean | null
  decil_maximo: number | null
  created_at: string
}

export interface BecasElegiblesEstado {
  beca: BecasEstado
  elegible: boolean
  razon: string
  descuento_aplicado: number
  monto_descuento: number
}

export const useBecasStore = defineStore('becas', () => {
  // Estado
  const becas = ref<BecasUniacc[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Estado para becas del estado
  const becasEstado = ref<BecasEstado[]>([])
  const loadingEstado = ref(false)
  const errorEstado = ref<string | null>(null)
  const becasElegiblesEstado = ref<BecasElegiblesEstado[]>([])

  // Integrar con carreras store
  const carrerasStore = useCarrerasStore()

  // Computed para becas por tipo
  const becasPorTipo = computed(() => {
    const porTipo: Record<string, BecasUniacc[]> = {}
    becas.value.forEach(beca => {
      const tipo = beca.proceso_evaluacion
      if (!porTipo[tipo]) {
        porTipo[tipo] = []
      }
      porTipo[tipo].push(beca)
    })
    return porTipo
  })

  // Computed para becas por prioridad
  const becasPorPrioridad = computed(() => {
    return becas.value.reduce((acc, beca) => {
      if (!acc[beca.prioridad]) {
        acc[beca.prioridad] = []
      }
      acc[beca.prioridad].push(beca)
      return acc
    }, {} as Record<number, BecasUniacc[]>)
  })

  // Acciones
  const cargarBecas = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('becas_uniacc')
        .select('*')
        .eq('activa', true)
        .order('prioridad', { ascending: true })

      if (supabaseError) {
        throw supabaseError
      }

      becas.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar becas'
      console.error('Error cargando becas:', err)
    } finally {
      loading.value = false
    }
  }

  // Cargar becas del estado desde Supabase
  const cargarBecasEstado = async () => {
    try {
      loadingEstado.value = true
      errorEstado.value = null

      const { data, error: supabaseError } = await supabase
        .from('becas_estado')
        .select('*')
        .order('id', { ascending: true })

        console.log('STORE - becasEstado cargadas:', data)

      if (supabaseError) {
        throw supabaseError
      }

      becasEstado.value = data || []
    } catch (err) {
      errorEstado.value = err instanceof Error ? err.message : 'Error al cargar becas del estado'
      console.error('Error cargando becas del estado:', err)
    } finally {
      loadingEstado.value = false
    }
  }

  // Verificar elegibilidad de una beca específica
  const verificarElegibilidad = (beca: BecasUniacc, formData: FormData): BecasElegibles => {
    let elegible = true
    let razon = ''
    let descuento_aplicado = 0
    let monto_descuento = 0

    // 1. Verificar NEM
    if (beca.requiere_nem && beca.nem_minimo) {
      if (!formData.nem || formData.nem < beca.nem_minimo) {
        elegible = false
        razon = `Requiere NEM mínimo ${beca.nem_minimo}`
      }
    }

    // 2. Verificar PAES
    if (beca.requiere_paes && beca.paes_minimo) {
      const puntajePAES = formData.paes?.matematica || formData.paes?.lenguaje || 0
      if (!formData.rendioPAES || puntajePAES < beca.paes_minimo) {
        elegible = false
        razon = `Requiere PAES mínimo ${beca.paes_minimo}`
      }
    }

    // 3. Verificar región
    if (beca.requiere_region_especifica && beca.region_excluida) {
      if (formData.regionResidencia === beca.region_excluida) {
        elegible = false
        razon = `No aplica para región ${beca.region_excluida}`
      }
    }

    // 3.1. Caso especial para Beca Apoyo Regional: aplicar automáticamente si el colegio está fuera de RM
    if (beca.nombre.toLowerCase().includes('apoyo regional') || beca.nombre.toLowerCase().includes('regional')) {
      // Obtener el region_id del colegio seleccionado (13 = Región Metropolitana)
      const regionId = formData.regionId || 13 // Por defecto RM si no está definida

      console.log('🔍 Verificando Beca Apoyo Regional:')
      console.log('  - Becas nombre:', beca.nombre)
      console.log('  - formData.regionId:', formData.regionId)
      console.log('  - regionId usado:', regionId)
      console.log('  - ¿Es región 13?', regionId === 13)

      // Si el colegio está en Región Metropolitana (region_id = 13), no aplica la beca regional
      if (regionId === 13) {
        elegible = false
        razon = 'Beca Apoyo Regional solo aplica para estudiantes de regiones (fuera de RM)'
        console.log('  ❌ NO elegible - Región Metropolitana')
      } else {
        // Si está fuera de RM, es elegible automáticamente
        elegible = true
        razon = `Elegible por residir en región ${regionId} (fuera de Región Metropolitana)`
        console.log('  ✅ ELEGIBLE - Fuera de Región Metropolitana')
      }
    }

    // 5. Verificar carrera
    if (beca.carreras_aplicables && beca.carreras_aplicables.length > 0) {
      if (!formData.carrera || !beca.carreras_aplicables.includes(formData.carrera)) {
        // Caso especial para Beca STEM: aplicar solo a Ingeniería Informática Multimedia para mujeres
        if (beca.nombre.toLowerCase().includes('stem') && formData.genero === 'Femenino') {
          // Verificar si la carrera es específicamente "Ingeniería Informática Multimedia"
          const carreraLower = formData.carrera.toLowerCase()
          const esIngenieriaInformaticaMultimedia = carreraLower.includes('ingeniería') &&
                                                   carreraLower.includes('informática') &&
                                                   carreraLower.includes('multimedia')

          if (!esIngenieriaInformaticaMultimedia) {
            elegible = false
            razon = `Beca STEM solo aplica para Ingeniería Informática Multimedia`
          }
        } else {
          elegible = false
          razon = `No aplica para la carrera seleccionada`
        }
      }
    }

    // 6. Verificar programas excluidos
    if (beca.programas_excluidos && beca.programas_excluidos.length > 0) {
      if (formData.tipoPrograma && beca.programas_excluidos.includes(formData.tipoPrograma)) {
        elegible = false
        razon = `No aplica para programa ${formData.tipoPrograma}`
      }
    }

    // 7. Verificar años de egreso
    if (beca.max_anos_egreso) {
      const anoActual = new Date().getFullYear()
      const anoEgreso = formData.añoEgreso ? parseInt(formData.añoEgreso) : null
      if (anoEgreso && (anoActual - anoEgreso) > beca.max_anos_egreso) {
        elegible = false
        razon = `Máximo ${beca.max_anos_egreso} años desde egreso`
      }
    }

    // 8. Verificar años PAES
    if (beca.max_anos_paes) {
      const anoActual = new Date().getFullYear()
      const anoPAES = formData.añoEgreso ? parseInt(formData.añoEgreso) : null // Asumimos que año PAES = año egreso
      if (anoPAES && (anoActual - anoPAES) > beca.max_anos_paes) {
        elegible = false
        razon = `Máximo ${beca.max_anos_paes} años desde PAES`
      }
    }

    // 9. Verificar vigencia
    const hoy = new Date()
    const vigenciaDesde = new Date(beca.vigencia_desde)
    const vigenciaHasta = beca.vigencia_hasta ? new Date(beca.vigencia_hasta) : null

    if (hoy < vigenciaDesde) {
      elegible = false
      razon = `Beca no vigente hasta ${vigenciaDesde.toLocaleDateString()}`
    }

    if (vigenciaHasta && hoy > vigenciaHasta) {
      elegible = false
      razon = `Beca vencida desde ${vigenciaHasta.toLocaleDateString()}`
    }

    // 10. Verificar cupos
    if (beca.cupos_disponibles && beca.cupos_utilizados >= beca.cupos_disponibles) {
      elegible = false
      razon = `No hay cupos disponibles`
    }
    // Si es elegible, calcular descuento
    if (elegible) {
      if (beca.tipo_descuento === 'porcentaje' && beca.descuento_porcentaje) {
        descuento_aplicado = beca.descuento_porcentaje
      } else if (beca.tipo_descuento === 'monto_fijo' && beca.descuento_monto_fijo) {
        monto_descuento = beca.descuento_monto_fijo
      }
    }

    return {
      beca,
      elegible,
      razon,
      descuento_aplicado,
      monto_descuento
    }
  }

  // Calcular becas elegibles para un estudiante
  const calcularBecasElegibles = (formData: FormData): BecasElegibles[] => {
    return becas.value.map(beca => verificarElegibilidad(beca, formData))
  }

  // Verificar elegibilidad de una beca del estado específica
  const verificarElegibilidadEstado = (beca: BecasEstado, formData: FormData): BecasElegiblesEstado => {
    console.log('🔍 verificarElegibilidadEstado - Inicio:', {
      becaNombre: beca.nombre,
      becaId: beca.id,
      usaBecasEstado: formData.usaBecasEstado,
      formData: {
        nem: formData.nem,
        rendioPAES: formData.rendioPAES,
        paes: formData.paes,
        decil: formData.decil
      }
    })

    let elegible = true
    let razon = ''
    let descuento_aplicado = 0
    let monto_descuento = 0

    // Verificar que el usuario haya marcado que usa becas del estado
    if (!formData.usaBecasEstado) {
      console.log('❌ verificarElegibilidadEstado - No usa becas del estado')
      elegible = false
      razon = 'El estudiante no indicó que usa becas del estado'
      return {
        beca,
        elegible,
        razon,
        descuento_aplicado,
        monto_descuento
      }
    }

    // 1. Verificar NEM
    if (beca.requiere_nem && beca.nem_minimo !== null) {
      if (!formData.nem || formData.nem < beca.nem_minimo) {
        elegible = false
        razon = `Requiere NEM mínimo ${beca.nem_minimo}`
      }
    }

    // 2. Verificar PAES
    if (beca.requiere_paes && beca.paes_minimo !== null) {
      const puntajePAES = formData.paes?.matematica || formData.paes?.lenguaje || 0
      if (!formData.rendioPAES || puntajePAES < beca.paes_minimo) {
        elegible = false
        razon = `Requiere PAES mínimo ${beca.paes_minimo}`
      }
    }

    // 3. Verificar decil
    if (beca.requeire_decil && beca.decil_maximo !== null) {
      if (!formData.decil || formData.decil > beca.decil_maximo) {
        elegible = false
        razon = `Requiere decil máximo ${beca.decil_maximo}`
      }
    }

    // Si es elegible, calcular descuento
    if (elegible) {
      if (beca.tipo_descuento === 'porcentaje' && beca.descuento_porcentaje !== null) {
        descuento_aplicado = beca.descuento_porcentaje
      } else if (beca.tipo_descuento === 'monto_fijo' && beca.descuento_monto !== null) {
        monto_descuento = beca.descuento_monto
      }
    }

    console.log('✅ verificarElegibilidadEstado - Resultado:', {
      becaNombre: beca.nombre,
      elegible,
      razon,
      descuento_aplicado,
      monto_descuento
    })

    return {
      beca,
      elegible,
      razon,
      descuento_aplicado,
      monto_descuento
    }
  }

  // Calcular becas del estado elegibles para un estudiante
  const calcularBecasElegiblesEstado = (formData: FormData): BecasElegiblesEstado[] => {
    console.log('📊 calcularBecasElegiblesEstado - Inicio:', {
      totalBecasEstado: becasEstado.value.length,
      usaBecasEstado: formData.usaBecasEstado,
      formData: {
        nem: formData.nem,
        rendioPAES: formData.rendioPAES,
        paes: formData.paes,
        decil: formData.decil
      }
    })

    const elegibles = becasEstado.value.map(beca => verificarElegibilidadEstado(beca, formData))
    becasElegiblesEstado.value = elegibles
    
    const aplicadas = elegibles.filter(b => b.elegible)
    console.log('📊 calcularBecasElegiblesEstado - Resultado:', {
      totalElegibles: elegibles.length,
      totalAplicadas: aplicadas.length,
      aplicadas: aplicadas.map(b => ({
        nombre: b.beca.nombre,
        elegible: b.elegible,
        razon: b.razon
      }))
    })

    return elegibles
  }

  // Aplicar algoritmo de prelación de becas
  const aplicarPrelacion = (becasElegibles: BecasElegibles[], arancelBase: number): CalculoBecas => {
    // Filtrar solo becas elegibles
    const becasAplicables = becasElegibles.filter(b => b.elegible)

    // Ordenar por prioridad (menor número = mayor prioridad)
    becasAplicables.sort((a, b) => a.beca.prioridad - b.beca.prioridad)

    let arancelActual = arancelBase
    let descuentoTotal = 0
    const becasAplicadas: BecasElegibles[] = []
    const becasIncompatibles = new Set<string>()

    for (const becaElegible of becasAplicables) {
      const beca = becaElegible.beca

      // Verificar si es compatible con becas ya aplicadas
      if (becasIncompatibles.has(beca.codigo_beca)) {
        continue
      }

      // Verificar incompatibilidades
      if (beca.becas_incompatibles) {
        const tieneIncompatibilidad = beca.becas_incompatibles.some(codigoIncompatible =>
          becasAplicadas.some(b => b.beca.codigo_beca === codigoIncompatible)
        )
        if (tieneIncompatibilidad) {
          continue
        }
      }

      // Aplicar descuento
      let montoDescuento = 0
      if (beca.tipo_descuento === 'porcentaje' && beca.descuento_porcentaje) {
        montoDescuento = (arancelActual * beca.descuento_porcentaje) / 100
      } else if (beca.tipo_descuento === 'monto_fijo' && beca.descuento_monto_fijo) {
        montoDescuento = beca.descuento_monto_fijo
      }

      // Actualizar arancel
      arancelActual -= montoDescuento
      descuentoTotal += montoDescuento

      // Agregar a becas aplicadas
      becasAplicadas.push({
        ...becaElegible,
        monto_descuento: montoDescuento
      })

      // Marcar becas incompatibles
      if (beca.becas_incompatibles) {
        beca.becas_incompatibles.forEach(codigo => becasIncompatibles.add(codigo))
      }
    }

    return {
      arancel_base: arancelBase,
      becas_aplicadas: becasAplicadas,
      descuento_total: descuentoTotal,
      arancel_final: arancelActual,
      ahorro_total: descuentoTotal
    }
  }

  // Calcular becas completas para un estudiante
  const calcularBecas = (formData: FormData, arancelBase?: number): CalculoBecas => {
    // Si no se proporciona arancel, obtenerlo de la carrera seleccionada
    let arancelCalculado = arancelBase || 0

    if (!arancelBase && formData.carrera) {
      arancelCalculado = carrerasStore.obtenerArancelCarrera(formData.carrera)
    }

    // Primero calcular y aplicar becas del estado si el usuario las usa
    let arancelDespuesEstado = arancelCalculado
    console.log('💰 calcularBecas - Verificando becas del estado:', {
      usaBecasEstado: formData.usaBecasEstado,
      totalBecasEstado: becasEstado.value.length,
      arancelCalculado
    })

    if (formData.usaBecasEstado && becasEstado.value.length > 0) {
      const becasEstadoElegibles = calcularBecasElegiblesEstado(formData)
      const becasEstadoAplicadas = becasEstadoElegibles.filter(b => b.elegible)
      console.log('💰 calcularBecas - Becas del estado aplicadas:', {
        total: becasEstadoAplicadas.length,
        becas: becasEstadoAplicadas.map(b => ({
          nombre: b.beca.nombre,
          monto_descuento: b.monto_descuento,
          descuento_aplicado: b.descuento_aplicado
        }))
      })
      
      // Aplicar descuentos de becas del estado
      for (const becaEstado of becasEstadoAplicadas) {
        let montoDescuento = 0
        if (becaEstado.beca.tipo_descuento === 'porcentaje' && becaEstado.descuento_aplicado) {
          montoDescuento = (arancelDespuesEstado * becaEstado.descuento_aplicado) / 100
        } else if (becaEstado.beca.tipo_descuento === 'monto_fijo' && becaEstado.monto_descuento) {
          montoDescuento = becaEstado.monto_descuento
        }
        arancelDespuesEstado -= montoDescuento
      }
    }

    // Calcular becas internas sobre el arancel después de aplicar becas del estado
    const becasElegibles = calcularBecasElegibles(formData)
    const resultado = aplicarPrelacion(becasElegibles, arancelDespuesEstado)
    
    // Ajustar el arancel_base al original para mantener consistencia
    return {
      ...resultado,
      arancel_base: arancelCalculado
    }
  }

  // Obtener información completa de costos de una carrera
  const obtenerCostosCarrera = (nombreCarrera: string) => {
    return carrerasStore.obtenerCostosCarrera(nombreCarrera)
  }

  return {
    // Estado
    becas,
    loading,
    error,
    becasPorTipo,
    becasPorPrioridad,
    // Becas del estado
    becasEstado,
    loadingEstado,
    errorEstado,
    becasElegiblesEstado,

    // Acciones
    cargarBecas,
    verificarElegibilidad,
    calcularBecasElegibles,
    aplicarPrelacion,
    calcularBecas,
    obtenerCostosCarrera,
    cargarBecasEstado,
    verificarElegibilidadEstado,
    calcularBecasElegiblesEstado
  }
})
