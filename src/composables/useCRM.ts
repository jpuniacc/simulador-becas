import { ref } from 'vue'
import axios from 'axios'
import type { FormData } from '@/types/simulador'
import type { Carrera } from '@/stores/carrerasStore'

// JPS: Función para determinar la URL del CRM según el ambiente de ejecución
// Modificación: Detección dinámica del ambiente (localhost, QA/DEV, producción) para resolver problemas de CORS
// Funcionamiento:
// - En localhost: retorna '/crm/webservice/formulario_web.php' que usa el proxy de Vite configurado en vite.config.ts
//   El proxy redirige las peticiones a http://crmadmision-qa.uniacc.cl evitando errores de CORS desde localhost
// - En QA/DEV (similador.uniacc.cl): retorna la URL directa 'http://crmadmision-qa.uniacc.cl/webservice/formulario_web.php'
//   Las peticiones se envían directamente desde el dominio similador.uniacc.cl, evitando errores de CORS
// - En producción: usa VITE_API_MANTIS_WEB si está configurada, sino usa la URL de QA por defecto
// La detección se hace en tiempo de ejecución en cada petición, no al cargar el módulo
const getCRMUrl = () => {
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const isQA = typeof window !== 'undefined' &&
    window.location.hostname.includes('similador.uniacc.cl')

  // En localhost, usar proxy
  if (isLocalhost) {
    return '/crm/webservice/formulario_web.php'
  }

  // En QA/DEV, usar URL directa del CRM
  if (isQA || import.meta.env.VITE_ENV === 'qa' || import.meta.env.VITE_ENV === 'dev') {
    return 'http://crmadmision-qa.uniacc.cl/webservice/formulario_web.php'
  }

  // En producción, usar URL de producción si está configurada
  return import.meta.env.VITE_API_MANTIS_WEB || 'http://crmadmision-qa.uniacc.cl/webservice/formulario_web.php'
}

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

      // JPS: Obtener la URL del CRM según el ambiente actual en tiempo de ejecución
      // Modificación: La URL se determina dinámicamente en cada petición, no al cargar el módulo
      // Funcionamiento: Esto permite que la misma build funcione en diferentes ambientes (localhost, QA/DEV, producción)
      // sin necesidad de recompilar, detectando automáticamente el dominio desde donde se ejecuta la aplicación
      const crmUrl = getCRMUrl()
      console.log('CRM_URL', crmUrl)
      console.log('data CRM', data)

      const response = await axios.post(crmUrl, data, {
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

