import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type CarreraRow = Database['public']['Tables']['carreras_uniacc']['Row']
export type Carrera = CarreraRow

export const useCarrerasStore = defineStore('carreras', () => {
  // Estado
  const carreras = ref<Carrera[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed para carreras filtradas por vigencia
  const carrerasVigentes = computed(() => {
    return carreras.value
  })

  // Computed para carreras con aranceles definidos
  const carrerasConArancel = computed(() => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.arancel && carrera.arancel > 0
    )
  })

  // Computed para rango de aranceles
  const rangoAranceles = computed(() => {
    const aranceles = carrerasConArancel.value
      .map(c => c.arancel!)
      .filter(arancel => arancel > 0)
      .sort((a, b) => a - b)

    if (aranceles.length === 0) return { min: 0, max: 0 }

    return {
      min: aranceles[0],
      max: aranceles[aranceles.length - 1]
    }
  })

  // Acciones
  // Puede recibir un número único o un array de números para buscar carreras por version_simulador
  // Si es un array, hace un equivalente a SQL IN (ej: [10, 11] trae carreras con version_simulador 10 o 11)
  const cargarCarreras = async (versionSimulador: number | number[] = 10) => {
    try {
      loading.value = true
      error.value = null

      // Construir la consulta base
      let query = supabase
        .from('carreras_uniacc')
        .select('*')

      // Si es un array, usar .in() para hacer un SQL IN
      if (Array.isArray(versionSimulador)) {
        if (versionSimulador.length > 0) {
          query = query.in('version_simulador', versionSimulador)
          console.log('Cargando carreras con version_simulador en:', versionSimulador)
        } else {
          // Si el array está vacío, usar el valor por defecto
          query = query.eq('version_simulador', 10)
          console.log('Array vacío, usando versión por defecto: 10')
        }
      } else {
        // Si es un número único, usar .eq()
        query = query.eq('version_simulador', versionSimulador)
        console.log('Cargando carreras con version_simulador:', versionSimulador)
      }

      // Ordenar y ejecutar
      const { data, error: supabaseError } = await query.order('nombre_programa')

      if (supabaseError) {
        throw supabaseError
      }

      carreras.value = data || []
      console.log('Carreras cargadas en store:', carreras.value.length)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar carreras'
      console.error('Error cargando carreras:', err)
    } finally {
      loading.value = false
    }
  }

  const buscarCarreras = (termino: string) => {
    if (!termino || !termino.trim()) return carrerasVigentes.value

    const terminoLower = termino.toLowerCase()
    return carrerasVigentes.value.filter(carrera =>
      carrera.nombre_programa.toLowerCase().includes(terminoLower)
    )
  }

  const obtenerArancelCarrera = (nombreCarrera: string) => {
    const carrera = carrerasVigentes.value.find(c => c.nombre_programa === nombreCarrera)
    return carrera?.arancel || 0
  }

  const obtenerMatriculaCarrera = (nombreCarrera: string) => {
    const carrera = carrerasVigentes.value.find(c => c.nombre_programa === nombreCarrera)
    return carrera?.matricula || 0
  }

  const obtenerCarreraPorNombre = (nombreCarrera: string) => {
    return carrerasVigentes.value.find(c => c.nombre_programa === nombreCarrera)
  }

  const obtenerCarreraPorId = (idCarrera: number, modalidadesAplicables?: string[] | null) => {
    const carrera = carrerasVigentes.value.find(c => c.id === idCarrera)

    if (!carrera) return undefined

    // Verificación de modalidades aplicables
    if (modalidadesAplicables && modalidadesAplicables.length > 0) {
      // Si la carrera no tiene modalidad definida, no es compatible
      if (!carrera.modalidad_programa) {
        return undefined
      }

      // Verificar si la modalidad de la carrera está en las modalidades aplicables
      const modalidadCarrera = carrera.modalidad_programa.trim()
      const esCompatible = modalidadesAplicables.some(modalidad =>
        modalidad.trim().toLowerCase() === modalidadCarrera.toLowerCase()
      )

      if (!esCompatible) {
        return undefined
      }
    }

    return carrera
  }

  const obtenerCostosCarrera = (idCarrera: number) => {
    const carrera = obtenerCarreraPorId(idCarrera)
    if (!carrera) return null

    return {
      arancel: carrera.arancel || 0,
      matricula: carrera.matricula || 0,
      duracion: carrera.duracion_programa || '',
      anio: carrera.anio || new Date().getFullYear(),
      totalAnual: (carrera.arancel || 0) + (carrera.matricula || 0)
    }
  }

  return {
    // Estado
    carreras,
    carrerasVigentes,
    carrerasConArancel,
    rangoAranceles,
    loading,
    error,

    // Acciones
    cargarCarreras,
    buscarCarreras,
    obtenerArancelCarrera,
    obtenerMatriculaCarrera,
    obtenerCarreraPorNombre,
    obtenerCarreraPorId,
    obtenerCostosCarrera
  }
})
