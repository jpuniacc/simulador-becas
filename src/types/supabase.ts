export interface Database {
  public: {
    Tables: {
      nacionalidades: {
        Row: {
          id: string
          codigo_iso: string
          nombre_espanol: string
          nombre_ingles: string
          continente: string
          region: string | null
          activa: boolean
          orden_visual: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_iso: string
          nombre_espanol: string
          nombre_ingles: string
          continente: string
          region?: string | null
          activa?: boolean
          orden_visual?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_iso?: string
          nombre_espanol?: string
          nombre_ingles?: string
          continente?: string
          region?: string | null
          activa?: boolean
          orden_visual?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      prospectos: {
        Row: {
          id: string
          nombre: string
          apellido: string
          email: string
          telefono: string | null
          rut: string | null
          pasaporte: string | null
          fecha_nacimiento: string | null
          nacionalidad_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          apellido: string
          email: string
          telefono?: string | null
          rut?: string | null
          pasaporte?: string | null
          fecha_nacimiento?: string | null
          nacionalidad_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          apellido?: string
          email?: string
          telefono?: string | null
          rut?: string | null
          pasaporte?: string | null
          fecha_nacimiento?: string | null
          nacionalidad_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      colegios: {
        Row: {
          id: string
          rbd: string
          nombre: string
          nombre_corto: string | null
          dependencia: 'Municipal' | 'Particular Subvencionado' | 'Particular Pagado' | 'Corporación de Administración Delegada' | 'Servicio Local de Educación'
          tipo_educacion: 'Básica' | 'Media' | 'Básica y Media' | 'Especial'
          modalidad: string | null
          region_id: number
          region_nombre: string
          comuna_id: number
          comuna_nombre: string
          direccion: string | null
          telefono: string | null
          email: string | null
          sitio_web: string | null
          latitud: number | null
          longitud: number | null
          activo: boolean
          fecha_creacion: string | null
          fecha_cierre: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rbd: string
          nombre: string
          nombre_corto?: string | null
          dependencia: 'Municipal' | 'Particular Subvencionado' | 'Particular Pagado' | 'Corporación de Administración Delegada' | 'Servicio Local de Educación'
          tipo_educacion: 'Básica' | 'Media' | 'Básica y Media' | 'Especial'
          modalidad?: string | null
          region_id: number
          region_nombre: string
          comuna_id: number
          comuna_nombre: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          sitio_web?: string | null
          latitud?: number | null
          longitud?: number | null
          activo?: boolean
          fecha_creacion?: string | null
          fecha_cierre?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rbd?: string
          nombre?: string
          nombre_corto?: string | null
          dependencia?: 'Municipal' | 'Particular Subvencionado' | 'Particular Pagado' | 'Corporación de Administración Delegada' | 'Servicio Local de Educación'
          tipo_educacion?: 'Básica' | 'Media' | 'Básica y Media' | 'Especial'
          modalidad?: string | null
          region_id?: number
          region_nombre?: string
          comuna_id?: number
          comuna_nombre?: string
          direccion?: string | null
          telefono?: string | null
          email?: string | null
          sitio_web?: string | null
          latitud?: number | null
          longitud?: number | null
          activo?: boolean
          fecha_creacion?: string | null
          fecha_cierre?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deciles: {
        Row: {
          id: string
          decil: number
          rango_ingreso_min: number
          rango_ingreso_max: number
          descripcion: string
          descripcion_corta: string
          porcentaje_poblacion: number
          activo: boolean
          orden_visual: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          decil: number
          rango_ingreso_min: number
          rango_ingreso_max: number
          descripcion: string
          descripcion_corta: string
          porcentaje_poblacion: number
          activo?: boolean
          orden_visual: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          decil?: number
          rango_ingreso_min?: number
          rango_ingreso_max?: number
          descripcion?: string
          descripcion_corta?: string
          porcentaje_poblacion?: number
          activo?: boolean
          orden_visual?: number
          created_at?: string
          updated_at?: string
        }
      }
      datos_socioeconomicos: {
        Row: {
          id: string
          prospecto_id: string
          usa_cae: boolean
          decil_ingreso: number | null
          ingreso_mensual: number | null
          numero_integrantes_familia: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prospecto_id: string
          usa_cae?: boolean
          decil_ingreso?: number | null
          ingreso_mensual?: number | null
          numero_integrantes_familia?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prospecto_id?: string
          usa_cae?: boolean
          decil_ingreso?: number | null
          ingreso_mensual?: number | null
          numero_integrantes_familia?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      puntajes_paes: {
        Row: {
          id: string
          prospecto_id: string
          estado_estudiante: 'sin_rendir' | 'en_proceso' | 'rendido' | 'no_aplica'
          fecha_rendicion: string | null
          año_rendicion: number | null
          tipo_rendicion: 'Regular' | 'Especial' | 'PAA'
          rendio_paes: boolean
          puntaje_comprension_lectora: number | null
          puntaje_matematica_1: number | null
          puntaje_matematica_2: number | null
          puntaje_historia_geografia: number | null
          puntaje_ciencias: number | null
          puntaje_fisica: number | null
          puntaje_quimica: number | null
          puntaje_biologia: number | null
          puntaje_total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prospecto_id: string
          estado_estudiante?: 'sin_rendir' | 'en_proceso' | 'rendido' | 'no_aplica'
          fecha_rendicion?: string | null
          año_rendicion?: number | null
          tipo_rendicion?: 'Regular' | 'Especial' | 'PAA'
          rendio_paes?: boolean
          puntaje_comprension_lectora?: number | null
          puntaje_matematica_1?: number | null
          puntaje_matematica_2?: number | null
          puntaje_historia_geografia?: number | null
          puntaje_ciencias?: number | null
          puntaje_fisica?: number | null
          puntaje_quimica?: number | null
          puntaje_biologia?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prospecto_id?: string
          estado_estudiante?: 'sin_rendir' | 'en_proceso' | 'rendido' | 'no_aplica'
          fecha_rendicion?: string | null
          año_rendicion?: number | null
          tipo_rendicion?: 'Regular' | 'Especial' | 'PAA'
          rendio_paes?: boolean
          puntaje_comprension_lectora?: number | null
          puntaje_matematica_1?: number | null
          puntaje_matematica_2?: number | null
          puntaje_historia_geografia?: number | null
          puntaje_ciencias?: number | null
          puntaje_fisica?: number | null
          puntaje_quimica?: number | null
          puntaje_biologia?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      datos_academicos: {
        Row: {
          id: string
          prospecto_id: string
          colegio_id: string | null
          nombre_colegio: string | null
          region_colegio: string | null
          comuna_colegio: string | null
          tipo_colegio: string | null
          carrera_deseada: string
          nivel_educativo_actual: '1ro Medio' | '2do Medio' | '3ro Medio' | '4to Medio' | 'Egresado'
          promedio: number | null
          nem: number | null
          ranking: number | null
          año_egreso: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prospecto_id: string
          colegio_id?: string | null
          nombre_colegio?: string | null
          region_colegio?: string | null
          comuna_colegio?: string | null
          tipo_colegio?: string | null
          carrera_deseada: string
          nivel_educativo_actual?: '1ro Medio' | '2do Medio' | '3ro Medio' | '4to Medio' | 'Egresado'
          promedio?: number | null
          nem?: number | null
          ranking?: number | null
          año_egreso?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prospecto_id?: string
          colegio_id?: string | null
          nombre_colegio?: string | null
          region_colegio?: string | null
          comuna_colegio?: string | null
          tipo_colegio?: string | null
          carrera_deseada?: string
          nivel_educativo_actual?: '1ro Medio' | '2do Medio' | '3ro Medio' | '4to Medio' | 'Egresado'
          promedio?: number | null
          nem?: number | null
          ranking?: number | null
          año_egreso?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      becas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          porcentaje_descuento: number | null
          monto_fijo: number | null
          requisitos: string[] | null
          activa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          porcentaje_descuento?: number | null
          monto_fijo?: number | null
          requisitos?: string[] | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          porcentaje_descuento?: number | null
          monto_fijo?: number | null
          requisitos?: string[] | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      beneficios: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          tipo: 'Descuento' | 'Financiamiento' | 'Beca' | 'Convenio'
          valor: number | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          tipo: 'Descuento' | 'Financiamiento' | 'Beca' | 'Convenio'
          valor?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          tipo?: 'Descuento' | 'Financiamiento' | 'Beca' | 'Convenio'
          valor?: number | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      beneficios_uniacc: {
        Row: {
          id: string
          codigo_beneficio: number
          descripcion: string
          porcentaje_maximo: number | null
          monto_maximo: number | null
          tipo_beneficio: 'BECA' | 'FINANCIAMIENTO' | 'FINANCIERO'
          origen_beneficio: 'INTERNO' | 'EXTERNO'
          aplicacion_concepto: 'A' | 'M'
          aplicacion: 'SALDO' | 'TOTAL'
          prioridad: number | null
          vigente: boolean
          usuario_creacion: number | null
          fecha_modificacion: string | null
          requisitos: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_beneficio: number
          descripcion: string
          porcentaje_maximo?: number | null
          monto_maximo?: number | null
          tipo_beneficio: 'BECA' | 'FINANCIAMIENTO' | 'FINANCIERO'
          origen_beneficio: 'INTERNO' | 'EXTERNO'
          aplicacion_concepto: 'A' | 'M'
          aplicacion: 'SALDO' | 'TOTAL'
          prioridad?: number | null
          vigente?: boolean
          usuario_creacion?: number | null
          fecha_modificacion?: string | null
          requisitos?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_beneficio?: number
          descripcion?: string
          porcentaje_maximo?: number | null
          monto_maximo?: number | null
          tipo_beneficio?: 'BECA' | 'FINANCIAMIENTO' | 'FINANCIERO'
          origen_beneficio?: 'INTERNO' | 'EXTERNO'
          aplicacion_concepto?: 'A' | 'M'
          aplicacion?: 'SALDO' | 'TOTAL'
          prioridad?: number | null
          vigente?: boolean
          usuario_creacion?: number | null
          fecha_modificacion?: string | null
          requisitos?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      simulaciones: {
        Row: {
          id: string
          prospecto_id: string
          datos_entrada: any
          resultados: any | null
          beneficios_aplicables: any | null
          fecha_simulacion: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prospecto_id: string
          datos_entrada: any
          resultados?: any | null
          beneficios_aplicables?: any | null
          fecha_simulacion?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prospecto_id?: string
          datos_entrada?: any
          resultados?: any | null
          beneficios_aplicables?: any | null
          fecha_simulacion?: string
          created_at?: string
          updated_at?: string
        }
      }
      carreras: {
        Row: {
          id: number
          nombre_carrera: string
          tipo_plan_carrera: string
          nombre_titulo: string
          nombre_grado: string
          nivel_global: string
          area_actual: string
          vigencia: string
          descripcion_escuela: string
          descripcion_facultad: string
        }
        Insert: {
          id?: number
          nombre_carrera: string
          tipo_plan_carrera: string
          nombre_titulo: string
          nombre_grado: string
          nivel_global: string
          area_actual: string
          vigencia: string
          descripcion_escuela: string
          descripcion_facultad: string
        }
        Update: {
          id?: number
          nombre_carrera?: string
          tipo_plan_carrera?: string
          nombre_titulo?: string
          nombre_grado?: string
          nivel_global?: string
          area_actual?: string
          vigencia?: string
          descripcion_escuela?: string
          descripcion_facultad?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      puede_simular: {
        Args: {
          prospecto_uuid: string
        }
        Returns: boolean
      }
      obtener_beneficios_por_nivel: {
        Args: {
          prospecto_uuid: string
        }
        Returns: {
          codigo_beneficio: number
          descripcion: string
          porcentaje_maximo: number | null
          monto_maximo: number | null
          tipo_beneficio: string
          elegible: boolean
          razon_elegibilidad: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
