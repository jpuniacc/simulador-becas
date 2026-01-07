import { ref } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import type { FormData } from '@/types/simulador'
import { logger } from '@/utils/logger'

type ProspectoInsert = Database['public']['Tables']['prospectos']['Insert']
type ProspectoRow = Database['public']['Tables']['prospectos']['Row']

export function useProspectos() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Tipo para becas aplicadas
  type BecaAplicada = {
    beca: {
      id: string | number
      nombre?: string
      [key: string]: any
    }
    descuento_aplicado?: number
    monto_descuento?: number
    [key: string]: any
  }

  const insertarProspecto = async (form: FormData, segmentacion?: string, becasAplicadas?: BecaAplicada[], prospectoCrm?: Record<string, any> | null): Promise<ProspectoRow | null> => {
    // JPS: Logging seguro con ofuscación de datos sensibles
    // Modificación: Usar logger.prospecto() que ofusca automáticamente RUT, email, teléfono
    // Funcionamiento: El logger detecta campos sensibles en formData y los reemplaza con asteriscos
    logger.prospecto('Insertando prospecto', { form, segmentacion, becasAplicadas })
    
    loading.value = true
    error.value = null
    try {
      // Extraer región y país del campo paisPasaporte si existe
      // El formato es "REGION-PAIS" (ej: "LA-AR")
      // Nota: paisPasaporte puede no existir en FormData, usar casting seguro
      let regionPais: string | null = null
      let pais: string | null = null

      const formAny = form as any
      if (formAny.paisPasaporte) {
        const [region, countryCode] = formAny.paisPasaporte.split('-')
        regionPais = region || null
        pais = countryCode || null
      }

      // Extraer ID de la beca aplicada (solo puede haber una)
      // Si hay becas aplicadas, guardar el ID de la primera (y única) beca
      const becaId: string | null = becasAplicadas && becasAplicadas.length > 0 && becasAplicadas[0]?.beca?.id != null
        ? String(becasAplicadas[0].beca.id)
        : null

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

        // Beca aplicada (solo puede haber una)
        beca: becaId,

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
        url_origen: typeof window !== 'undefined' ? window.location.href : null,

        // JSON del CRM enviado al sistema de CRM
        prospecto_crm: prospectoCrm || null
      }

      const { data, error: insertError } = await supabase
        .from('prospectos')
        .insert(payload)
        .select('*')
        .single()

      if (insertError) throw insertError
      
      logger.prospecto('Prospecto insertado correctamente', { id: data.id })
      return data
    } catch (e: any) {
      error.value = e?.message || 'Error al insertar prospecto'
      logger.error('Error insertarProspecto:', e)
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


