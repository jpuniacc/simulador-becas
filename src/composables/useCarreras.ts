import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type CarreraRow = Database['public']['Tables']['carreras']['Row']

export interface Carrera extends CarreraRow {
  // Hereda todos los campos de CarreraRow
}

export function useCarreras() {
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

  // Función para inicializar carreras
  const inicializar = async () => {
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

  // Función para buscar carreras por término
  const buscarCarreras = (termino: string) => {
    if (!termino || !termino.trim()) return carrerasVigentes.value

    const terminoLower = termino.toLowerCase()
    return carrerasVigentes.value.filter(carrera =>
      carrera.nombre_carrera.toLowerCase().includes(terminoLower) ||
      carrera.descripcion_facultad.toLowerCase().includes(terminoLower) ||
      carrera.area_actual.toLowerCase().includes(terminoLower)
    )
  }

  // Función para filtrar carreras por facultad
  const filtrarPorFacultad = (facultad: string) => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.descripcion_facultad === facultad
    )
  }

  // Función para filtrar carreras por área
  const filtrarPorArea = (area: string) => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.area_actual === area
    )
  }

  // Función para obtener carreras por nivel
  const filtrarPorNivel = (nivel: string) => {
    return carrerasVigentes.value.filter(carrera =>
      carrera.nivel_global === nivel
    )
  }

  return {
    // Estado
    carreras,
    carrerasVigentes,
    carrerasPorFacultad,
    facultades,
    areas,
    loading,
    error,

    // Métodos
    inicializar,
    buscarCarreras,
    filtrarPorFacultad,
    filtrarPorArea,
    filtrarPorNivel
  }
}
