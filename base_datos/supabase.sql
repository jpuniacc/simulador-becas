create table nacionalidades
(
    id             uuid                     default gen_random_uuid() not null
        primary key,
    codigo_iso     text                                               not null
        unique,
    nombre_espanol text                                               not null,
    nombre_ingles  text                                               not null,
    continente     text                                               not null,
    region         text,
    activa         boolean                  default true,
    orden_visual   integer,
    created_at     timestamp with time zone default now(),
    updated_at     timestamp with time zone default now()
);

alter table nacionalidades
    owner to postgres;

create index idx_nacionalidades_codigo
    on nacionalidades (codigo_iso);

create index idx_nacionalidades_continente
    on nacionalidades (continente);

create index idx_nacionalidades_activa
    on nacionalidades (activa);

create index idx_nacionalidades_orden
    on nacionalidades (orden_visual);

grant delete, insert, references, select, trigger, truncate, update on nacionalidades to anon;

grant delete, insert, references, select, trigger, truncate, update on nacionalidades to authenticated;

grant delete, insert, references, select, trigger, truncate, update on nacionalidades to service_role;

create table prospectos
(
    id               uuid                     default gen_random_uuid() not null
        primary key,
    nombre           text                                               not null,
    apellido         text                                               not null,
    email            text                                               not null
        unique,
    telefono         text,
    rut              text
        unique,
    pasaporte        text
        unique,
    fecha_nacimiento date,
    nacionalidad_id  uuid
        references nacionalidades,
    created_at       timestamp with time zone default now(),
    updated_at       timestamp with time zone default now(),
    constraint check_identificacion
        check (((rut IS NOT NULL) AND (pasaporte IS NULL)) OR ((rut IS NULL) AND (pasaporte IS NOT NULL)))
);

comment on table prospectos is 'Datos personales de estudiantes/prospectos';

alter table prospectos
    owner to postgres;

create index idx_prospectos_email
    on prospectos (email);

create index idx_prospectos_rut
    on prospectos (rut);

create index idx_prospectos_pasaporte
    on prospectos (pasaporte);

create index idx_prospectos_nacionalidad
    on prospectos (nacionalidad_id);

create trigger update_prospectos_updated_at
    before update
    on prospectos
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on prospectos to anon;

grant delete, insert, references, select, trigger, truncate, update on prospectos to authenticated;

grant delete, insert, references, select, trigger, truncate, update on prospectos to service_role;

create table colegios
(
    id             uuid                     default gen_random_uuid() not null
        primary key,
    rbd            text                                               not null
        unique,
    nombre         text                                               not null,
    nombre_corto   text,
    dependencia    text                                               not null
        constraint colegios_dependencia_check
            check (dependencia = ANY
                   (ARRAY ['Municipal'::text, 'Particular Subvencionado'::text, 'Particular Pagado'::text, 'Corporación de Administración Delegada'::text, 'Servicio Local de Educación'::text])),
    tipo_educacion text                                               not null
        constraint colegios_tipo_educacion_check
            check (tipo_educacion = ANY
                   (ARRAY ['Básica'::text, 'Media'::text, 'Básica y Media'::text, 'Especial'::text])),
    modalidad      text,
    region_id      integer                                            not null,
    region_nombre  text                                               not null,
    comuna_id      integer                                            not null,
    comuna_nombre  text                                               not null,
    direccion      text,
    telefono       text,
    email          text,
    sitio_web      text,
    latitud        numeric(10, 8),
    longitud       numeric(11, 8),
    activo         boolean                  default true,
    fecha_creacion date,
    fecha_cierre   date,
    created_at     timestamp with time zone default now(),
    updated_at     timestamp with time zone default now()
);

alter table colegios
    owner to postgres;

create index idx_colegios_rbd
    on colegios (rbd);

create index idx_colegios_nombre
    on colegios (nombre);

create index idx_colegios_dependencia
    on colegios (dependencia);

create index idx_colegios_region
    on colegios (region_id, region_nombre);

create index idx_colegios_comuna
    on colegios (comuna_id, comuna_nombre);

create index idx_colegios_activo
    on colegios (activo);

create index idx_colegios_tipo_educacion
    on colegios (tipo_educacion);

grant delete, insert, references, select, trigger, truncate, update on colegios to anon;

grant delete, insert, references, select, trigger, truncate, update on colegios to authenticated;

grant delete, insert, references, select, trigger, truncate, update on colegios to service_role;

create table deciles
(
    id                   uuid                     default gen_random_uuid() not null
        primary key,
    decil                integer                                            not null
        unique
        constraint deciles_decil_check
            check ((decil >= 1) AND (decil <= 10)),
    rango_ingreso_min    numeric(12, 2)                                     not null,
    rango_ingreso_max    numeric(12, 2)                                     not null,
    descripcion          text                                               not null,
    descripcion_corta    text                                               not null,
    porcentaje_poblacion numeric(5, 2)                                      not null
        constraint deciles_porcentaje_poblacion_check
            check ((porcentaje_poblacion >= (0)::numeric) AND (porcentaje_poblacion <= (100)::numeric)),
    activo               boolean                  default true,
    orden_visual         integer                                            not null,
    created_at           timestamp with time zone default now(),
    updated_at           timestamp with time zone default now()
);

comment on table deciles is 'Deciles socioeconómicos oficiales de Chile';

alter table deciles
    owner to postgres;

create index idx_deciles_decil
    on deciles (decil);

create index idx_deciles_activo
    on deciles (activo);

create index idx_deciles_orden
    on deciles (orden_visual);

create trigger update_deciles_updated_at
    before update
    on deciles
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on deciles to anon;

grant delete, insert, references, select, trigger, truncate, update on deciles to authenticated;

grant delete, insert, references, select, trigger, truncate, update on deciles to service_role;

create table datos_socioeconomicos
(
    id                         uuid                     default gen_random_uuid() not null
        primary key,
    prospecto_id               uuid                                               not null
        references prospectos
            on delete cascade,
    usa_cae                    boolean                  default false,
    decil_ingreso              integer
        constraint datos_socioeconomicos_decil_ingreso_check
            check ((decil_ingreso >= 1) AND (decil_ingreso <= 10)),
    ingreso_mensual            numeric(12, 2)
        constraint datos_socioeconomicos_ingreso_mensual_check
            check (ingreso_mensual >= (0)::numeric),
    numero_integrantes_familia integer
        constraint datos_socioeconomicos_numero_integrantes_familia_check
            check (numero_integrantes_familia >= 1),
    created_at                 timestamp with time zone default now(),
    updated_at                 timestamp with time zone default now()
);

comment on table datos_socioeconomicos is 'Información socioeconómica para cálculo de becas';

alter table datos_socioeconomicos
    owner to postgres;

create index idx_datos_socioeconomicos_prospecto
    on datos_socioeconomicos (prospecto_id);

create index idx_datos_socioeconomicos_decil
    on datos_socioeconomicos (decil_ingreso);

create index idx_datos_socioeconomicos_cae
    on datos_socioeconomicos (usa_cae);

create trigger update_datos_socioeconomicos_updated_at
    before update
    on datos_socioeconomicos
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on datos_socioeconomicos to anon;

grant delete, insert, references, select, trigger, truncate, update on datos_socioeconomicos to authenticated;

grant delete, insert, references, select, trigger, truncate, update on datos_socioeconomicos to service_role;

create table puntajes_paes
(
    id                          uuid                     default gen_random_uuid() not null
        primary key,
    prospecto_id                uuid                                               not null
        references prospectos
            on delete cascade,
    estado_estudiante           text                     default 'no_aplica'::text
        constraint puntajes_paes_estado_estudiante_check
            check (estado_estudiante = ANY
                   (ARRAY ['sin_rendir'::text, 'en_proceso'::text, 'rendido'::text, 'no_aplica'::text])),
    fecha_rendicion             date,
    año_rendicion               integer
        constraint puntajes_paes_año_rendicion_check
            check ("año_rendicion" >= 2020),
    tipo_rendicion              text                     default 'Regular'::text
        constraint puntajes_paes_tipo_rendicion_check
            check (tipo_rendicion = ANY (ARRAY ['Regular'::text, 'Especial'::text, 'PAA'::text])),
    rendio_paes                 boolean                  default false,
    puntaje_comprension_lectora integer
        constraint puntajes_paes_puntaje_comprension_lectora_check
            check ((puntaje_comprension_lectora >= 100) AND (puntaje_comprension_lectora <= 1000)),
    puntaje_matematica_1        integer
        constraint puntajes_paes_puntaje_matematica_1_check
            check ((puntaje_matematica_1 >= 100) AND (puntaje_matematica_1 <= 1000)),
    puntaje_matematica_2        integer
        constraint puntajes_paes_puntaje_matematica_2_check
            check ((puntaje_matematica_2 >= 100) AND (puntaje_matematica_2 <= 1000)),
    puntaje_historia_geografia  integer
        constraint puntajes_paes_puntaje_historia_geografia_check
            check ((puntaje_historia_geografia >= 100) AND (puntaje_historia_geografia <= 1000)),
    puntaje_ciencias            integer
        constraint puntajes_paes_puntaje_ciencias_check
            check ((puntaje_ciencias >= 100) AND (puntaje_ciencias <= 1000)),
    puntaje_fisica              integer
        constraint puntajes_paes_puntaje_fisica_check
            check ((puntaje_fisica >= 100) AND (puntaje_fisica <= 1000)),
    puntaje_quimica             integer
        constraint puntajes_paes_puntaje_quimica_check
            check ((puntaje_quimica >= 100) AND (puntaje_quimica <= 1000)),
    puntaje_biologia            integer
        constraint puntajes_paes_puntaje_biologia_check
            check ((puntaje_biologia >= 100) AND (puntaje_biologia <= 1000)),
    puntaje_total               integer generated always as (
        CASE
            WHEN (rendio_paes = true) THEN (
                ((((((COALESCE(puntaje_comprension_lectora, 0) + COALESCE(puntaje_matematica_1, 0)) +
                     COALESCE(puntaje_matematica_2, 0)) + COALESCE(puntaje_historia_geografia, 0)) +
                   COALESCE(puntaje_ciencias, 0)) + COALESCE(puntaje_fisica, 0)) + COALESCE(puntaje_quimica, 0)) +
                COALESCE(puntaje_biologia, 0))
            ELSE 0
            END) stored,
    created_at                  timestamp with time zone default now(),
    updated_at                  timestamp with time zone default now()
);

comment on table puntajes_paes is 'Resultados de pruebas PAES y estado del estudiante';

alter table puntajes_paes
    owner to postgres;

create index idx_puntajes_paes_prospecto
    on puntajes_paes (prospecto_id);

create index idx_puntajes_paes_estado
    on puntajes_paes (estado_estudiante);

create index idx_puntajes_paes_total
    on puntajes_paes (puntaje_total);

create trigger update_puntajes_paes_updated_at
    before update
    on puntajes_paes
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on puntajes_paes to anon;

grant delete, insert, references, select, trigger, truncate, update on puntajes_paes to authenticated;

grant delete, insert, references, select, trigger, truncate, update on puntajes_paes to service_role;

create table datos_academicos
(
    id                     uuid                     default gen_random_uuid() not null
        primary key,
    prospecto_id           uuid                                               not null
        references prospectos
            on delete cascade,
    colegio_id             uuid
        references colegios,
    nombre_colegio         text,
    region_colegio         text,
    comuna_colegio         text,
    tipo_colegio           text,
    carrera_deseada        text                                               not null,
    nivel_educativo_actual text                     default 'Egresado'::text
        constraint datos_academicos_nivel_educativo_actual_check
            check (nivel_educativo_actual = ANY
                   (ARRAY ['1ro Medio'::text, '2do Medio'::text, '3ro Medio'::text, '4to Medio'::text, 'Egresado'::text])),
    promedio               numeric(3, 2)
        constraint datos_academicos_promedio_check
            check ((promedio IS NULL) OR ((promedio >= 1.0) AND (promedio <= 7.0))),
    nem                    numeric(3, 2)
        constraint datos_academicos_nem_check
            check ((nem IS NULL) OR ((nem >= 1.0) AND (nem <= 7.0))),
    ranking                numeric(6, 2)
        constraint datos_academicos_ranking_check
            check ((ranking IS NULL) OR ((ranking >= (0)::numeric) AND (ranking <= (1000)::numeric))),
    año_egreso             integer
        constraint datos_academicos_año_egreso_check
            check (("año_egreso" IS NULL) OR
                   (("año_egreso" >= 2000) AND (("año_egreso")::numeric <= EXTRACT(year FROM now())))),
    created_at             timestamp with time zone default now(),
    updated_at             timestamp with time zone default now(),
    constraint check_nem_egresado
        check (((nivel_educativo_actual = 'Egresado'::text) AND (nem IS NOT NULL)) OR
               ((nivel_educativo_actual <> 'Egresado'::text) AND (nem IS NULL))),
    constraint check_ranking_egresado
        check (((nivel_educativo_actual = 'Egresado'::text) AND (ranking IS NOT NULL)) OR
               ((nivel_educativo_actual <> 'Egresado'::text) AND (ranking IS NULL))),
    constraint check_promedio_egresado
        check (((nivel_educativo_actual = 'Egresado'::text) AND (promedio IS NOT NULL)) OR
               ((nivel_educativo_actual <> 'Egresado'::text) AND (promedio IS NULL))),
    constraint check_año_egreso_egresado
        check (((nivel_educativo_actual = 'Egresado'::text) AND ("año_egreso" IS NOT NULL)) OR
               ((nivel_educativo_actual <> 'Egresado'::text) AND ("año_egreso" IS NULL)))
);

comment on table datos_academicos is 'Información educacional de los estudiantes';

alter table datos_academicos
    owner to postgres;

create index idx_datos_academicos_prospecto
    on datos_academicos (prospecto_id);

create index idx_datos_academicos_colegio
    on datos_academicos (colegio_id);

create index idx_datos_academicos_carrera
    on datos_academicos (carrera_deseada);

create index idx_datos_academicos_promedio
    on datos_academicos (promedio);

create trigger update_datos_academicos_updated_at
    before update
    on datos_academicos
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on datos_academicos to anon;

grant delete, insert, references, select, trigger, truncate, update on datos_academicos to authenticated;

grant delete, insert, references, select, trigger, truncate, update on datos_academicos to service_role;

create table becas
(
    id                   uuid                     default gen_random_uuid() not null
        primary key,
    nombre               text                                               not null,
    descripcion          text,
    porcentaje_descuento numeric(5, 2)
        constraint becas_porcentaje_descuento_check
            check ((porcentaje_descuento >= (0)::numeric) AND (porcentaje_descuento <= (100)::numeric)),
    monto_fijo           numeric(12, 2)
        constraint becas_monto_fijo_check
            check (monto_fijo >= (0)::numeric),
    requisitos           text[],
    activa               boolean                  default true,
    created_at           timestamp with time zone default now(),
    updated_at           timestamp with time zone default now()
);

comment on table becas is 'Catálogo de becas disponibles';

alter table becas
    owner to postgres;

create index idx_becas_nombre
    on becas (nombre);

create index idx_becas_activa
    on becas (activa);

create trigger update_becas_updated_at
    before update
    on becas
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on becas to anon;

grant delete, insert, references, select, trigger, truncate, update on becas to authenticated;

grant delete, insert, references, select, trigger, truncate, update on becas to service_role;

create table beneficios
(
    id          uuid                     default gen_random_uuid() not null
        primary key,
    nombre      text                                               not null,
    descripcion text,
    tipo        text
        constraint beneficios_tipo_check
            check (tipo = ANY (ARRAY ['Descuento'::text, 'Financiamiento'::text, 'Beca'::text, 'Convenio'::text])),
    valor       numeric(12, 2),
    activo      boolean                  default true,
    created_at  timestamp with time zone default now(),
    updated_at  timestamp with time zone default now()
);

comment on table beneficios is 'Catálogo de beneficios generales';

alter table beneficios
    owner to postgres;

create index idx_beneficios_nombre
    on beneficios (nombre);

create index idx_beneficios_tipo
    on beneficios (tipo);

create index idx_beneficios_activo
    on beneficios (activo);

create trigger update_beneficios_updated_at
    before update
    on beneficios
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on beneficios to anon;

grant delete, insert, references, select, trigger, truncate, update on beneficios to authenticated;

grant delete, insert, references, select, trigger, truncate, update on beneficios to service_role;

create table beneficios_uniacc
(
    id                  uuid                     default gen_random_uuid() not null
        primary key,
    codigo_beneficio    integer                                            not null
        unique,
    descripcion         text                                               not null,
    porcentaje_maximo   numeric(8, 5),
    monto_maximo        numeric(20, 6),
    tipo_beneficio      text
        constraint beneficios_uniacc_tipo_beneficio_check
            check (tipo_beneficio = ANY (ARRAY ['BECA'::text, 'FINANCIAMIENTO'::text, 'FINANCIERO'::text])),
    origen_beneficio    text
        constraint beneficios_uniacc_origen_beneficio_check
            check (origen_beneficio = ANY (ARRAY ['INTERNO'::text, 'EXTERNO'::text])),
    aplicacion_concepto text
        constraint beneficios_uniacc_aplicacion_concepto_check
            check (aplicacion_concepto = ANY (ARRAY ['A'::text, 'M'::text])),
    aplicacion          text
        constraint beneficios_uniacc_aplicacion_check
            check (aplicacion = ANY (ARRAY ['SALDO'::text, 'TOTAL'::text])),
    prioridad           integer
        constraint beneficios_uniacc_prioridad_check
            check ((prioridad >= 1) AND (prioridad <= 3)),
    vigente             boolean                  default true,
    usuario_creacion    integer,
    fecha_modificacion  timestamp,
    requisitos          jsonb,
    created_at          timestamp with time zone default now(),
    updated_at          timestamp with time zone default now()
);

comment on table beneficios_uniacc is 'Beneficios específicos de UNIACC (internos y externos)';

alter table beneficios_uniacc
    owner to postgres;

create index idx_beneficios_uniacc_codigo
    on beneficios_uniacc (codigo_beneficio);

create index idx_beneficios_uniacc_tipo
    on beneficios_uniacc (tipo_beneficio);

create index idx_beneficios_uniacc_origen
    on beneficios_uniacc (origen_beneficio);

create index idx_beneficios_uniacc_vigente
    on beneficios_uniacc (vigente);

create index idx_beneficios_uniacc_prioridad
    on beneficios_uniacc (prioridad);

create trigger update_beneficios_uniacc_updated_at
    before update
    on beneficios_uniacc
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on beneficios_uniacc to anon;

grant delete, insert, references, select, trigger, truncate, update on beneficios_uniacc to authenticated;

grant delete, insert, references, select, trigger, truncate, update on beneficios_uniacc to service_role;

create table simulaciones
(
    id                    uuid                     default gen_random_uuid() not null
        primary key,
    prospecto_id          uuid                                               not null
        references prospectos
            on delete cascade,
    datos_entrada         jsonb                                              not null,
    resultados            jsonb,
    beneficios_aplicables jsonb,
    fecha_simulacion      timestamp with time zone default now(),
    created_at            timestamp with time zone default now(),
    updated_at            timestamp with time zone default now()
);

comment on table simulaciones is 'Historial de simulaciones realizadas';

alter table simulaciones
    owner to postgres;

create index idx_simulaciones_prospecto
    on simulaciones (prospecto_id);

create index idx_simulaciones_fecha
    on simulaciones (fecha_simulacion);

create trigger update_simulaciones_updated_at
    before update
    on simulaciones
    for each row
execute procedure update_updated_at_column();

grant delete, insert, references, select, trigger, truncate, update on simulaciones to anon;

grant delete, insert, references, select, trigger, truncate, update on simulaciones to authenticated;

grant delete, insert, references, select, trigger, truncate, update on simulaciones to service_role;

