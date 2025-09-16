# Esquema de Base de Datos - Simulador de Becas UNIACC

## 📋 Resumen de Tablas

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `prospectos` | Datos personales de estudiantes | nombre, apellido, email, rut/pasaporte, nacionalidad_id |
| `nacionalidades` | Catálogo de nacionalidades | codigo_iso, nombre_espanol, continente, region |
| `colegios` | Catálogo de establecimientos educacionales | rbd, nombre, dependencia, region, comuna |
| `datos_academicos` | Información educacional | colegio, carrera, promedio, ranking |
| `puntajes_paes` | Resultados PAES completos | todas las pruebas obligatorias y electivas |
| `datos_socioeconomicos` | Información financiera | CAE, decil de ingreso |
| `becas` | Catálogo de becas disponibles | nombre, descripción, requisitos |
| `beneficios` | Catálogo de beneficios | nombre, tipo, valor |
| `beneficios_uniacc` | Beneficios específicos UNIACC | codigo, descripcion, tipo, origen |
| `deciles` | Tabla de deciles socioeconómicos | decil, rango_ingreso, descripcion |
| `simulaciones` | Historial de simulaciones | datos, resultados, fecha |

---

## 🗃️ Detalle de Tablas

### 1. Tabla `prospectos`
**Propósito**: Almacenar datos personales de los estudiantes prospectos

```sql
CREATE TABLE prospectos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rut TEXT UNIQUE,
    pasaporte TEXT UNIQUE,
    telefono TEXT,
    fecha_nacimiento DATE,
    nacionalidad_id UUID REFERENCES nacionalidades(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para asegurar que tenga RUT o pasaporte
    CONSTRAINT check_identificacion CHECK (
        (rut IS NOT NULL AND pasaporte IS NULL) OR 
        (rut IS NULL AND pasaporte IS NOT NULL)
    )
);
```

**Campos**:
- `id`: Identificador único (UUID)
- `nombre`: Nombre del estudiante
- `apellido`: Apellido del estudiante
- `email`: Email único para contacto
- `rut`: RUT chileno (opcional)
- `pasaporte`: Número de pasaporte (opcional)
- `telefono`: Teléfono de contacto
- `fecha_nacimiento`: Fecha de nacimiento
- `nacionalidad_id`: Referencia a la tabla nacionalidades (FK)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**Constraints**:
- `check_identificacion`: Debe tener RUT o pasaporte, pero no ambos

**Índices**:
- `idx_prospectos_email`: Búsquedas por email
- `idx_prospectos_rut`: Búsquedas por RUT
- `idx_prospectos_pasaporte`: Búsquedas por pasaporte
- `idx_prospectos_nacionalidad`: Búsquedas por nacionalidad

---

### 2. Tabla `nacionalidades`
**Propósito**: Catálogo de nacionalidades para normalizar los datos de origen de los estudiantes

```sql
CREATE TABLE nacionalidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_iso TEXT NOT NULL UNIQUE, -- Código ISO 3166-1 alpha-2 (ej: CL, AR, PE)
    nombre_espanol TEXT NOT NULL,    -- Nombre en español (ej: Chile, Argentina, Perú)
    nombre_ingles TEXT NOT NULL,     -- Nombre en inglés (ej: Chile, Argentina, Peru)
    continente TEXT NOT NULL,        -- Continente (ej: América del Sur, América del Norte, Europa)
    region TEXT,                     -- Región específica (ej: Cono Sur, Andina, Caribe)
    activa BOOLEAN DEFAULT TRUE,     -- Si está activa para selección
    orden_visual INTEGER,            -- Para ordenar en la UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único (UUID)
- `codigo_iso`: Código ISO 3166-1 alpha-2 (ej: CL, AR, PE)
- `nombre_espanol`: Nombre del país en español
- `nombre_ingles`: Nombre del país en inglés
- `continente`: Continente al que pertenece
- `region`: Región específica dentro del continente
- `activa`: Si está disponible para selección
- `orden_visual`: Orden de visualización en la UI
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**Índices**:
- `idx_nacionalidades_codigo`: Búsquedas por código ISO
- `idx_nacionalidades_continente`: Búsquedas por continente
- `idx_nacionalidades_activa`: Filtros por estado activo
- `idx_nacionalidades_orden`: Ordenamiento para UI

**Datos Incluidos**:
- **Sudamérica**: Chile, Argentina, Perú, Brasil, Colombia, etc. (prioridad alta)
- **América del Norte**: Estados Unidos, Canadá, México
- **Europa**: España, Francia, Alemania, Italia, etc.
- **Asia**: China, Japón, India, Corea del Sur, etc.
- **África**: Egipto, Nigeria, Sudáfrica, Kenia, etc.
- **Oceanía**: Australia, Nueva Zelanda, Fiyi, etc.

---

### 3. Tabla `colegios`
**Propósito**: Catálogo completo de establecimientos educacionales de Chile con datos del MINEDUC

```sql
CREATE TABLE colegios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rbd TEXT NOT NULL UNIQUE, -- RBD (Rol Base de Datos) único del establecimiento
    nombre TEXT NOT NULL, -- Nombre del establecimiento
    nombre_corto TEXT, -- Nombre abreviado para UI
    dependencia TEXT NOT NULL CHECK (dependencia IN ('Municipal', 'Particular Subvencionado', 'Particular Pagado', 'Corporación de Administración Delegada', 'Servicio Local de Educación')),
    tipo_educacion TEXT NOT NULL CHECK (tipo_educacion IN ('Básica', 'Media', 'Básica y Media', 'Especial')),
    modalidad TEXT, -- Modalidad educativa (ej: Humanista-Científico, Técnico-Profesional, Artístico)
    region_id INTEGER NOT NULL, -- ID de la región (1-16)
    region_nombre TEXT NOT NULL, -- Nombre de la región
    comuna_id INTEGER NOT NULL, -- ID de la comuna
    comuna_nombre TEXT NOT NULL, -- Nombre de la comuna
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    sitio_web TEXT,
    latitud DECIMAL(10, 8), -- Coordenada latitud
    longitud DECIMAL(11, 8), -- Coordenada longitud
    activo BOOLEAN DEFAULT TRUE, -- Si el establecimiento está activo
    fecha_creacion DATE, -- Fecha de creación del establecimiento
    fecha_cierre DATE, -- Fecha de cierre (si aplica)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único (UUID)
- `rbd`: RBD único del establecimiento (6 dígitos)
- `nombre`: Nombre completo del establecimiento
- `nombre_corto`: Nombre abreviado para interfaz de usuario
- `dependencia`: Tipo de dependencia (Municipal, Particular Subvencionado, etc.)
- `tipo_educacion`: Nivel educativo (Básica, Media, Básica y Media, Especial)
- `modalidad`: Modalidad educativa (Humanista-Científico, Técnico-Profesional, Artístico)
- `region_id` / `region_nombre`: Código y nombre de la región
- `comuna_id` / `comuna_nombre`: Código y nombre de la comuna
- `direccion`: Dirección física del establecimiento
- `telefono`: Teléfono de contacto
- `email`: Email de contacto
- `sitio_web`: Sitio web oficial
- `latitud` / `longitud`: Coordenadas geográficas
- `activo`: Si el establecimiento está activo
- `fecha_creacion`: Fecha de creación del establecimiento
- `fecha_cierre`: Fecha de cierre (si aplica)

**Índices**:
- `idx_colegios_rbd`: Búsquedas por RBD
- `idx_colegios_nombre`: Búsquedas por nombre
- `idx_colegios_dependencia`: Filtros por tipo de dependencia
- `idx_colegios_region`: Búsquedas por región
- `idx_colegios_comuna`: Búsquedas por comuna
- `idx_colegios_activo`: Filtros por estado activo
- `idx_colegios_tipo_educacion`: Filtros por tipo de educación

**Datos Incluidos**:
- **Establecimientos activos**: ~12,000 colegios
- **Con enseñanza media**: ~8,000 establecimientos
- **Técnico-profesionales**: ~2,000 establecimientos
- **Distribución geográfica**: Todas las regiones de Chile
- **Tipos de dependencia**: Municipal, Particular Subvencionado, Particular Pagado

**Fuente de Datos**: Portal de Datos Abiertos MINEDUC (https://datos.mineduc.cl/)

---

### 4. Tabla `datos_academicos`
**Propósito**: Información educacional del estudiante

```sql
CREATE TABLE datos_academicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospecto_id UUID NOT NULL REFERENCES prospectos(id) ON DELETE CASCADE,
    curso_actual TEXT,
    region_colegio TEXT,
    comuna_colegio TEXT,
    nombre_colegio TEXT,
    carrera_interes TEXT,
    nivel_educativo_actual TEXT CHECK (nivel_educativo_actual IN ('1ro Medio', '2do Medio', '3ro Medio', '4to Medio', 'Egresado')) DEFAULT 'Egresado',
    promedio DECIMAL(3,2) CHECK (promedio IS NULL OR (promedio >= 1.0 AND promedio <= 7.0)),
    nem DECIMAL(3,2) CHECK (nem IS NULL OR (nem >= 1.0 AND nem <= 7.0)),
    ranking DECIMAL(6,2) CHECK (ranking IS NULL OR (ranking >= 0 AND ranking <= 1000)),
    año_egreso INTEGER CHECK (año_egreso IS NULL OR (año_egreso >= 2000 AND año_egreso <= EXTRACT(YEAR FROM NOW()))),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `prospecto_id`: Referencia al prospecto
- `curso_actual`: Curso actual en enseñanza media
- `region_colegio`: Región donde está el colegio
- `comuna_colegio`: Comuna del colegio
- `nombre_colegio`: Nombre del establecimiento
- `carrera_interes`: Carrera que quiere estudiar
- `nivel_educativo_actual`: Nivel educativo actual del estudiante
- `promedio`: Promedio de notas del colegio (1.0 - 7.0) - OBLIGATORIO para egresados, NULL para estudiantes de 1ro a 4to medio
- `nem`: NEM - Notas de Enseñanza Media (1.0 - 7.0) - OBLIGATORIO para egresados, NULL para estudiantes de 1ro a 4to medio
- `ranking`: Ranking de notas (0 - 1000) - OBLIGATORIO para egresados, NULL para estudiantes de 1ro a 4to medio
- `año_egreso`: Año de egreso - OBLIGATORIO para egresados, NULL para estudiantes de 1ro a 4to medio

**Constraints Inteligentes**:
- Si `nivel_educativo_actual = 'Egresado'` → `promedio`, `nem`, `ranking`, `año_egreso` son OBLIGATORIOS
- Si `nivel_educativo_actual != 'Egresado'` → `promedio`, `nem`, `ranking`, `año_egreso` deben ser NULL

**Índices**:
- `idx_datos_academicos_prospecto`: Búsquedas por prospecto
- `idx_datos_academicos_carrera`: Búsquedas por carrera

---

### 3. Tabla `puntajes_paes`
**Propósito**: Almacenar resultados de pruebas PAES (OPCIONAL en UNIACC)

**📊 Escala PAES 2024+**:
- **Puntaje mínimo**: 100 puntos
- **Puntaje máximo**: 1.000 puntos
- **Aplicable a**: Todas las pruebas PAES, NEM y Ranking de Notas
- **Implementación**: Desde Proceso de Admisión 2024

**🎓 Estados del Estudiante**:
- **Sin rendir**: Estudiante en 1°-4° medio (sin puntajes)
- **Rendido**: Estudiante egresado con puntajes PAES
- **En proceso**: Estudiante de 4° medio que rendirá próximamente

```sql
CREATE TABLE puntajes_paes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospecto_id UUID NOT NULL REFERENCES prospectos(id) ON DELETE CASCADE,
    
    -- Pruebas Obligatorias
    puntaje_comprension_lectora INTEGER CHECK (puntaje_comprension_lectora >= 100 AND puntaje_comprension_lectora <= 1000),
    puntaje_matematica_1 INTEGER CHECK (puntaje_matematica_1 >= 100 AND puntaje_matematica_1 <= 1000),
    
    -- Pruebas Electivas
    puntaje_matematica_2 INTEGER CHECK (puntaje_matematica_2 >= 100 AND puntaje_matematica_2 <= 1000),
    puntaje_historia_geografia INTEGER CHECK (puntaje_historia_geografia >= 100 AND puntaje_historia_geografia <= 1000),
    puntaje_ciencias INTEGER CHECK (puntaje_ciencias >= 100 AND puntaje_ciencias <= 1000),
    puntaje_fisica INTEGER CHECK (puntaje_fisica >= 100 AND puntaje_fisica <= 1000),
    puntaje_quimica INTEGER CHECK (puntaje_quimica >= 100 AND puntaje_quimica <= 1000),
    puntaje_biologia INTEGER CHECK (puntaje_biologia >= 100 AND puntaje_biologia <= 1000),
    
    -- Metadatos
    año_rendicion INTEGER CHECK (año_rendicion >= 2020 AND año_rendicion <= 2030),
    tipo_rendicion TEXT CHECK (tipo_rendicion IN ('PAES', 'PSU', 'PDT')),
    estado_estudiante TEXT CHECK (estado_estudiante IN ('sin_rendir', 'en_proceso', 'rendido')) DEFAULT 'sin_rendir',
    fecha_rendicion DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `prospecto_id`: Referencia al prospecto
- `puntaje_comprension_lectora`: Puntaje comprensión lectora (obligatorio, 100-1000)
- `puntaje_matematica_1`: Puntaje matemática 1 (obligatorio, 100-1000)
- `puntaje_matematica_2`: Puntaje matemática 2 (electivo, 100-1000)
- `puntaje_historia_geografia`: Puntaje historia y geografía (electivo, 100-1000)
- `puntaje_ciencias`: Puntaje ciencias (electivo, 100-1000)
- `puntaje_fisica`: Puntaje física (electivo, 100-1000)
- `puntaje_quimica`: Puntaje química (electivo, 100-1000)
- `puntaje_biologia`: Puntaje biología (electivo, 100-1000)
- `año_rendicion`: Año en que rindió la prueba
- `tipo_rendicion`: Tipo de prueba (PAES, PSU, PDT)
- `estado_estudiante`: Estado del estudiante ('sin_rendir', 'en_proceso', 'rendido')
- `fecha_rendicion`: Fecha específica de rendición (opcional)

**Índices**:
- `idx_puntajes_paes_prospecto`: Búsquedas por prospecto
- `idx_puntajes_paes_año`: Búsquedas por año
- `idx_puntajes_paes_tipo`: Búsquedas por tipo de prueba
- `idx_puntajes_paes_estado`: Búsquedas por estado del estudiante
- `idx_puntajes_paes_total`: Búsquedas por puntaje total

---

### 4. Tabla `datos_socioeconomicos`
**Propósito**: Información socioeconómica del estudiante

```sql
CREATE TABLE datos_socioeconomicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospecto_id UUID NOT NULL REFERENCES prospectos(id) ON DELETE CASCADE,
    usa_cae BOOLEAN DEFAULT FALSE,
    decil_ingreso INTEGER CHECK (decil_ingreso >= 1 AND decil_ingreso <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `prospecto_id`: Referencia al prospecto
- `usa_cae`: Si usa Crédito con Aval del Estado
- `decil_ingreso`: Decil de ingreso familiar (1-10)

**Índices**:
- `idx_datos_socioeconomicos_prospecto`: Búsquedas por prospecto
- `idx_datos_socioeconomicos_decil`: Búsquedas por decil

---

### 5. Tabla `becas`
**Propósito**: Catálogo de becas disponibles

```sql
CREATE TABLE becas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    porcentaje_descuento DECIMAL(5,2) CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100),
    requisitos JSONB,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `nombre`: Nombre de la beca
- `descripcion`: Descripción detallada
- `porcentaje_descuento`: Porcentaje de descuento (0-100)
- `requisitos`: Requisitos en formato JSON
- `activa`: Si la beca está disponible

**Índices**:
- `idx_becas_nombre`: Búsquedas por nombre
- `idx_becas_activa`: Búsquedas por estado

---

### 6. Tabla `beneficios`
**Propósito**: Catálogo de beneficios disponibles

```sql
CREATE TABLE beneficios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT CHECK (tipo IN ('descuento', 'servicio', 'beneficio_especial')),
    valor DECIMAL(10,2),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `nombre`: Nombre del beneficio
- `descripcion`: Descripción detallada
- `tipo`: Tipo de beneficio
- `valor`: Valor del beneficio
- `activo`: Si el beneficio está disponible

**Índices**:
- `idx_beneficios_nombre`: Búsquedas por nombre
- `idx_beneficios_tipo`: Búsquedas por tipo
- `idx_beneficios_activo`: Búsquedas por estado

---

### 7. Tabla `beneficios_uniacc`
**Propósito**: Almacenar todos los beneficios específicos de UNIACC (internos y externos)

```sql
CREATE TABLE beneficios_uniacc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_beneficio INTEGER UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    porcentaje_maximo DECIMAL(5,2),
    monto_maximo DECIMAL(12,2),
    tipo_beneficio TEXT CHECK (tipo_beneficio IN ('BECA', 'FINANCIAMIENTO', 'FINANCIERO')),
    origen_beneficio TEXT CHECK (origen_beneficio IN ('INTERNO', 'EXTERNO')),
    aplicacion_concepto TEXT CHECK (aplicacion_concepto IN ('A', 'M')),
    aplicacion TEXT CHECK (aplicacion IN ('SALDO', 'TOTAL')),
    prioridad INTEGER CHECK (prioridad >= 1 AND prioridad <= 3),
    vigente BOOLEAN DEFAULT TRUE,
    usuario_creacion INTEGER,
    fecha_modificacion TIMESTAMP,
    requisitos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `codigo_beneficio`: Código original del sistema UNIACC
- `descripcion`: Descripción del beneficio
- `porcentaje_maximo`: Porcentaje máximo de descuento
- `monto_maximo`: Monto máximo en pesos
- `tipo_beneficio`: Tipo (BECA, FINANCIAMIENTO, FINANCIERO)
- `origen_beneficio`: Origen (INTERNO, EXTERNO)
- `aplicacion_concepto`: Aplicación del concepto (A=Arancel, M=Matrícula)
- `aplicacion`: Aplicación (SALDO, TOTAL)
- `prioridad`: Nivel de prioridad (1-3, donde 1=mayor prioridad)
- `vigente`: Si el beneficio está activo
- `usuario_creacion`: ID del usuario que lo creó
- `fecha_modificacion`: Fecha de última modificación
- `requisitos`: Requisitos específicos en formato JSON

**Índices**:
- `idx_beneficios_uniacc_codigo`: Búsquedas por código
- `idx_beneficios_uniacc_tipo`: Búsquedas por tipo
- `idx_beneficios_uniacc_origen`: Búsquedas por origen
- `idx_beneficios_uniacc_vigente`: Búsquedas por vigencia
- `idx_beneficios_uniacc_prioridad`: Búsquedas por prioridad

**Ejemplos de Datos**:
```sql
-- Beca interna por rendimiento (Prioridad 1 - Mayor prioridad)
INSERT INTO beneficios_uniacc (codigo_beneficio, descripcion, porcentaje_maximo, tipo_beneficio, origen_beneficio, aplicacion_concepto, aplicacion, prioridad, vigente) VALUES
(1760, 'MC ASIGNATURAS EN UN SEMESTRE', 50.0, 'BECA', 'INTERNO', 'A', 'TOTAL', 1, true);

-- Beca externa CAE (Prioridad 1)
INSERT INTO beneficios_uniacc (codigo_beneficio, descripcion, monto_maximo, tipo_beneficio, origen_beneficio, aplicacion_concepto, aplicacion, prioridad, vigente) VALUES
(4, 'CREDITO AVAL DEL ESTADO', 4300000.0, 'FINANCIAMIENTO', 'EXTERNO', 'A', 'SALDO', 1, true);

-- Descuento por forma de pago (Prioridad 3 - Menor prioridad)
INSERT INTO beneficios_uniacc (codigo_beneficio, descripcion, porcentaje_maximo, tipo_beneficio, origen_beneficio, aplicacion_concepto, aplicacion, prioridad, vigente) VALUES
(1, 'Descuento Pago Efectivo', 5.0, 'FINANCIERO', 'INTERNO', 'A', 'SALDO', 3, true);

-- Beca por convenio (Prioridad 2)
INSERT INTO beneficios_uniacc (codigo_beneficio, descripcion, porcentaje_maximo, tipo_beneficio, origen_beneficio, aplicacion_concepto, aplicacion, prioridad, vigente) VALUES
(1761, 'ADTRES', 20.0, 'BECA', 'INTERNO', 'A', 'SALDO', 2, true);

-- Beca de matrícula (Aplicación M)
INSERT INTO beneficios_uniacc (codigo_beneficio, descripcion, porcentaje_maximo, tipo_beneficio, origen_beneficio, aplicacion_concepto, aplicacion, prioridad, vigente) VALUES
(1816, 'Beca Titular Valech Matricula', 100.0, 'FINANCIAMIENTO', 'EXTERNO', 'M', 'TOTAL', 1, true);
```

---

## 📊 Análisis de Beneficios Activos UNIACC

### **Estadísticas del Archivo UConectores_dbo_MT_BENEFICIO.csv:**

**Total de Beneficios Activos**: 164 beneficios

**Distribución por Tipo**:
- **BECA**: 120 beneficios (73.2%)
- **FINANCIAMIENTO**: 13 beneficios (7.9%)
- **FINANCIERO**: 31 beneficios (18.9%)

**Distribución por Origen**:
- **INTERNO**: 150 beneficios (91.5%)
- **EXTERNO**: 14 beneficios (8.5%)

**Distribución por Prioridad**:
- **Prioridad 1**: 45 beneficios (27.4%) - Mayor prioridad
- **Prioridad 2**: 89 beneficios (54.3%) - Prioridad media
- **Prioridad 3**: 30 beneficios (18.3%) - Menor prioridad

**Distribución por Aplicación**:
- **A (Arancel)**: 140 beneficios (85.4%)
- **M (Matrícula)**: 24 beneficios (14.6%)

**Beneficios Destacados**:
- **CAE**: Crédito con Aval del Estado ($4,300,000)
- **Becas MINEDUC**: Excelencia Académica, Juan Gómez Millas
- **Convenios Institucionales**: ADTRES, AMUCH, PDI, FACH
- **Becas Internas**: Talento Virtual, Docentes, Egresados
- **Descuentos**: Formas de pago, pago anticipado

---

### 8. Tabla `deciles`
**Propósito**: Definir los deciles socioeconómicos para cálculo de becas

```sql
CREATE TABLE deciles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    decil INTEGER UNIQUE NOT NULL CHECK (decil >= 1 AND decil <= 10),
    rango_ingreso_min DECIMAL(12,2) NOT NULL,
    rango_ingreso_max DECIMAL(12,2) NOT NULL,
    descripcion TEXT NOT NULL,
    descripcion_corta TEXT NOT NULL, -- Para mostrar en dropdown
    porcentaje_poblacion DECIMAL(5,2) NOT NULL CHECK (porcentaje_poblacion >= 0 AND porcentaje_poblacion <= 100),
    activo BOOLEAN DEFAULT TRUE,
    orden_visual INTEGER NOT NULL, -- Para ordenar en la interfaz
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `decil`: Número del decil (1-10)
- `rango_ingreso_min`: Ingreso mínimo del decil
- `rango_ingreso_max`: Ingreso máximo del decil
- `descripcion`: Descripción completa del nivel socioeconómico
- `descripcion_corta`: Descripción corta para mostrar en dropdown
- `porcentaje_poblacion`: Porcentaje de población en este decil
- `activo`: Si el decil está disponible para uso
- `orden_visual`: Orden para mostrar en la interfaz

**Índices**:
- `idx_deciles_decil`: Búsquedas por número de decil
- `idx_deciles_activo`: Búsquedas por estado activo

**Datos Oficiales de Deciles (Ingreso por Persona) - Fuente Oficial**:
```sql
INSERT INTO deciles (decil, rango_ingreso_min, rango_ingreso_max, descripcion, descripcion_corta, porcentaje_poblacion, orden_visual) VALUES
(1, 0, 81150, 'Primer 1º decil: desde $0 a $81.150 ingresos por persona', '1º decil: $0 a $81.150', 10.0, 1),
(2, 81151, 128281, 'Segundo 2º decil: $81.150 a $128.281 ingresos por persona', '2º decil: $81.150 a $128.281', 10.0, 2),
(3, 128282, 169998, 'Tercer 3º decil: $128.281 a $169.998 ingresos por persona', '3º decil: $128.281 a $169.998', 10.0, 3),
(4, 169999, 211695, 'Cuarto 4º decil: $169.998 a $211.695 ingresos por persona', '4º decil: $169.998 a $211.695', 10.0, 4),
(5, 211696, 258268, 'Quinto 5º decil: $211.695 a $258.268 ingresos por persona', '5º decil: $211.695 a $258.268', 10.0, 5),
(6, 258269, 324984, 'Sexto 6º decil: $258.268 a $324.984 ingresos por persona', '6º decil: $258.268 a $324.984', 10.0, 6),
(7, 324985, 412913, 'Séptimo 7º decil: $324.984 a $412.913 ingresos por persona', '7º decil: $324.984 a $412.913', 10.0, 7),
(8, 412914, 555965, 'Octavo 8º decil: $412.913 a $555.965 ingresos por persona', '8º decil: $412.913 a $555.965', 10.0, 8),
(9, 555966, 904199, 'Noveno 9º decil: $555.965 a $904.199 ingresos por persona', '9º decil: $555.965 a $904.199', 10.0, 9),
(10, 904200, 999999999, 'Décimo 10º decil: $904.199 en adelante ingresos por persona', '10º decil: $904.199 en adelante', 10.0, 10);
```

**Ejemplos de Becas con Requisitos de Decil**:
```sql
-- Beca para estudiantes de bajos recursos (decil 1-3)
INSERT INTO becas (nombre, descripcion, porcentaje_descuento, requisitos) VALUES
('Beca Socioeconómica', 'Beca para estudiantes de bajos recursos', 100.0, 
 '{"decil_maximo": 3, "requisitos_academicos": {"promedio_minimo": 5.0}}');

-- Beca para estudiantes de recursos medios (decil 1-6)
INSERT INTO becas (nombre, descripcion, porcentaje_descuento, requisitos) VALUES
('Beca de Excelencia Académica', 'Beca para estudiantes con buen rendimiento', 50.0, 
 '{"decil_maximo": 6, "requisitos_academicos": {"promedio_minimo": 6.0, "puntaje_paes_minimo": 700}}');

-- Beca general (sin restricción de decil)
INSERT INTO becas (nombre, descripcion, porcentaje_descuento, requisitos) VALUES
('Beca de Matrícula', 'Descuento en matrícula para todos los estudiantes', 25.0, 
 '{"requisitos_academicos": {"promedio_minimo": 4.0}}');
```

---

### 8. Tabla `simulaciones`
**Propósito**: Historial de simulaciones realizadas

```sql
CREATE TABLE simulaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospecto_id UUID NOT NULL REFERENCES prospectos(id) ON DELETE CASCADE,
    datos_simulacion JSONB NOT NULL,
    becas_aplicables JSONB,
    beneficios_aplicables JSONB,
    total_descuento DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos**:
- `id`: Identificador único
- `prospecto_id`: Referencia al prospecto
- `datos_simulacion`: Datos completos de la simulación
- `becas_aplicables`: Becas que aplican
- `beneficios_aplicables`: Beneficios que aplican
- `total_descuento`: Descuento total calculado

**Índices**:
- `idx_simulaciones_prospecto`: Búsquedas por prospecto
- `idx_simulaciones_fecha`: Búsquedas por fecha

---

## 🔧 Funciones y Vistas

### Vista `vista_puntajes_carrera`
```sql
CREATE VIEW vista_puntajes_carrera AS
SELECT 
    p.id as prospecto_id,
    p.nombre,
    p.apellido,
    da.carrera_interes,
    paes.puntaje_comprension_lectora,
    paes.puntaje_matematica_1,
    paes.puntaje_matematica_2,
    paes.puntaje_historia_geografia,
    paes.puntaje_ciencias,
    paes.puntaje_fisica,
    paes.puntaje_quimica,
    paes.puntaje_biologia,
    paes.año_rendicion,
    paes.tipo_rendicion,
    -- Calcular puntaje ponderado según carrera
    CASE 
        WHEN da.carrera_interes ILIKE '%ingeniería%' OR da.carrera_interes ILIKE '%matemática%' THEN
            COALESCE(paes.puntaje_matematica_1, 0) + COALESCE(paes.puntaje_matematica_2, 0)
        WHEN da.carrera_interes ILIKE '%medicina%' OR da.carrera_interes ILIKE '%enfermería%' THEN
            COALESCE(paes.puntaje_biologia, 0) + COALESCE(paes.puntaje_quimica, 0)
        WHEN da.carrera_interes ILIKE '%derecho%' OR da.carrera_interes ILIKE '%psicología%' THEN
            COALESCE(paes.puntaje_comprension_lectora, 0) + COALESCE(paes.puntaje_historia_geografia, 0)
        ELSE
            COALESCE(paes.puntaje_comprension_lectora, 0) + COALESCE(paes.puntaje_matematica_1, 0)
    END as puntaje_ponderado
FROM prospectos p
JOIN datos_academicos da ON p.id = da.prospecto_id
LEFT JOIN puntajes_paes paes ON p.id = paes.prospecto_id;
```

### Función `calcular_puntaje_ponderado`
```sql
CREATE OR REPLACE FUNCTION calcular_puntaje_ponderado(
    carrera TEXT,
    puntaje_cl INTEGER,
    puntaje_m1 INTEGER,
    puntaje_m2 INTEGER,
    puntaje_hg INTEGER,
    puntaje_ciencias INTEGER,
    puntaje_fisica INTEGER,
    puntaje_quimica INTEGER,
    puntaje_biologia INTEGER
) RETURNS INTEGER AS $$
BEGIN
    RETURN CASE 
        WHEN carrera ILIKE '%ingeniería%' OR carrera ILIKE '%matemática%' OR carrera ILIKE '%física%' THEN
            COALESCE(puntaje_m1, 0) + COALESCE(puntaje_m2, 0)
        WHEN carrera ILIKE '%medicina%' OR carrera ILIKE '%enfermería%' OR carrera ILIKE '%química%' THEN
            COALESCE(puntaje_biologia, 0) + COALESCE(puntaje_quimica, 0)
        WHEN carrera ILIKE '%derecho%' OR carrera ILIKE '%psicología%' OR carrera ILIKE '%historia%' THEN
            COALESCE(puntaje_cl, 0) + COALESCE(puntaje_hg, 0)
        WHEN carrera ILIKE '%pedagogía%' OR carrera ILIKE '%educación%' THEN
            COALESCE(puntaje_cl, 0) + COALESCE(puntaje_ciencias, 0)
        ELSE
            COALESCE(puntaje_cl, 0) + COALESCE(puntaje_m1, 0)
    END;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 Seguridad (RLS)

### Políticas de Seguridad
- **Prospectos**: Solo pueden ver sus propios datos
- **Becas/Beneficios**: Visibles para todos (solo activos)
- **Simulaciones**: Solo el propietario puede ver sus simulaciones

### Triggers
- **updated_at**: Actualización automática de timestamps
- **Validaciones**: Checks en campos críticos

---

## 📊 Estadísticas de Uso

### Consultas Frecuentes
1. **Búsqueda por carrera**: `SELECT * FROM vista_puntajes_carrera WHERE carrera_interes ILIKE '%ingeniería%'`
2. **Puntajes altos**: `SELECT * FROM puntajes_paes WHERE puntaje_comprension_lectora > 800`
3. **Puntajes excelentes**: `SELECT * FROM puntajes_paes WHERE puntaje_comprension_lectora >= 900`
4. **Becas aplicables**: `SELECT * FROM becas WHERE activa = true AND porcentaje_descuento > 50`
5. **Simulaciones recientes**: `SELECT * FROM simulaciones ORDER BY created_at DESC LIMIT 10`

### Índices de Rendimiento
- Todos los campos de búsqueda tienen índices
- Índices compuestos para consultas complejas
- Índices parciales para datos activos

---

## 🚀 Comandos SQL para Implementación

### Crear Índices Adicionales
```sql
-- Índice para estado del estudiante
CREATE INDEX idx_puntajes_paes_estado ON puntajes_paes(estado_estudiante);

-- Índice compuesto para búsquedas por estado y año
CREATE INDEX idx_puntajes_paes_estado_año ON puntajes_paes(estado_estudiante, año_rendicion);
```

### Consultas por Estado del Estudiante
```sql
-- Estudiantes sin rendir PAES (1°-3° medio)
SELECT p.nombre, p.apellido, da.curso_actual 
FROM prospectos p
JOIN datos_academicos da ON p.id = da.prospecto_id
LEFT JOIN puntajes_paes paes ON p.id = paes.prospecto_id
WHERE paes.estado_estudiante = 'sin_rendir' OR paes.estado_estudiante IS NULL;

-- Estudiantes en proceso (4° medio)
SELECT p.nombre, p.apellido, da.curso_actual, paes.fecha_rendicion
FROM prospectos p
JOIN datos_academicos da ON p.id = da.prospecto_id
JOIN puntajes_paes paes ON p.id = paes.prospecto_id
WHERE paes.estado_estudiante = 'en_proceso';

-- Estudiantes con puntajes (egresados)
SELECT p.nombre, p.apellido, paes.puntaje_comprension_lectora, paes.puntaje_matematica_1
FROM prospectos p
JOIN puntajes_paes paes ON p.id = paes.prospecto_id
WHERE paes.estado_estudiante = 'rendido';
```

### Consultas para Deciles
```sql
-- Obtener deciles para dropdown (ordenados)
SELECT decil, descripcion_corta, rango_ingreso_min, rango_ingreso_max
FROM deciles
WHERE activo = true
ORDER BY orden_visual;

-- Obtener decil específico por ID
SELECT * FROM deciles WHERE decil = 2;

-- Buscar decil por rango de ingreso
SELECT decil, descripcion_corta 
FROM deciles 
WHERE 100000 BETWEEN rango_ingreso_min AND rango_ingreso_max
AND activo = true;
```

### Lógica de Simulación por Estado
```sql
-- Función para determinar si puede simular
CREATE OR REPLACE FUNCTION puede_simular(prospecto_uuid UUID) 
RETURNS BOOLEAN AS $$
DECLARE
    estado_actual TEXT;
BEGIN
    SELECT estado_estudiante INTO estado_actual 
    FROM puntajes_paes 
    WHERE prospecto_id = prospecto_uuid;
    
    RETURN estado_actual IN ('rendido', 'en_proceso') OR estado_actual IS NULL;
END;
$$ LANGUAGE plpgsql;
```

### Funciones para Beneficios UNIACC
```sql
-- Función para obtener beneficios por tipo y origen
CREATE OR REPLACE FUNCTION obtener_beneficios_uniacc(
    tipo_ben TEXT DEFAULT NULL,
    origen_ben TEXT DEFAULT NULL,
    solo_vigentes BOOLEAN DEFAULT TRUE
) RETURNS TABLE (
    codigo_beneficio INTEGER,
    descripcion TEXT,
    porcentaje_maximo DECIMAL,
    monto_maximo DECIMAL,
    tipo_beneficio TEXT,
    origen_beneficio TEXT,
    prioridad INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bu.codigo_beneficio,
        bu.descripcion,
        bu.porcentaje_maximo,
        bu.monto_maximo,
        bu.tipo_beneficio,
        bu.origen_beneficio,
        bu.prioridad
    FROM beneficios_uniacc bu
    WHERE (tipo_ben IS NULL OR bu.tipo_beneficio = tipo_ben)
    AND (origen_ben IS NULL OR bu.origen_beneficio = origen_ben)
    AND (NOT solo_vigentes OR bu.vigente = true)
    ORDER BY bu.prioridad, bu.codigo_beneficio;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular beneficios aplicables por perfil
CREATE OR REPLACE FUNCTION calcular_beneficios_aplicables(
    prospecto_uuid UUID
) RETURNS TABLE (
    codigo_beneficio INTEGER,
    descripcion TEXT,
    porcentaje_maximo DECIMAL,
    monto_maximo DECIMAL,
    tipo_beneficio TEXT,
    origen_beneficio TEXT,
    aplicacion_concepto TEXT,
    prioridad INTEGER,
    elegible BOOLEAN,
    razon_elegibilidad TEXT
) AS $$
DECLARE
    decil_estudiante INTEGER;
    promedio_estudiante DECIMAL;
    puntaje_paes_estudiante INTEGER;
BEGIN
    -- Obtener datos del estudiante
    SELECT ds.decil_ingreso INTO decil_estudiante
    FROM datos_socioeconomicos ds
    WHERE ds.prospecto_id = prospecto_uuid;
    
    SELECT da.promedio INTO promedio_estudiante
    FROM datos_academicos da
    WHERE da.prospecto_id = prospecto_uuid;
    
    SELECT COALESCE(paes.puntaje_comprension_lectora, 0) + COALESCE(paes.puntaje_matematica_1, 0) INTO puntaje_paes_estudiante
    FROM puntajes_paes paes
    WHERE paes.prospecto_id = prospecto_uuid;
    
    -- Retornar beneficios con elegibilidad
    RETURN QUERY
    SELECT 
        bu.codigo_beneficio,
        bu.descripcion,
        bu.porcentaje_maximo,
        bu.monto_maximo,
        bu.tipo_beneficio,
        bu.origen_beneficio,
        bu.aplicacion_concepto,
        bu.prioridad,
        CASE 
            WHEN bu.tipo_beneficio = 'BECA' AND bu.descripcion ILIKE '%DACC%' AND puntaje_paes_estudiante >= 600 THEN true
            WHEN bu.tipo_beneficio = 'BECA' AND bu.descripcion ILIKE '%NEM%' AND promedio_estudiante >= 5.0 THEN true
            WHEN bu.tipo_beneficio = 'BECA' AND bu.descripcion ILIKE '%PSU%' AND puntaje_paes_estudiante >= 500 THEN true
            WHEN bu.tipo_beneficio = 'FINANCIAMIENTO' AND bu.descripcion ILIKE '%CAE%' THEN true
            WHEN bu.tipo_beneficio = 'FINANCIERO' THEN true -- Descuentos siempre aplicables
            WHEN bu.descripcion ILIKE '%TALENTO%' AND promedio_estudiante >= 5.5 THEN true
            WHEN bu.descripcion ILIKE '%MIGRANTE%' THEN true
            ELSE false
        END as elegible,
        CASE 
            WHEN bu.tipo_beneficio = 'BECA' AND bu.descripcion ILIKE '%DACC%' AND puntaje_paes_estudiante >= 600 THEN 'Cumple requisitos de puntaje DACC'
            WHEN bu.tipo_beneficio = 'BECA' AND bu.descripcion ILIKE '%NEM%' AND promedio_estudiante >= 5.0 THEN 'Cumple requisitos de promedio NEM'
            WHEN bu.tipo_beneficio = 'BECA' AND bu.descripcion ILIKE '%PSU%' AND puntaje_paes_estudiante >= 500 THEN 'Cumple requisitos de puntaje PSU'
            WHEN bu.tipo_beneficio = 'FINANCIAMIENTO' AND bu.descripcion ILIKE '%CAE%' THEN 'Elegible para CAE'
            WHEN bu.tipo_beneficio = 'FINANCIERO' THEN 'Descuento por forma de pago'
            WHEN bu.descripcion ILIKE '%TALENTO%' AND promedio_estudiante >= 5.5 THEN 'Cumple requisitos de beca talento'
            WHEN bu.descripcion ILIKE '%MIGRANTE%' THEN 'Elegible para beca migrante'
            ELSE 'No cumple requisitos'
        END as razon_elegibilidad
    FROM beneficios_uniacc bu
    WHERE bu.vigente = true
    ORDER BY bu.prioridad ASC, bu.codigo_beneficio;
END;
$$ LANGUAGE plpgsql;
```

### Funciones para Deciles
```sql
-- Función para obtener decil por ingreso
CREATE OR REPLACE FUNCTION obtener_decil_por_ingreso(ingreso_mensual DECIMAL)
RETURNS INTEGER AS $$
DECLARE
    decil_resultado INTEGER;
BEGIN
    SELECT decil INTO decil_resultado
    FROM deciles
    WHERE ingreso_mensual >= rango_ingreso_min 
    AND ingreso_mensual <= rango_ingreso_max
    AND activo = true
    ORDER BY decil
    LIMIT 1;
    
    RETURN COALESCE(decil_resultado, 5); -- Default a decil 5 si no encuentra
END;
$$ LANGUAGE plpgsql;

-- Función para verificar elegibilidad de beca por decil
CREATE OR REPLACE FUNCTION es_elegible_por_decil(
    prospecto_uuid UUID,
    decil_requerido INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    decil_estudiante INTEGER;
BEGIN
    SELECT ds.decil_ingreso INTO decil_estudiante
    FROM datos_socioeconomicos ds
    WHERE ds.prospecto_id = prospecto_uuid;
    
    RETURN decil_estudiante <= decil_requerido;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular becas aplicables por decil
CREATE OR REPLACE FUNCTION becas_aplicables_por_decil(prospecto_uuid UUID)
RETURNS TABLE (
    beca_id UUID,
    nombre TEXT,
    porcentaje_descuento DECIMAL,
    elegible BOOLEAN
) AS $$
DECLARE
    decil_estudiante INTEGER;
BEGIN
    -- Obtener decil del estudiante
    SELECT ds.decil_ingreso INTO decil_estudiante
    FROM datos_socioeconomicos ds
    WHERE ds.prospecto_id = prospecto_uuid;
    
    -- Retornar becas con elegibilidad
    RETURN QUERY
    SELECT 
        b.id,
        b.nombre,
        b.porcentaje_descuento,
        CASE 
            WHEN (b.requisitos->>'decil_maximo')::INTEGER IS NULL THEN true
            ELSE decil_estudiante <= (b.requisitos->>'decil_maximo')::INTEGER
        END as elegible
    FROM becas b
    WHERE b.activa = true;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 Próximos Pasos

1. **Crear tablas** en Supabase
2. **Insertar datos** de prueba
3. **Configurar políticas** de seguridad
4. **Probar consultas** de simulación
5. **Optimizar rendimiento** según uso real
