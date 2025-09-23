import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type CarreraRow = Database['public']['Tables']['carreras']['Row']
export type Carrera = CarreraRow

export const useCarrerasStore = defineStore('carreras', () => {
  // Estado
  const carreras = ref<Carrera[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed para carreras filtradas por vigencia
  const carrerasVigentes = computed(() => {
    return carreras.value.filter(carrera => carrera.vigencia === 'SI')
  })

  // Computed para agrupar carreras por facultad
  const carrerasPorFacultad = computed(() => {
    const grupos: Record<string, Carrera[]> = {}

    carrerasVigentes.value.forEach(carrera => {
      const facultad = carrera.descripcion_facultad
      if (!grupos[facultad]) {
        grupos[facultad] = []
      }
      grupos[facultad].push(carrera)
    })

    return grupos
  })

  // Computed para obtener facultades únicas
  const facultades = computed(() => {
    const facultadesUnicas = new Set(carrerasVigentes.value.map(c => c.descripcion_facultad))
    return Array.from(facultadesUnicas).sort()
  })

  // Computed para obtener áreas únicas
  const areas = computed(() => {
    const areasUnicas = new Set(carrerasVigentes.value.map(c => c.area_actual))
    return Array.from(areasUnicas).sort()
  })

  // Computed para carreras con aranceles definidos
  const carrerasConArancel = computed(() => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.arancel_carrera && carrera.arancel_carrera > 0
    )
  })

  // Computed para rango de aranceles
  const rangoAranceles = computed(() => {
    const aranceles = carrerasConArancel.value
      .map(c => c.arancel_carrera!)
      .filter(arancel => arancel > 0)
      .sort((a, b) => a - b)

    if (aranceles.length === 0) return { min: 0, max: 0 }

    return {
      min: aranceles[0],
      max: aranceles[aranceles.length - 1]
    }
  })

  // Acciones
  const cargarCarreras = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('carreras')
        .select('*')
        .order('nombre_carrera')

      if (supabaseError) {
        throw supabaseError
      }

      carreras.value = data || []
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
      carrera.nombre_carrera.toLowerCase().includes(terminoLower) ||
      carrera.descripcion_facultad.toLowerCase().includes(terminoLower) ||
      carrera.area_actual.toLowerCase().includes(terminoLower)
    )
  }

  const filtrarPorFacultad = (facultad: string) => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.descripcion_facultad === facultad
    )
  }

  const filtrarPorArea = (area: string) => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.area_actual === area
    )
  }

  const filtrarPorNivel = (nivel: string) => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.nivel_global === nivel
    )
  }

  const obtenerArancelCarrera = (nombreCarrera: string) => {
    const carrera = carrerasVigentes.value.find(c => c.nombre_carrera === nombreCarrera)
    return carrera?.arancel_carrera || 0
  }

  const obtenerMatriculaCarrera = (nombreCarrera: string) => {
    const carrera = carrerasVigentes.value.find(c => c.nombre_carrera === nombreCarrera)
    return carrera?.matricula_carrera || 0
  }

  const obtenerCarreraPorNombre = (nombreCarrera: string) => {
    return carrerasVigentes.value.find(c => c.nombre_carrera === nombreCarrera)
  }

  const obtenerCostosCarrera = (nombreCarrera: string) => {
    const carrera = obtenerCarreraPorNombre(nombreCarrera)
    if (!carrera) return null

    return {
      arancel: carrera.arancel_carrera || 0,
      matricula: carrera.matricula_carrera || 0,
      duracion: carrera.duracion_en_semestres || 0,
      anio: carrera.anio || new Date().getFullYear(),
      totalAnual: (carrera.arancel_carrera || 0) + (carrera.matricula_carrera || 0)
    }
  }

  return {
    // Estado
    carreras,
    carrerasVigentes,
    carrerasPorFacultad,
    carrerasConArancel,
    facultades,
    areas,
    rangoAranceles,
    loading,
    error,

    // Acciones
    cargarCarreras,
    buscarCarreras,
    filtrarPorFacultad,
    filtrarPorArea,
    filtrarPorNivel,
    obtenerArancelCarrera,
    obtenerMatriculaCarrera,
    obtenerCarreraPorNombre,
    obtenerCostosCarrera
  }
})
