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
  const cargarCarreras = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('carreras_uniacc')
        .select('*')
        .eq('version_simulador', 1)
        .order('nombre_programa')

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
      carrera.nombre_programa.toLowerCase().includes(terminoLower) 
    )
  }

  const obtenerArancelCarrera = (nombreCarrera: string) => {
    const carrera = carrerasVigentes.value.find(c => c.nombre_programa === nombreCarrera)
    return carrera?.arancel || 0
  }

  const obtenerArancelReferenciaCae = (nombreCarrera: string) => {
    const carrera = carrerasVigentes.value.find(c => c.nombre_programa === nombreCarrera)
    return carrera?.arancel_referencia_cae || 0
  }

  const obtenerMatriculaCarrera = (nombreCarrera: string) => {
    const carrera = carrerasVigentes.value.find(c => c.nombre_programa === nombreCarrera)
    return carrera?.matricula || 0
  }

  const obtenerCarreraPorNombre = (nombreCarrera: string) => {
    return carrerasVigentes.value.find(c => c.nombre_programa === nombreCarrera)
  }

  const obtenerCostosCarrera = (nombreCarrera: string) => {
    const carrera = obtenerCarreraPorNombre(nombreCarrera)
    if (!carrera) return null

    return {
      arancel: carrera.arancel || 0,
      arancelReferenciaCae: carrera.arancel_referencia_cae || 0,
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
    obtenerArancelReferenciaCae,
    obtenerMatriculaCarrera,
    obtenerCarreraPorNombre,
    obtenerCostosCarrera
  }
})
