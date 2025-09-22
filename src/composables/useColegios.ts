// Composable para manejar datos de colegios desde Supabase
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Tipos extraídos de la base de datos
type ColegioRow = Database['public']['Tables']['colegios']['Row']

export interface Region {
  region_id: number
  region_nombre: string
}

export interface Comuna {
  comuna_id: number
  comuna_nombre: string
}

export interface Colegio extends ColegioRow {
  // Hereda todos los campos de ColegioRow
}

export function useColegios() {
  // Estado reactivo
  const regiones = ref<Region[]>([])
  const comunas = ref<Comuna[]>([])
  const colegios = ref<Colegio[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Estado de selección
  const regionSeleccionada = ref<Region | null>(null)
  const comunaSeleccionada = ref<Comuna | null>(null)
  const colegioSeleccionado = ref<Colegio | null>(null)

  // Computed
  const comunasFiltradas = computed(() => {
    if (!regionSeleccionada.value) return []
    return comunas.value
  })

  const colegiosFiltrados = computed(() => {
    if (!comunaSeleccionada.value) return []
    return colegios.value.filter(colegio => colegio.comuna_id === comunaSeleccionada.value?.comuna_id)
  })

  // Métodos
  const cargarRegiones = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('colegios')
        .select('region_id, region_nombre')
        .eq('activo', true)
        .order('region_nombre')

      if (supabaseError) throw supabaseError

      // Obtener regiones únicas
      const regionesUnicas = data?.reduce((acc: Region[], current) => {
        const existe = acc.find(r => r.region_id === current.region_id)
        if (!existe) {
          acc.push({
            region_id: current.region_id,
            region_nombre: current.region_nombre
          })
        }
        return acc
      }, []) || []

      regiones.value = regionesUnicas
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar regiones'
      console.error('Error cargando regiones:', err)
    } finally {
      loading.value = false
    }
  }

  const cargarComunas = async (regionId: number) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('colegios')
        .select('comuna_id, comuna_nombre')
        .eq('region_id', regionId)
        .eq('activo', true)
        .order('comuna_nombre')

      if (supabaseError) throw supabaseError

      // Obtener comunas únicas
      const comunasUnicas = data?.reduce((acc: Comuna[], current) => {
        const existe = acc.find(c => c.comuna_id === current.comuna_id)
        if (!existe) {
          acc.push({
            comuna_id: current.comuna_id,
            comuna_nombre: current.comuna_nombre
          })
        }
        return acc
      }, []) || []

      comunas.value = comunasUnicas
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar comunas'
      console.error('Error cargando comunas:', err)
    } finally {
      loading.value = false
    }
  }

  const cargarColegios = async (comunaId: number) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('colegios')
        .select('*')
        .eq('comuna_id', comunaId)
        .eq('activo', true)
        .order('nombre')

      if (supabaseError) throw supabaseError

      colegios.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar colegios'
      console.error('Error cargando colegios:', err)
    } finally {
      loading.value = false
    }
  }

  const buscarColegios = async (comunaId: number, termino: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('colegios')
        .select('*')
        .eq('comuna_id', comunaId)
        .eq('activo', true)
        .ilike('nombre', `%${termino}%`)
        .order('nombre')
        .limit(50) // Limitar resultados para mejor rendimiento

      if (supabaseError) throw supabaseError

      colegios.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al buscar colegios'
      console.error('Error buscando colegios:', err)
    } finally {
      loading.value = false
    }
  }

  // Métodos de selección
  const seleccionarRegion = async (region: Region) => {
    regionSeleccionada.value = region
    comunaSeleccionada.value = null
    colegioSeleccionado.value = null
    comunas.value = []
    colegios.value = []

    if (region) {
      await cargarComunas(region.region_id)
    }
  }

  const seleccionarComuna = async (comuna: Comuna) => {
    comunaSeleccionada.value = comuna
    colegioSeleccionado.value = null
    colegios.value = []

    if (comuna) {
      await cargarColegios(comuna.comuna_id)
    }
  }

  const seleccionarColegio = (colegio: Colegio) => {
    colegioSeleccionado.value = colegio
  }

  const resetearSeleccion = () => {
    regionSeleccionada.value = null
    comunaSeleccionada.value = null
    colegioSeleccionado.value = null
    comunas.value = []
    colegios.value = []
  }

  // Inicializar
  const inicializar = async () => {
    await cargarRegiones()
  }

  return {
    // Estado
    regiones,
    comunas,
    colegios,
    loading,
    error,
    regionSeleccionada,
    comunaSeleccionada,
    colegioSeleccionado,

    // Computed
    comunasFiltradas,
    colegiosFiltrados,

    // Métodos
    cargarRegiones,
    cargarComunas,
    cargarColegios,
    buscarColegios,
    seleccionarRegion,
    seleccionarComuna,
    seleccionarColegio,
    resetearSeleccion,
    inicializar
  }
}
