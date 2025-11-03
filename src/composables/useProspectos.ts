import { ref } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import type { FormData } from '@/types/simulador'

type ProspectoInsert = Database['public']['Tables']['prospectos']['Insert']
type ProspectoRow = Database['public']['Tables']['prospectos']['Row']

export function useProspectos() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const insertarProspecto = async (form: FormData): Promise<ProspectoRow | null> => {
    loading.value = true
    error.value = null
    try {
      const payload: ProspectoInsert = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono || null,
        genero: form.genero ? (form.genero as ProspectoInsert['genero']) : null,
        fecha_nacimiento: form.fechaNacimiento || null,
        rut: form.tipoIdentificacion === 'rut' ? (form.identificacion || null) : null,
        pasaporte: form.tipoIdentificacion === 'pasaporte' ? (form.identificacion || null) : null,
        nacionalidad_id: null
      }

      const { data, error: insertError } = await supabase
        .from('prospectos')
        .insert(payload)
        .select('*')
        .single()

      if (insertError) throw insertError
      return data
    } catch (e: any) {
      error.value = e?.message || 'Error al insertar prospecto'
      console.error('Error insertarProspecto:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    insertarProspecto
  }
}


