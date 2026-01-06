import { ref } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import type { FormData } from '@/types/simulador'

type ProspectoInsert = Database['public']['Tables']['prospectos']['Insert']
type ProspectoRow = Database['public']['Tables']['prospectos']['Row']

export function useProspectos() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const insertarProspecto = async (form: FormData, segmentacion?: string): Promise<ProspectoRow | null> => {
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
        anio_nacimiento: form.anio_nacimiento ?? null,

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
        becas_estado: form.usaBecasEstado ?? null,

        // Postgrado
        carreratitulo: form.carreraTitulo || null,
        area_interes: form.area || null,
        modalidadpreferencia: form.modalidadPreferencia && form.modalidadPreferencia.length > 0 ? form.modalidadPreferencia : null,
        objetivo: form.objetivo && form.objetivo.length > 0 ? form.objetivo : null,

        // Consentimiento
        consentimiento_contacto: form.consentimiento_contacto ?? false,

        // Segmentación
        segmentacion: segmentacion || null,

        // JPS: URL de origen del navegador
        // Modificación: Capturar la URL completa del navegador al momento de insertar el prospecto
        // Funcionamiento:
        // - Verifica que window esté disponible (para evitar errores en SSR o contextos sin navegador)
        // - Captura window.location.href que contiene la URL completa (protocolo + host + path + query + hash)
        // - Si window no está disponible, se guarda null
        // - Esto permite rastrear desde qué página/URL el usuario inició el proceso de simulación
        url_origen: typeof window !== 'undefined' ? window.location.href : null
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


