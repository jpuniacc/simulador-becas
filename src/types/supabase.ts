export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      aranceles_cae: {
        Row: {
          arancel_anual: number | null
          arancel_referencia: number | null
          codigo_carrera: number | null
          codigo_ies: number | null
          created_at: string
          duracion_maxima: number | null
          id: number
          id_carrera: number | null
          jornada: string | null
          nombre_carrera: string | null
        }
        Insert: {
          arancel_anual?: number | null
          arancel_referencia?: number | null
          codigo_carrera?: number | null
          codigo_ies?: number | null
          created_at?: string
          duracion_maxima?: number | null
          id?: number
          id_carrera?: number | null
          jornada?: string | null
          nombre_carrera?: string | null
        }
        Update: {
          arancel_anual?: number | null
          arancel_referencia?: number | null
          codigo_carrera?: number | null
          codigo_ies?: number | null
          created_at?: string
          duracion_maxima?: number | null
          id?: number
          id_carrera?: number | null
          jornada?: string | null
          nombre_carrera?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "foreign_key_carrera_arancel"
            columns: ["id_carrera"]
            isOneToOne: false
            referencedRelation: "carreras_uniacc"
            referencedColumns: ["id"]
          },
        ]
      }
      becas_estado: {
        Row: {
          codigo_beca: string | null
          created_at: string
          decil_maximo: number | null
          descripcion: string | null
          descuento_monto: number | null
          descuento_porcentaje: number | null
          id: number
          nem_minimo: number | null
          nombre: string | null
          paes_minimo: number | null
          requeire_decil: boolean | null
          requiere_nem: boolean | null
          requiere_paes: boolean | null
          tipo_descuento: string | null
        }
        Insert: {
          codigo_beca?: string | null
          created_at?: string
          decil_maximo?: number | null
          descripcion?: string | null
          descuento_monto?: number | null
          descuento_porcentaje?: number | null
          id?: number
          nem_minimo?: number | null
          nombre?: string | null
          paes_minimo?: number | null
          requeire_decil?: boolean | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          tipo_descuento?: string | null
        }
        Update: {
          codigo_beca?: string | null
          created_at?: string
          decil_maximo?: number | null
          descripcion?: string | null
          descuento_monto?: number | null
          descuento_porcentaje?: number | null
          id?: number
          nem_minimo?: number | null
          nombre?: string | null
          paes_minimo?: number | null
          requeire_decil?: boolean | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          tipo_descuento?: string | null
        }
        Relationships: []
      }
      becas_informativas: {
        Row: {
          codigo: string
          descripcion: string
          estado: string | null
          id: string
          nombre: string
          porcentajes: Json | null
          requisitos: Json | null
          vigente_desde: string
          vigente_hasta: string
        }
        Insert: {
          codigo: string
          descripcion: string
          estado?: string | null
          id?: string
          nombre: string
          porcentajes?: Json | null
          requisitos?: Json | null
          vigente_desde: string
          vigente_hasta: string
        }
        Update: {
          codigo?: string
          descripcion?: string
          estado?: string | null
          id?: string
          nombre?: string
          porcentajes?: Json | null
          requisitos?: Json | null
          vigente_desde?: string
          vigente_hasta?: string
        }
        Relationships: []
      }
      becas_uniacc: {
        Row: {
          activa: boolean | null
          becas_incompatibles: Json | null
          carreras_aplicables: Json | null
          codigo_beca: string
          created_at: string | null
          cupos_disponibles: number | null
          cupos_utilizados: number | null
          descripcion: string | null
          descuento_monto_fijo: number | null
          descuento_porcentaje: number | null
          duracion_meses: number | null
          duracion_tipo: string | null
          edad_requerida: number | null
          es_combinable: boolean | null
          id: string
          max_anos_egreso: number | null
          max_anos_paes: number | null
          modalidades_aplicables: Json
          nem_minimo: number | null
          nivel_aplicable: string | null
          nombre: string
          paes_minimo: number | null
          prioridad: number | null
          proceso_evaluacion: string | null
          programas_excluidos: Json | null
          ranking_minimo: number | null
          region_excluida: string | null
          requiere_beca_estado: boolean | null
          requiere_documentacion: Json | null
          requiere_extranjeria: boolean | null
          requiere_genero: string | null
          requiere_nem: boolean | null
          requiere_paes: boolean | null
          requiere_ranking: boolean | null
          requiere_region_especifica: boolean | null
          requiere_residencia_chile: boolean | null
          tipo: string | null
          tipo_descuento: string | null
          updated_at: string | null
          vigencia_desde: string
          vigencia_hasta: string | null
        }
        Insert: {
          activa?: boolean | null
          becas_incompatibles?: Json | null
          carreras_aplicables?: Json | null
          codigo_beca: string
          created_at?: string | null
          cupos_disponibles?: number | null
          cupos_utilizados?: number | null
          descripcion?: string | null
          descuento_monto_fijo?: number | null
          descuento_porcentaje?: number | null
          duracion_meses?: number | null
          duracion_tipo?: string | null
          edad_requerida?: number | null
          es_combinable?: boolean | null
          id?: string
          max_anos_egreso?: number | null
          max_anos_paes?: number | null
          modalidades_aplicables: Json
          nem_minimo?: number | null
          nivel_aplicable?: string | null
          nombre: string
          paes_minimo?: number | null
          prioridad?: number | null
          proceso_evaluacion?: string | null
          programas_excluidos?: Json | null
          ranking_minimo?: number | null
          region_excluida?: string | null
          requiere_beca_estado?: boolean | null
          requiere_documentacion?: Json | null
          requiere_extranjeria?: boolean | null
          requiere_genero?: string | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          requiere_ranking?: boolean | null
          requiere_region_especifica?: boolean | null
          requiere_residencia_chile?: boolean | null
          tipo?: string | null
          tipo_descuento?: string | null
          updated_at?: string | null
          vigencia_desde: string
          vigencia_hasta?: string | null
        }
        Update: {
          activa?: boolean | null
          becas_incompatibles?: Json | null
          carreras_aplicables?: Json | null
          codigo_beca?: string
          created_at?: string | null
          cupos_disponibles?: number | null
          cupos_utilizados?: number | null
          descripcion?: string | null
          descuento_monto_fijo?: number | null
          descuento_porcentaje?: number | null
          duracion_meses?: number | null
          duracion_tipo?: string | null
          edad_requerida?: number | null
          es_combinable?: boolean | null
          id?: string
          max_anos_egreso?: number | null
          max_anos_paes?: number | null
          modalidades_aplicables?: Json
          nem_minimo?: number | null
          nivel_aplicable?: string | null
          nombre?: string
          paes_minimo?: number | null
          prioridad?: number | null
          proceso_evaluacion?: string | null
          programas_excluidos?: Json | null
          ranking_minimo?: number | null
          region_excluida?: string | null
          requiere_beca_estado?: boolean | null
          requiere_documentacion?: Json | null
          requiere_extranjeria?: boolean | null
          requiere_genero?: string | null
          requiere_nem?: boolean | null
          requiere_paes?: boolean | null
          requiere_ranking?: boolean | null
          requiere_region_especifica?: boolean | null
          requiere_residencia_chile?: boolean | null
          tipo?: string | null
          tipo_descuento?: string | null
          updated_at?: string | null
          vigencia_desde?: string
          vigencia_hasta?: string | null
        }
        Relationships: []
      }
      carreras: {
        Row: {
          anio: number | null
          arancel_carrera: number | null
          area_actual: string
          descripcion_escuela: string
          descripcion_facultad: string
          duracion_en_semestres: number | null
          id: number
          matricula_carrera: number | null
          nivel_global: string
          nombre_carrera: string
          nombre_grado: string
          nombre_titulo: string
          tipo_plan_carrera: string
          vigencia: string
        }
        Insert: {
          anio?: number | null
          arancel_carrera?: number | null
          area_actual: string
          descripcion_escuela: string
          descripcion_facultad: string
          duracion_en_semestres?: number | null
          id?: number
          matricula_carrera?: number | null
          nivel_global: string
          nombre_carrera: string
          nombre_grado: string
          nombre_titulo: string
          tipo_plan_carrera: string
          vigencia: string
        }
        Update: {
          anio?: number | null
          arancel_carrera?: number | null
          area_actual?: string
          descripcion_escuela?: string
          descripcion_facultad?: string
          duracion_en_semestres?: number | null
          id?: number
          matricula_carrera?: number | null
          nivel_global?: string
          nombre_carrera?: string
          nombre_grado?: string
          nombre_titulo?: string
          tipo_plan_carrera?: string
          vigencia?: string
        }
        Relationships: []
      }
      carreras_uniacc: {
        Row: {
          anio: number
          anio_arancel_referencia: number | null
          arancel: number
          arancel_referencia: number | null
          codigo_carrera: string | null
          descripcion_programa: string
          duracion_programa: string
          facultad: string | null
          id: number
          malla: string
          matricula: number
          modalidad_programa: string | null
          nivel_academico: string | null
          nombre_programa: string
          requisitos_ingreso: string
          version_simulador: number | null
        }
        Insert: {
          anio: number
          anio_arancel_referencia?: number | null
          arancel: number
          arancel_referencia?: number | null
          codigo_carrera?: string | null
          descripcion_programa: string
          duracion_programa: string
          facultad?: string | null
          id?: number
          malla: string
          matricula: number
          modalidad_programa?: string | null
          nivel_academico?: string | null
          nombre_programa: string
          requisitos_ingreso: string
          version_simulador?: number | null
        }
        Update: {
          anio?: number
          anio_arancel_referencia?: number | null
          arancel?: number
          arancel_referencia?: number | null
          codigo_carrera?: string | null
          descripcion_programa?: string
          duracion_programa?: string
          facultad?: string | null
          id?: number
          malla?: string
          matricula?: number
          modalidad_programa?: string | null
          nivel_academico?: string | null
          nombre_programa?: string
          requisitos_ingreso?: string
          version_simulador?: number | null
        }
        Relationships: []
      }
      colegios: {
        Row: {
          activo: boolean | null
          comuna_id: number
          comuna_nombre: string
          created_at: string | null
          dependencia: string
          direccion: string | null
          email: string | null
          fecha_cierre: string | null
          fecha_creacion: string | null
          id: string
          latitud: number | null
          longitud: number | null
          modalidad: string | null
          nombre: string
          nombre_corto: string | null
          rbd: string
          region_id: number
          region_nombre: string
          sitio_web: string | null
          telefono: string | null
          tipo_educacion: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          comuna_id: number
          comuna_nombre: string
          created_at?: string | null
          dependencia: string
          direccion?: string | null
          email?: string | null
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          modalidad?: string | null
          nombre: string
          nombre_corto?: string | null
          rbd: string
          region_id: number
          region_nombre: string
          sitio_web?: string | null
          telefono?: string | null
          tipo_educacion: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          comuna_id?: number
          comuna_nombre?: string
          created_at?: string | null
          dependencia?: string
          direccion?: string | null
          email?: string | null
          fecha_cierre?: string | null
          fecha_creacion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          modalidad?: string | null
          nombre?: string
          nombre_corto?: string | null
          rbd?: string
          region_id?: number
          region_nombre?: string
          sitio_web?: string | null
          telefono?: string | null
          tipo_educacion?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      colegios2: {
        Row: {
          comuna_nombre: string | null
          dependencia: string | null
          id: number
          nombre: string | null
          rbd: number | null
          region_id: number | null
          region_nombre: string | null
        }
        Insert: {
          comuna_nombre?: string | null
          dependencia?: string | null
          id?: number
          nombre?: string | null
          rbd?: number | null
          region_id?: number | null
          region_nombre?: string | null
        }
        Update: {
          comuna_nombre?: string | null
          dependencia?: string | null
          id?: number
          nombre?: string | null
          rbd?: number | null
          region_id?: number | null
          region_nombre?: string | null
        }
        Relationships: []
      }
      colegios3: {
        Row: {
          comuna_nombre: string | null
          dependencia: string | null
          descripcion_orientacion_religiosa: string | null
          dv: string | null
          nombre: string | null
          orientacion_religiosa: string | null
          rbd: string | null
          rbd_rural: string | null
          region_id: number | null
          region_nombre: string | null
        }
        Insert: {
          comuna_nombre?: string | null
          dependencia?: string | null
          descripcion_orientacion_religiosa?: string | null
          dv?: string | null
          nombre?: string | null
          orientacion_religiosa?: string | null
          rbd?: string | null
          rbd_rural?: string | null
          region_id?: number | null
          region_nombre?: string | null
        }
        Update: {
          comuna_nombre?: string | null
          dependencia?: string | null
          descripcion_orientacion_religiosa?: string | null
          dv?: string | null
          nombre?: string | null
          orientacion_religiosa?: string | null
          rbd?: string | null
          rbd_rural?: string | null
          region_id?: number | null
          region_nombre?: string | null
        }
        Relationships: []
      }
      datos_academicos: {
        Row: {
          año_egreso: number | null
          carrera_deseada: string
          colegio_id: string | null
          comuna_colegio: string | null
          created_at: string | null
          id: string
          nem: number | null
          nivel_educativo_actual: string | null
          nombre_colegio: string | null
          promedio: number | null
          prospecto_id: string
          ranking: number | null
          region_colegio: string | null
          tipo_colegio: string | null
          tipo_programa: string | null
          updated_at: string | null
        }
        Insert: {
          año_egreso?: number | null
          carrera_deseada: string
          colegio_id?: string | null
          comuna_colegio?: string | null
          created_at?: string | null
          id?: string
          nem?: number | null
          nivel_educativo_actual?: string | null
          nombre_colegio?: string | null
          promedio?: number | null
          prospecto_id: string
          ranking?: number | null
          region_colegio?: string | null
          tipo_colegio?: string | null
          tipo_programa?: string | null
          updated_at?: string | null
        }
        Update: {
          año_egreso?: number | null
          carrera_deseada?: string
          colegio_id?: string | null
          comuna_colegio?: string | null
          created_at?: string | null
          id?: string
          nem?: number | null
          nivel_educativo_actual?: string | null
          nombre_colegio?: string | null
          promedio?: number | null
          prospecto_id?: string
          ranking?: number | null
          region_colegio?: string | null
          tipo_colegio?: string | null
          tipo_programa?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "datos_academicos_colegio_id_fkey"
            columns: ["colegio_id"]
            isOneToOne: false
            referencedRelation: "colegios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "datos_academicos_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      datos_socioeconomicos: {
        Row: {
          comuna_residencia: string | null
          created_at: string | null
          decil_ingreso: number | null
          id: string
          ingreso_mensual: number | null
          numero_integrantes_familia: number | null
          planea_usar_cae: boolean | null
          prospecto_id: string
          region_residencia: string | null
          updated_at: string | null
          usa_becas_estado: boolean | null
        }
        Insert: {
          comuna_residencia?: string | null
          created_at?: string | null
          decil_ingreso?: number | null
          id?: string
          ingreso_mensual?: number | null
          numero_integrantes_familia?: number | null
          planea_usar_cae?: boolean | null
          prospecto_id: string
          region_residencia?: string | null
          updated_at?: string | null
          usa_becas_estado?: boolean | null
        }
        Update: {
          comuna_residencia?: string | null
          created_at?: string | null
          decil_ingreso?: number | null
          id?: string
          ingreso_mensual?: number | null
          numero_integrantes_familia?: number | null
          planea_usar_cae?: boolean | null
          prospecto_id?: string
          region_residencia?: string | null
          updated_at?: string | null
          usa_becas_estado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "datos_socioeconomicos_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      deciles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          decil: number
          descripcion: string
          descripcion_corta: string
          id: string
          orden_visual: number
          porcentaje_poblacion: number
          rango_ingreso_max: number
          rango_ingreso_min: number
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          decil: number
          descripcion: string
          descripcion_corta: string
          id?: string
          orden_visual: number
          porcentaje_poblacion: number
          rango_ingreso_max: number
          rango_ingreso_min: number
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          decil?: number
          descripcion?: string
          descripcion_corta?: string
          id?: string
          orden_visual?: number
          porcentaje_poblacion?: number
          rango_ingreso_max?: number
          rango_ingreso_min?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      descuento_modo_pago: {
        Row: {
          activa: boolean | null
          dscto_arancel: number | null
          id: string
          nombre: string | null
        }
        Insert: {
          activa?: boolean | null
          dscto_arancel?: number | null
          id?: string
          nombre?: string | null
        }
        Update: {
          activa?: boolean | null
          dscto_arancel?: number | null
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      descuento_pago_anticipado: {
        Row: {
          activa: boolean | null
          dscto_arancel: number | null
          dscto_matricula: number | null
          fecha_inicio: string | null
          fecha_termino: string | null
          id: string
          nombre: string | null
        }
        Insert: {
          activa?: boolean | null
          dscto_arancel?: number | null
          dscto_matricula?: number | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          nombre?: string | null
        }
        Update: {
          activa?: boolean | null
          dscto_arancel?: number | null
          dscto_matricula?: number | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      mnp_mt_alumno: {
        Row: {
          ano: number | null
          ano_mat: number | null
          anopestud: number | null
          codcarpr: string
          codcli: string
          codpestud: string | null
          codsede: string | null
          estacad: string | null
          jornada: string | null
          periodo: number | null
          periodo_mat: number | null
          periodos: number | null
          rut: string | null
          sync_state: string | null
          tipositu: number | null
        }
        Insert: {
          ano?: number | null
          ano_mat?: number | null
          anopestud?: number | null
          codcarpr: string
          codcli: string
          codpestud?: string | null
          codsede?: string | null
          estacad?: string | null
          jornada?: string | null
          periodo?: number | null
          periodo_mat?: number | null
          periodos?: number | null
          rut?: string | null
          sync_state?: string | null
          tipositu?: number | null
        }
        Update: {
          ano?: number | null
          ano_mat?: number | null
          anopestud?: number | null
          codcarpr?: string
          codcli?: string
          codpestud?: string | null
          codsede?: string | null
          estacad?: string | null
          jornada?: string | null
          periodo?: number | null
          periodo_mat?: number | null
          periodos?: number | null
          rut?: string | null
          sync_state?: string | null
          tipositu?: number | null
        }
        Relationships: []
      }
      mnp_mt_arancel: {
        Row: {
          ano: number | null
          anofin: number | null
          anoini: number | null
          catalumno: number | null
          codcarr: string | null
          fecinivig: string | null
          fectervig: string | null
          jornada: string | null
          matricula: number | null
          monto: number | null
          periodo: number | null
          sync_state: string | null
        }
        Insert: {
          ano?: number | null
          anofin?: number | null
          anoini?: number | null
          catalumno?: number | null
          codcarr?: string | null
          fecinivig?: string | null
          fectervig?: string | null
          jornada?: string | null
          matricula?: number | null
          monto?: number | null
          periodo?: number | null
          sync_state?: string | null
        }
        Update: {
          ano?: number | null
          anofin?: number | null
          anoini?: number | null
          catalumno?: number | null
          codcarr?: string | null
          fecinivig?: string | null
          fectervig?: string | null
          jornada?: string | null
          matricula?: number | null
          monto?: number | null
          periodo?: number | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_beneficio: {
        Row: {
          anos_duracion: number | null
          aplicable: number | null
          aplical: string | null
          codben: number
          descripcion: string | null
          montomax: number | null
          origen_beneficio: string | null
          porcmax: number | null
          prioridad: number | null
          sync_state: string | null
          tipo: string | null
        }
        Insert: {
          anos_duracion?: number | null
          aplicable?: number | null
          aplical?: string | null
          codben: number
          descripcion?: string | null
          montomax?: number | null
          origen_beneficio?: string | null
          porcmax?: number | null
          prioridad?: number | null
          sync_state?: string | null
          tipo?: string | null
        }
        Update: {
          anos_duracion?: number | null
          aplicable?: number | null
          aplical?: string | null
          codben?: number
          descripcion?: string | null
          montomax?: number | null
          origen_beneficio?: string | null
          porcmax?: number | null
          prioridad?: number | null
          sync_state?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      mnp_mt_carrer: {
        Row: {
          codcarr: string
          modalidad: number | null
          nombre_c: string | null
          nombre_l: string | null
          sync_state: string | null
          tipocarr: number | null
          tipomat: number | null
        }
        Insert: {
          codcarr: string
          modalidad?: number | null
          nombre_c?: string | null
          nombre_l?: string | null
          sync_state?: string | null
          tipocarr?: number | null
          tipomat?: number | null
        }
        Update: {
          codcarr?: string
          modalidad?: number | null
          nombre_c?: string | null
          nombre_l?: string | null
          sync_state?: string | null
          tipocarr?: number | null
          tipomat?: number | null
        }
        Relationships: []
      }
      mnp_mt_catalumno: {
        Row: {
          activo: string | null
          codcat: number
          descripcion: string | null
          periodos: number | null
          sync_state: string | null
        }
        Insert: {
          activo?: string | null
          codcat: number
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
        }
        Update: {
          activo?: string | null
          codcat?: number
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_client: {
        Row: {
          categoria: number | null
          celularact: string | null
          ciudadact: string | null
          codapod: string | null
          codaval: string | null
          codcli: string
          codestcivil: string | null
          comuna: string | null
          dig: string | null
          diractual: string | null
          fecnac: string | null
          fonoact: string | null
          mail: string | null
          mail_inst: string | null
          materno: string | null
          nacionalidad: string | null
          nombre: string | null
          paterno: string | null
          sexo: string | null
          sync_state: string | null
        }
        Insert: {
          categoria?: number | null
          celularact?: string | null
          ciudadact?: string | null
          codapod?: string | null
          codaval?: string | null
          codcli: string
          codestcivil?: string | null
          comuna?: string | null
          dig?: string | null
          diractual?: string | null
          fecnac?: string | null
          fonoact?: string | null
          mail?: string | null
          mail_inst?: string | null
          materno?: string | null
          nacionalidad?: string | null
          nombre?: string | null
          paterno?: string | null
          sexo?: string | null
          sync_state?: string | null
        }
        Update: {
          categoria?: number | null
          celularact?: string | null
          ciudadact?: string | null
          codapod?: string | null
          codaval?: string | null
          codcli?: string
          codestcivil?: string | null
          comuna?: string | null
          dig?: string | null
          diractual?: string | null
          fecnac?: string | null
          fonoact?: string | null
          mail?: string | null
          mail_inst?: string | null
          materno?: string | null
          nacionalidad?: string | null
          nombre?: string | null
          paterno?: string | null
          sexo?: string | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_posben: {
        Row: {
          ano: number
          aplicable: number | null
          aprobado: string | null
          codben: number
          codcarr: string | null
          codcli: string
          estado: number | null
          monto: number | null
          monto_apr: number | null
          orden: number | null
          periodo: number
          porc_apr: number | null
          sync_state: string | null
        }
        Insert: {
          ano: number
          aplicable?: number | null
          aprobado?: string | null
          codben: number
          codcarr?: string | null
          codcli: string
          estado?: number | null
          monto?: number | null
          monto_apr?: number | null
          orden?: number | null
          periodo: number
          porc_apr?: number | null
          sync_state?: string | null
        }
        Update: {
          ano?: number
          aplicable?: number | null
          aprobado?: string | null
          codben?: number
          codcarr?: string | null
          codcli?: string
          estado?: number | null
          monto?: number | null
          monto_apr?: number | null
          orden?: number | null
          periodo?: number
          porc_apr?: number | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_mt_tipocarr: {
        Row: {
          descripcion: string | null
          periodos: number | null
          sync_state: string | null
          tipocarr: number
        }
        Insert: {
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
          tipocarr: number
        }
        Update: {
          descripcion?: string | null
          periodos?: number | null
          sync_state?: string | null
          tipocarr?: number
        }
        Relationships: []
      }
      mnp_mt_tipomat: {
        Row: {
          ano_mat: number | null
          descripcion: string | null
          periodo_mat: number | null
          periodos: number | null
          periodosanuales: number | null
          sync_state: string | null
          tipomat: number
        }
        Insert: {
          ano_mat?: number | null
          descripcion?: string | null
          periodo_mat?: number | null
          periodos?: number | null
          periodosanuales?: number | null
          sync_state?: string | null
          tipomat: number
        }
        Update: {
          ano_mat?: number | null
          descripcion?: string | null
          periodo_mat?: number | null
          periodos?: number | null
          periodosanuales?: number | null
          sync_state?: string | null
          tipomat?: number
        }
        Relationships: []
      }
      mnp_ra_modalidad: {
        Row: {
          codigo: number
          descripcion: string | null
          sync_state: string | null
        }
        Insert: {
          codigo: number
          descripcion?: string | null
          sync_state?: string | null
        }
        Update: {
          codigo?: number
          descripcion?: string | null
          sync_state?: string | null
        }
        Relationships: []
      }
      mnp_ra_pestud: {
        Row: {
          codcarr: string | null
          codpestud: string
          duracion: number | null
          nompestud: string | null
        }
        Insert: {
          codcarr?: string | null
          codpestud: string
          duracion?: number | null
          nompestud?: string | null
        }
        Update: {
          codcarr?: string | null
          codpestud?: string
          duracion?: number | null
          nompestud?: string | null
        }
        Relationships: []
      }
      nacionalidades: {
        Row: {
          activa: boolean | null
          codigo_iso: string
          continente: string
          created_at: string | null
          id: string
          nombre_espanol: string
          nombre_ingles: string
          orden_visual: number | null
          region: string | null
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          codigo_iso: string
          continente: string
          created_at?: string | null
          id?: string
          nombre_espanol: string
          nombre_ingles: string
          orden_visual?: number | null
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          codigo_iso?: string
          continente?: string
          created_at?: string | null
          id?: string
          nombre_espanol?: string
          nombre_ingles?: string
          orden_visual?: number | null
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planmejora_mv_acciones: {
        Row: {
          acc_creacion: string | null
          acc_detalle: string | null
          acc_id: number
          acc_presupuesto: number | null
          acc_titulo: string
          borrado: number | null
          created_at: string | null
          deb_id: number
          updated_at: string | null
        }
        Insert: {
          acc_creacion?: string | null
          acc_detalle?: string | null
          acc_id?: number
          acc_presupuesto?: number | null
          acc_titulo: string
          borrado?: number | null
          created_at?: string | null
          deb_id: number
          updated_at?: string | null
        }
        Update: {
          acc_creacion?: string | null
          acc_detalle?: string | null
          acc_id?: number
          acc_presupuesto?: number | null
          acc_titulo?: string
          borrado?: number | null
          created_at?: string | null
          deb_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_acciones_deb_id_fkey"
            columns: ["deb_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_debilidades"
            referencedColumns: ["deb_id"]
          },
        ]
      }
      planmejora_mv_actividades: {
        Row: {
          acc_id: number | null
          act_costo: number | null
          act_creacion: string | null
          act_detalle: string | null
          act_fechatermino: string | null
          act_id: number
          act_titulo: string
          borrado: number | null
          created_at: string | null
          est_id: number | null
          updated_at: string | null
        }
        Insert: {
          acc_id?: number | null
          act_costo?: number | null
          act_creacion?: string | null
          act_detalle?: string | null
          act_fechatermino?: string | null
          act_id?: number
          act_titulo: string
          borrado?: number | null
          created_at?: string | null
          est_id?: number | null
          updated_at?: string | null
        }
        Update: {
          acc_id?: number | null
          act_costo?: number | null
          act_creacion?: string | null
          act_detalle?: string | null
          act_fechatermino?: string | null
          act_id?: number
          act_titulo?: string
          borrado?: number | null
          created_at?: string | null
          est_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_actividades_acc_id_fkey"
            columns: ["acc_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_acciones"
            referencedColumns: ["acc_id"]
          },
          {
            foreignKeyName: "planmejora_mv_actividades_est_id_fkey"
            columns: ["est_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_estados"
            referencedColumns: ["est_id"]
          },
        ]
      }
      planmejora_mv_debilidades: {
        Row: {
          borrado: number | null
          created_at: string | null
          deb_creacion: string | null
          deb_detalle: string | null
          deb_id: number
          deb_titulo: string
          dim_id: number | null
          updated_at: string | null
        }
        Insert: {
          borrado?: number | null
          created_at?: string | null
          deb_creacion?: string | null
          deb_detalle?: string | null
          deb_id?: number
          deb_titulo: string
          dim_id?: number | null
          updated_at?: string | null
        }
        Update: {
          borrado?: number | null
          created_at?: string | null
          deb_creacion?: string | null
          deb_detalle?: string | null
          deb_id?: number
          deb_titulo?: string
          dim_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_debilidades_dim_id_fkey"
            columns: ["dim_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_dimensiones"
            referencedColumns: ["dim_id"]
          },
        ]
      }
      planmejora_mv_dimensiones: {
        Row: {
          borrado: number | null
          created_at: string | null
          dim_creacion: string | null
          dim_detalle: string | null
          dim_id: number
          dim_titulo: string
          pla_id: number | null
          updated_at: string | null
        }
        Insert: {
          borrado?: number | null
          created_at?: string | null
          dim_creacion?: string | null
          dim_detalle?: string | null
          dim_id?: number
          dim_titulo: string
          pla_id?: number | null
          updated_at?: string | null
        }
        Update: {
          borrado?: number | null
          created_at?: string | null
          dim_creacion?: string | null
          dim_detalle?: string | null
          dim_id?: number
          dim_titulo?: string
          pla_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_dimensiones_pla_id_fkey"
            columns: ["pla_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_planes"
            referencedColumns: ["pla_id"]
          },
        ]
      }
      planmejora_mv_evidencias: {
        Row: {
          act_id: number
          borrado: number | null
          created_at: string | null
          evi_detalle: string | null
          evi_id: number
          evi_titulo: string
          evi_urlarchivo: string | null
          updated_at: string | null
        }
        Insert: {
          act_id: number
          borrado?: number | null
          created_at?: string | null
          evi_detalle?: string | null
          evi_id?: number
          evi_titulo: string
          evi_urlarchivo?: string | null
          updated_at?: string | null
        }
        Update: {
          act_id?: number
          borrado?: number | null
          created_at?: string | null
          evi_detalle?: string | null
          evi_id?: number
          evi_titulo?: string
          evi_urlarchivo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_evidencias_act_id_fkey"
            columns: ["act_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_actividades"
            referencedColumns: ["act_id"]
          },
        ]
      }
      planmejora_mv_observaciones: {
        Row: {
          borrado: number | null
          created_at: string | null
          obs_id: number
          obs_observacion: string | null
          obs_observacionfecha: string | null
          obs_replica: string | null
          obs_replicafecha: string | null
          pla_id: number
          updated_at: string | null
        }
        Insert: {
          borrado?: number | null
          created_at?: string | null
          obs_id?: number
          obs_observacion?: string | null
          obs_observacionfecha?: string | null
          obs_replica?: string | null
          obs_replicafecha?: string | null
          pla_id: number
          updated_at?: string | null
        }
        Update: {
          borrado?: number | null
          created_at?: string | null
          obs_id?: number
          obs_observacion?: string | null
          obs_observacionfecha?: string | null
          obs_replica?: string | null
          obs_replicafecha?: string | null
          pla_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_observaciones_pla_id_fkey"
            columns: ["pla_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_planes"
            referencedColumns: ["pla_id"]
          },
        ]
      }
      planmejora_mv_observaciones_actividades: {
        Row: {
          act_id: number
          borrado: number | null
          created_at: string | null
          oba_id: number
          obs_observacion: string | null
          obs_observacionfecha: string | null
          obs_replica: string | null
          obs_replicafecha: string | null
          updated_at: string | null
        }
        Insert: {
          act_id: number
          borrado?: number | null
          created_at?: string | null
          oba_id?: number
          obs_observacion?: string | null
          obs_observacionfecha?: string | null
          obs_replica?: string | null
          obs_replicafecha?: string | null
          updated_at?: string | null
        }
        Update: {
          act_id?: number
          borrado?: number | null
          created_at?: string | null
          oba_id?: number
          obs_observacion?: string | null
          obs_observacionfecha?: string | null
          obs_replica?: string | null
          obs_replicafecha?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_observaciones_actividades_act_id_fkey"
            columns: ["act_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_actividades"
            referencedColumns: ["act_id"]
          },
        ]
      }
      planmejora_mv_planes: {
        Row: {
          are_id: number | null
          borrado: number | null
          car_id: number | null
          created_at: string | null
          est_id: number | null
          ped_id: number | null
          pla_acciones: number | null
          pla_avancetotal: number | null
          pla_contexto: string | null
          pla_costo_estimado: number | null
          pla_costos: number | null
          pla_fecha_fin: string | null
          pla_fecha_inicio: string | null
          pla_id: number
          pla_nombre: string
          updated_at: string | null
          usu_ejecutor: number | null
          usu_supervisor: number | null
        }
        Insert: {
          are_id?: number | null
          borrado?: number | null
          car_id?: number | null
          created_at?: string | null
          est_id?: number | null
          ped_id?: number | null
          pla_acciones?: number | null
          pla_avancetotal?: number | null
          pla_contexto?: string | null
          pla_costo_estimado?: number | null
          pla_costos?: number | null
          pla_fecha_fin?: string | null
          pla_fecha_inicio?: string | null
          pla_id?: number
          pla_nombre: string
          updated_at?: string | null
          usu_ejecutor?: number | null
          usu_supervisor?: number | null
        }
        Update: {
          are_id?: number | null
          borrado?: number | null
          car_id?: number | null
          created_at?: string | null
          est_id?: number | null
          ped_id?: number | null
          pla_acciones?: number | null
          pla_avancetotal?: number | null
          pla_contexto?: string | null
          pla_costo_estimado?: number | null
          pla_costos?: number | null
          pla_fecha_fin?: string | null
          pla_fecha_inicio?: string | null
          pla_id?: number
          pla_nombre?: string
          updated_at?: string | null
          usu_ejecutor?: number | null
          usu_supervisor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_mv_planes_are_id_fkey"
            columns: ["are_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_areas"
            referencedColumns: ["are_id"]
          },
          {
            foreignKeyName: "planmejora_mv_planes_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_cargos"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "planmejora_mv_planes_est_id_fkey"
            columns: ["est_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_estados"
            referencedColumns: ["est_id"]
          },
          {
            foreignKeyName: "planmejora_mv_planes_ped_id_fkey"
            columns: ["ped_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_periodos"
            referencedColumns: ["ped_id"]
          },
          {
            foreignKeyName: "planmejora_mv_planes_usu_ejecutor_fkey"
            columns: ["usu_ejecutor"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_usuarios"
            referencedColumns: ["usu_id"]
          },
          {
            foreignKeyName: "planmejora_mv_planes_usu_supervisor_fkey"
            columns: ["usu_supervisor"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_usuarios"
            referencedColumns: ["usu_id"]
          },
        ]
      }
      planmejora_tp_areas: {
        Row: {
          are_descripcion: string | null
          are_id: number
          are_nombre: string
          borrado: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          are_descripcion?: string | null
          are_id?: number
          are_nombre: string
          borrado?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          are_descripcion?: string | null
          are_id?: number
          are_nombre?: string
          borrado?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planmejora_tp_cargos: {
        Row: {
          borrado: number | null
          car_id: number
          car_nombre: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          borrado?: number | null
          car_id?: number
          car_nombre: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          borrado?: number | null
          car_id?: number
          car_nombre?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planmejora_tp_estados: {
        Row: {
          borrado: number | null
          created_at: string | null
          est_detalle: string | null
          est_id: number
          est_nombre: string
          est_tipo: string | null
          updated_at: string | null
        }
        Insert: {
          borrado?: number | null
          created_at?: string | null
          est_detalle?: string | null
          est_id?: number
          est_nombre: string
          est_tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          borrado?: number | null
          created_at?: string | null
          est_detalle?: string | null
          est_id?: number
          est_nombre?: string
          est_tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planmejora_tp_perfiles: {
        Row: {
          borrado: number | null
          created_at: string | null
          per_detalles: string | null
          per_id: number
          per_nombre: string
          updated_at: string | null
        }
        Insert: {
          borrado?: number | null
          created_at?: string | null
          per_detalles?: string | null
          per_id?: number
          per_nombre: string
          updated_at?: string | null
        }
        Update: {
          borrado?: number | null
          created_at?: string | null
          per_detalles?: string | null
          per_id?: number
          per_nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      planmejora_tp_perfiles_usuarios: {
        Row: {
          created_at: string | null
          pdu_id: number
          per_id: number
          updated_at: string | null
          usu_id: number
        }
        Insert: {
          created_at?: string | null
          pdu_id?: number
          per_id: number
          updated_at?: string | null
          usu_id: number
        }
        Update: {
          created_at?: string | null
          pdu_id?: number
          per_id?: number
          updated_at?: string | null
          usu_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_tp_perfiles_usuarios_per_id_fkey"
            columns: ["per_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_perfiles"
            referencedColumns: ["per_id"]
          },
          {
            foreignKeyName: "planmejora_tp_perfiles_usuarios_usu_id_fkey"
            columns: ["usu_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_usuarios"
            referencedColumns: ["usu_id"]
          },
        ]
      }
      planmejora_tp_periodos: {
        Row: {
          borrado: number | null
          created_at: string | null
          ped_detalle: string | null
          ped_fecha_fin: string | null
          ped_fecha_inicio: string | null
          ped_id: number
          ped_nombre: string | null
          updated_at: string | null
        }
        Insert: {
          borrado?: number | null
          created_at?: string | null
          ped_detalle?: string | null
          ped_fecha_fin?: string | null
          ped_fecha_inicio?: string | null
          ped_id?: number
          ped_nombre?: string | null
          updated_at?: string | null
        }
        Update: {
          borrado?: number | null
          created_at?: string | null
          ped_detalle?: string | null
          ped_fecha_fin?: string | null
          ped_fecha_inicio?: string | null
          ped_id?: number
          ped_nombre?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planmejora_tp_responsables_iniciativas: {
        Row: {
          created_at: string | null
          pla_id: number
          rsp_id: number
          rsp_tipo: string
          updated_at: string | null
          usu_id: number
        }
        Insert: {
          created_at?: string | null
          pla_id: number
          rsp_id?: number
          rsp_tipo: string
          updated_at?: string | null
          usu_id: number
        }
        Update: {
          created_at?: string | null
          pla_id?: number
          rsp_id?: number
          rsp_tipo?: string
          updated_at?: string | null
          usu_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_responsables_planes"
            columns: ["pla_id"]
            isOneToOne: false
            referencedRelation: "planmejora_mv_planes"
            referencedColumns: ["pla_id"]
          },
          {
            foreignKeyName: "planmejora_tp_responsables_iniciativas_usu_id_fkey"
            columns: ["usu_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_usuarios"
            referencedColumns: ["usu_id"]
          },
        ]
      }
      planmejora_tp_usuarios: {
        Row: {
          are_id: number | null
          borrado: number | null
          created_at: string | null
          habilitado: number | null
          password: string
          updated_at: string | null
          usu_email: string | null
          usu_id: number
          usu_materno: string | null
          usu_nombre: string
          usu_paterno: string
          usu_usuario: string
        }
        Insert: {
          are_id?: number | null
          borrado?: number | null
          created_at?: string | null
          habilitado?: number | null
          password: string
          updated_at?: string | null
          usu_email?: string | null
          usu_id?: number
          usu_materno?: string | null
          usu_nombre: string
          usu_paterno: string
          usu_usuario: string
        }
        Update: {
          are_id?: number | null
          borrado?: number | null
          created_at?: string | null
          habilitado?: number | null
          password?: string
          updated_at?: string | null
          usu_email?: string | null
          usu_id?: number
          usu_materno?: string | null
          usu_nombre?: string
          usu_paterno?: string
          usu_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "planmejora_tp_usuarios_are_id_fkey"
            columns: ["are_id"]
            isOneToOne: false
            referencedRelation: "planmejora_tp_areas"
            referencedColumns: ["are_id"]
          },
        ]
      }
      prospectos: {
        Row: {
          ad_id: string | null
          anio_nacimiento: number | null
          año_egreso: number | null
          apellido: string
          area_interes: string | null
          beca: string | null
          becas_estado: boolean | null
          cae: boolean | null
          campaign_id: string | null
          carrera: number | null
          carreratitulo: string | null
          colegio: string | null
          comprension_lectora: number | null
          comuna: string | null
          consentimiento_contacto: boolean | null
          created_at: string | null
          curso: string
          decil: string | null
          email: string
          fbclid: string | null
          first_touch_timestamp: string | null
          first_touch_url: string | null
          gclid: string | null
          genero: string | null
          id: string
          last_touch_timestamp: string | null
          last_touch_url: string | null
          li_fat_id: string | null
          matematica1: number | null
          modalidadpreferencia: Json | null
          msclkid: string | null
          nem: number | null
          nombre: string
          objetivo: Json | null
          paes: boolean | null
          pasaporte: string | null
          prospecto_crm: Json | null
          rango_ingreso: string | null
          ranking: number | null
          region: string | null
          respuesta_crm: Json | null
          rut: string | null
          segmentacion: string | null
          telefono: string | null
          ttclid: string | null
          updated_at: string | null
          url_origen: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          ad_id?: string | null
          anio_nacimiento?: number | null
          año_egreso?: number | null
          apellido: string
          area_interes?: string | null
          beca?: string | null
          becas_estado?: boolean | null
          cae?: boolean | null
          campaign_id?: string | null
          carrera?: number | null
          carreratitulo?: string | null
          colegio?: string | null
          comprension_lectora?: number | null
          comuna?: string | null
          consentimiento_contacto?: boolean | null
          created_at?: string | null
          curso: string
          decil?: string | null
          email: string
          fbclid?: string | null
          first_touch_timestamp?: string | null
          first_touch_url?: string | null
          gclid?: string | null
          genero?: string | null
          id?: string
          last_touch_timestamp?: string | null
          last_touch_url?: string | null
          li_fat_id?: string | null
          matematica1?: number | null
          modalidadpreferencia?: Json | null
          msclkid?: string | null
          nem?: number | null
          nombre: string
          objetivo?: Json | null
          paes?: boolean | null
          pasaporte?: string | null
          prospecto_crm?: Json | null
          rango_ingreso?: string | null
          ranking?: number | null
          region?: string | null
          respuesta_crm?: Json | null
          rut?: string | null
          segmentacion?: string | null
          telefono?: string | null
          ttclid?: string | null
          updated_at?: string | null
          url_origen?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          ad_id?: string | null
          anio_nacimiento?: number | null
          año_egreso?: number | null
          apellido?: string
          area_interes?: string | null
          beca?: string | null
          becas_estado?: boolean | null
          cae?: boolean | null
          campaign_id?: string | null
          carrera?: number | null
          carreratitulo?: string | null
          colegio?: string | null
          comprension_lectora?: number | null
          comuna?: string | null
          consentimiento_contacto?: boolean | null
          created_at?: string | null
          curso?: string
          decil?: string | null
          email?: string
          fbclid?: string | null
          first_touch_timestamp?: string | null
          first_touch_url?: string | null
          gclid?: string | null
          genero?: string | null
          id?: string
          last_touch_timestamp?: string | null
          last_touch_url?: string | null
          li_fat_id?: string | null
          matematica1?: number | null
          modalidadpreferencia?: Json | null
          msclkid?: string | null
          nem?: number | null
          nombre?: string
          objetivo?: Json | null
          paes?: boolean | null
          pasaporte?: string | null
          prospecto_crm?: Json | null
          rango_ingreso?: string | null
          ranking?: number | null
          region?: string | null
          respuesta_crm?: Json | null
          rut?: string | null
          segmentacion?: string | null
          telefono?: string | null
          ttclid?: string | null
          updated_at?: string | null
          url_origen?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospectos_carrera_fkey"
            columns: ["carrera"]
            isOneToOne: false
            referencedRelation: "carreras_uniacc"
            referencedColumns: ["id"]
          },
        ]
      }
      puntajes_paes: {
        Row: {
          año_rendicion: number | null
          created_at: string | null
          estado_estudiante: string | null
          fecha_rendicion: string | null
          id: string
          prospecto_id: string
          puntaje_biologia: number | null
          puntaje_ciencias: number | null
          puntaje_comprension_lectora: number | null
          puntaje_fisica: number | null
          puntaje_historia_geografia: number | null
          puntaje_matematica_1: number | null
          puntaje_matematica_2: number | null
          puntaje_quimica: number | null
          puntaje_total: number | null
          rendio_paes: boolean | null
          tipo_rendicion: string | null
          updated_at: string | null
        }
        Insert: {
          año_rendicion?: number | null
          created_at?: string | null
          estado_estudiante?: string | null
          fecha_rendicion?: string | null
          id?: string
          prospecto_id: string
          puntaje_biologia?: number | null
          puntaje_ciencias?: number | null
          puntaje_comprension_lectora?: number | null
          puntaje_fisica?: number | null
          puntaje_historia_geografia?: number | null
          puntaje_matematica_1?: number | null
          puntaje_matematica_2?: number | null
          puntaje_quimica?: number | null
          puntaje_total?: number | null
          rendio_paes?: boolean | null
          tipo_rendicion?: string | null
          updated_at?: string | null
        }
        Update: {
          año_rendicion?: number | null
          created_at?: string | null
          estado_estudiante?: string | null
          fecha_rendicion?: string | null
          id?: string
          prospecto_id?: string
          puntaje_biologia?: number | null
          puntaje_ciencias?: number | null
          puntaje_comprension_lectora?: number | null
          puntaje_fisica?: number | null
          puntaje_historia_geografia?: number | null
          puntaje_matematica_1?: number | null
          puntaje_matematica_2?: number | null
          puntaje_quimica?: number | null
          puntaje_total?: number | null
          rendio_paes?: boolean | null
          tipo_rendicion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "puntajes_paes_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      simulaciones: {
        Row: {
          beneficios_aplicables: Json | null
          created_at: string | null
          datos_entrada: Json
          fecha_simulacion: string | null
          id: string
          prospecto_id: string
          resultados: Json | null
          updated_at: string | null
        }
        Insert: {
          beneficios_aplicables?: Json | null
          created_at?: string | null
          datos_entrada: Json
          fecha_simulacion?: string | null
          id?: string
          prospecto_id: string
          resultados?: Json | null
          updated_at?: string | null
        }
        Update: {
          beneficios_aplicables?: Json | null
          created_at?: string | null
          datos_entrada?: Json
          fecha_simulacion?: string | null
          id?: string
          prospecto_id?: string
          resultados?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulaciones_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
      validacion_alumno_nuevo: {
        Row: {
          es_alumno_nuevo: boolean
          fecha_validacion: string | null
          id: string
          observaciones: string | null
          prospecto_id: string | null
        }
        Insert: {
          es_alumno_nuevo?: boolean
          fecha_validacion?: string | null
          id?: string
          observaciones?: string | null
          prospecto_id?: string | null
        }
        Update: {
          es_alumno_nuevo?: boolean
          fecha_validacion?: string | null
          id?: string
          observaciones?: string | null
          prospecto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validacion_alumno_nuevo_prospecto_id_fkey"
            columns: ["prospecto_id"]
            isOneToOne: false
            referencedRelation: "prospectos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_login:
        | { Args: { p_password: string; p_usu_usuario: string }; Returns: Json }
        | { Args: { p_password: string; p_usu_usuario: string }; Returns: Json }
      generate_jwt_token:
        | { Args: { p_usu_id: number; p_usu_usuario: string }; Returns: string }
        | { Args: { p_usu_id: number; p_usu_usuario: string }; Returns: string }
      get_comunas_por_region: {
        Args: { region: number }
        Returns: {
          comuna_nombre: string
        }[]
      }
      get_regiones_unicas: {
        Args: never
        Returns: {
          region_id: string
          region_nombre: string
        }[]
      }
      obtener_beneficios_por_nivel: {
        Args: { prospecto_uuid: string }
        Returns: {
          codigo_beneficio: number
          descripcion: string
          elegible: boolean
          monto_maximo: number
          porcentaje_maximo: number
          razon_elegibilidad: string
          tipo_beneficio: string
        }[]
      }
      obtiene_apertura_periodo: {
        Args: { p_tipomat: number }
        Returns: {
          ano_apertura: number
          periodo_apertura: number
          periodos_apertura: number
        }[]
      }
      obtiene_arancel_carrera: {
        Args: { p_codcarr: string; p_rut: string }
        Returns: {
          arancel_base: number
          matricula_base: number
          message: string
          status: number
        }[]
      }
      obtiene_carreras: {
        Args: { p_rut: string }
        Returns: {
          codcarr: string
          nombre: string
        }[]
      }
      obtiene_datos_matricula: {
        Args: { p_codcarr: string; p_rut: string }
        Returns: {
          ano_actual: number
          ano_ingreso: number
          periodo_actual: number
          periodo_ingreso: number
          periodos_actual: number
          tipomat: number
        }[]
      }
      puede_simular: { Args: { prospecto_uuid: string }; Returns: boolean }
      verify_jwt_token: { Args: { p_token: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
