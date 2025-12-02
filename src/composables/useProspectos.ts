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
    console.log('**********DATOS PROSPECTO***************')
    console.log(form);
    console.log('**********************************')
    loading.value = true
    error.value = null
    try {
      // Extraer región y país del campo paisPasaporte si existe
      // El formato es "REGION-PAIS" (ej: "LA-AR")
      let regionPais: string | null = null
      let pais: string | null = null
      
      if (form.paisPasaporte) {
        const [region, countryCode] = form.paisPasaporte.split('-')
        regionPais = region || null
        pais = countryCode || null
      }

      const payload: ProspectoInsert = {
        // Básicos
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono || null,
        genero: form.genero ? (form.genero as ProspectoInsert['genero']) : null,
        rut: form.tipoIdentificacion === 'rut' ? (form.identificacion || null) : null,
        pasaporte: form.tipoIdentificacion === 'pasaporte' ? (form.identificacion || null) : null,
        region_pais: regionPais,
        pais: pais,

        // Académicos
        curso: form.nivelEducativo || 'No especificado',
        colegio: form.colegio || null,
        carrera: form.carreraId,
        año_egreso: form.añoEgreso ? Number(form.añoEgreso) : null,
        nem: form.nem ?? null,
        ranking: form.ranking ?? null,

        // PAES
        paes: form.rendioPAES ?? null,
        matematica1: form.paes?.matematica ?? null,
        comprension_lectora: form.paes?.lenguaje ?? null,

        // Socioeconómico
        region: form.regionResidencia || null,
        comuna: form.comunaResidencia || null,
        decil: form.decil != null ? String(form.decil) : null,
        rango_ingreso: form.ingresoMensual,
        cae: form.planeaUsarCAE ?? null,
        becas_estado: form.usaBecasEstado ?? null
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


