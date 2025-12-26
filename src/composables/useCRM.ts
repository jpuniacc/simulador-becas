import { ref } from 'vue'
import axios from 'axios'
import type { FormData } from '@/types/simulador'
import type { Carrera } from '@/stores/carrerasStore'

// Usar proxy en desarrollo para evitar CORS, URL directa en producción
// Se desconoce si en prod existira Access-Control-Allow-Origin: *
// Por lo tanto, se usa el proxy en desarrollo para evitar CORS
const getCRMUrl = () => {
  const api = import.meta.env.DEV
  ? '/crm'
  : import.meta.env.VITE_API_MANTIS_WEB
  return api;
}

const CRM_URL = getCRMUrl()
console.log('CRM_URL', CRM_URL)

interface JSONCRM {
  nombre: string
  primerApellido: string
  segundoApellido: string
  email: string
  rut: string
  telefono: string
  carrera: string
  origen: number
  User_Agent: string
}

export function useCRM() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const enviarCRM = async (formData: FormData, carreraInfo?: Carrera | null, userAgent?: string): Promise<any> => {
    // Verificar consentimiento de contacto
    if (!formData.consentimiento_contacto) {
      console.log('Envío al CRM omitido: consentimiento_contacto es false')
      return { skipped: true, reason: 'No hay consentimiento de contacto' }
    }

    loading.value = true
    error.value = null

    try {
      // Construir el JSON usando createJSONcrm
      const data = createJSONcrm(formData, carreraInfo, userAgent)

      console.log('data CRM', data)

      const response = await axios.post(CRM_URL, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('response CRM', response.data)

      return response.data
    } catch (e: any) {
      error.value = e?.response?.data?.des_respuesta || e?.message || 'Error al enviar mensaje al CRM'
      console.error('Error enviarCRM:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const createJSONcrm = (formData: FormData, carreraInfo?: Carrera | null, userAgent?: string): JSONCRM => {
    // Separar apellido en primer y segundo apellido
    const apellidos = formData.apellido?.trim().split(/\s+/) || []
    const primerApellido = apellidos[0] || ''
    const segundoApellido = apellidos.slice(1).join(' ') || ''

    // Obtener y formatear RUT si está disponible
    let rut = ''
    if (formData.tipoIdentificacion === 'rut' && formData.identificacion) {
      // Formatear RUT con puntos y guión (ej: 15.834.697-4)
      const rutLimpio = formData.identificacion.replace(/[^0-9kK]/g, '')
      if (rutLimpio.length >= 8) {
        const rutSinDV = rutLimpio.slice(0, -1)
        const dv = rutLimpio.slice(-1).toUpperCase()
        // Agregar puntos cada 3 dígitos desde la derecha
        const rutFormateado = rutSinDV.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        rut = `${rutFormateado}-${dv}`
      } else {
        rut = formData.identificacion
      }
    }

    // Obtener código de la carrera
    const codigoCarrera = carreraInfo?.codigo_carrera || ''

    // Formatear teléfono con +56 (remover espacios y caracteres especiales, mantener solo números)
    let telefono = formData.telefono?.replace(/\D/g, '') || ''
    if (telefono && !telefono.startsWith('56')) {
      // Si no empieza con 56, agregarlo
      if (telefono.startsWith('9')) {
        telefono = `569${telefono.slice(1)}`
      } else {
        telefono = `56${telefono}`
      }
    }
    if (telefono && !telefono.startsWith('+')) {
      telefono = `+${telefono}`
    }

    return {
      nombre: formData.nombre || '',
      primerApellido,
      segundoApellido,
      email: formData.email || '',
      rut,
      telefono,
      carrera: codigoCarrera,
      origen: 2,
      User_Agent: userAgent || ''
    }
  }

  return {
    loading,
    error,
    enviarCRM,
    createJSONcrm
  }
}

