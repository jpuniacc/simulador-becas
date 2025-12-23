import { ref } from 'vue'
import axios from 'axios'
import type { FormData } from '@/types/simulador'
import type { Carrera } from '@/stores/carrerasStore'

const CRM_URL = 'https://crmdifusion.uniacc.cl/webservice/ws_whatsapp.php'

interface JSONCRM {
  modalidad: string
  rut: string
  primerApellido: string
  conversacion: string
  nombre: string
  origen: string
  telefono: string
  segundoApellido: string
  utm_source: string
  email: string
  carrera: string
}

export function useCRM() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const enviarCRM = async (formData: FormData, carreraInfo?: Carrera | null): Promise<any> => {
    // Verificar consentimiento de contacto
    if (!formData.consentimiento_contacto) {
      console.log('Envío al CRM omitido: consentimiento_contacto es false')
      return { skipped: true, reason: 'No hay consentimiento de contacto' }
    }

    loading.value = true
    error.value = null

    try {
      // Construir el JSON usando createJSONcrm
      const data = createJSONcrm(formData, carreraInfo)

      console.log('data CRM', data)

      const response = await axios.post(CRM_URL, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (e: any) {
      error.value = e?.response?.data?.des_respuesta || e?.message || 'Error al enviar mensaje al CRM'
      console.error('Error enviarCRM:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const createJSONcrm = (formData: FormData, carreraInfo?: Carrera | null): JSONCRM => {
    // Separar apellido en primer y segundo apellido
    const apellidos = formData.apellido?.trim().split(/\s+/) || []
    const primerApellido = apellidos[0] || ''
    const segundoApellido = apellidos.slice(1).join(' ') || ''

    // Obtener RUT si está disponible
    const rut = formData.tipoIdentificacion === 'rut' && formData.identificacion
      ? formData.identificacion
      : ''

    // Obtener modalidad
    const modalidad = carreraInfo?.modalidad_programa || ''

    // Obtener código de la carrera
    const codigoCarrera = carreraInfo?.codigo_carrera || ''

    // Formatear teléfono (remover espacios y caracteres especiales, mantener solo números)
    const telefono = formData.telefono?.replace(/\D/g, '') || ''

    // Construir conversación
    const conversacionParts: string[] = []
    conversacionParts.push(`El cliente, ${formData.nombre} ${formData.apellido}, solicitó información sobre ${carreraInfo?.nombre_programa || 'programas académicos'}.`)

    if (formData.email) {
      conversacionParts.push(`Proporcionó su correo electrónico: ${formData.email}.`)
    }

    if (rut) {
      conversacionParts.push(`RUT: ${rut}.`)
    }

    if (formData.telefono) {
      conversacionParts.push(`Teléfono: ${formData.telefono}.`)
    }

    if (formData.nivelEducativo) {
      conversacionParts.push(`Nivel educativo: ${formData.nivelEducativo}.`)
    }

    conversacionParts.push('El simulador confirmó la recepción de los datos y mencionó que un ejecutivo de admisión atenderá al cliente para continuar con el proceso de postulación.')

    const conversacion = conversacionParts.join(' ')

    return {
      modalidad,
      rut,
      primerApellido,
      conversacion,
      nombre: formData.nombre || '',
      origen: 'Web',
      telefono,
      segundoApellido,
      utm_source: 'Simulador_Becas',
      email: formData.email || '',
      carrera: codigoCarrera
    }
  }

  return {
    loading,
    error,
    enviarCRM,
    createJSONcrm
  }
}

