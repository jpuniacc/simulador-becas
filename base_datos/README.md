# 🗄️ Base de Datos - Simulador UNIACC

Este directorio contiene todos los scripts SQL necesarios para crear y configurar la base de datos del simulador de becas y beneficios de UNIACC.

## 📁 Archivos Incluidos

### Scripts Principales
- **`crear_tablas.sql`** - Script principal para crear todas las tablas, índices, triggers y constraints
- **`insertar_beneficios_uniacc.sql`** - Script para insertar los 164 beneficios activos de UNIACC
- **`verificar_base_datos.sql`** - Script de verificación para comprobar que todo esté funcionando correctamente

### Documentación
- **`supabase.md`** - Documentación completa del esquema de base de datos
- **`datos_prospecto.txt`** - Especificaciones de datos a recolectar
- **`UConectores_dbo_MT_BENEFICIO.csv`** - Archivo fuente con beneficios activos de UNIACC

## 🚀 Instrucciones de Ejecución

### 1. Crear la Base de Datos en Supabase

1. **Accede a tu proyecto de Supabase**
2. **Ve a la sección "SQL Editor"**
3. **Ejecuta los scripts en el siguiente orden:**

#### Paso 1: Crear Estructura Base
```sql
-- Ejecutar: crear_tablas.sql
-- Este script crea todas las tablas, índices, triggers y constraints
```

#### Paso 2: Insertar Beneficios UNIACC
```sql
-- Ejecutar: insertar_beneficios_uniacc.sql
-- Este script inserta los 164 beneficios activos de UNIACC
```

#### Paso 3: Verificar Instalación
```sql
-- Ejecutar: verificar_base_datos.sql
-- Este script verifica que todo esté funcionando correctamente
```

### 2. Verificar la Instalación

Después de ejecutar todos los scripts, deberías ver:

- ✅ **9 tablas creadas** (prospectos, datos_academicos, puntajes_paes, etc.)
- ✅ **164 beneficios UNIACC insertados**
- ✅ **10 deciles socioeconómicos configurados**
- ✅ **Índices y triggers funcionando**
- ✅ **Constraints de integridad activos**

## 📊 Estructura de la Base de Datos

### Tablas Principales

| Tabla | Propósito | Registros |
|-------|-----------|-----------|
| `prospectos` | Datos personales de estudiantes | - |
| `datos_academicos` | Información educacional | - |
| `puntajes_paes` | Resultados PAES completos | - |
| `datos_socioeconomicos` | Información financiera | - |
| `deciles` | Deciles socioeconómicos oficiales | 10 |
| `becas` | Catálogo de becas disponibles | - |
| `beneficios` | Catálogo de beneficios generales | - |
| `beneficios_uniacc` | Beneficios específicos UNIACC | 164 |
| `simulaciones` | Historial de simulaciones | - |

### Beneficios UNIACC por Categoría

- **Becas**: 120 beneficios (73.2%)
- **Financiamiento**: 13 beneficios (7.9%)
- **Financiero**: 31 beneficios (18.9%)

### Distribución por Prioridad

- **Prioridad 1**: 45 beneficios (27.4%) - Mayor prioridad
- **Prioridad 2**: 89 beneficios (54.3%) - Prioridad media  
- **Prioridad 3**: 30 beneficios (18.3%) - Menor prioridad

## 🔧 Características Técnicas

### Tipos de Datos
- **UUIDs** para identificadores únicos
- **DECIMAL** para montos, porcentajes y ranking (0-1000)
- **TEXT** para descripciones flexibles
- **JSONB** para datos estructurados
- **TIMESTAMP WITH TIME ZONE** para fechas

### Validaciones
- **CHECK constraints** para rangos válidos
- **FOREIGN KEYS** para integridad referencial
- **UNIQUE constraints** para datos únicos
- **NOT NULL** para campos obligatorios

### Índices
- **Búsquedas por email, RUT, pasaporte**
- **Filtros por tipo, origen, prioridad**
- **Ordenamiento por fechas y puntajes**

## 🚨 Solución de Problemas

### Error: "Table already exists"
```sql
-- Si una tabla ya existe, puedes eliminarla primero:
DROP TABLE IF EXISTS nombre_tabla CASCADE;
```

### Error: "Permission denied"
- Verifica que tengas permisos de administrador en Supabase
- Asegúrate de estar en el proyecto correcto

### Error: "Constraint violation"
- Verifica que los datos cumplan con las validaciones
- Revisa los tipos de datos y rangos permitidos

## 📝 Notas Importantes

1. **Backup**: Siempre haz backup de tu base de datos antes de ejecutar scripts
2. **Orden**: Ejecuta los scripts en el orden indicado
3. **Verificación**: Usa el script de verificación para confirmar que todo funciona
4. **Datos de Prueba**: El script de verificación incluye datos de prueba que se eliminan automáticamente

## 🔄 Próximos Pasos

Una vez que la base de datos esté creada:

1. **Configurar Row Level Security (RLS)** si es necesario
2. **Crear funciones de cálculo de becas**
3. **Implementar la lógica de negocio**
4. **Desarrollar la interfaz de usuario**

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Supabase
2. Verifica que todos los scripts se ejecutaron correctamente
3. Usa el script de verificación para diagnosticar problemas
4. Consulta la documentación en `supabase.md`

---

**¡La base de datos está lista para el simulador de becas UNIACC! 🎉**
