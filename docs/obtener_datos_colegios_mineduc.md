# 📚 Obtención de Datos de Colegios desde MINEDUC

## 🎯 Fuentes de Datos Oficiales

### **1. Portal de Datos Abiertos MINEDUC**
- **URL**: https://datos.mineduc.cl/
- **Dataset**: "Establecimientos Educacionales"
- **Formato**: CSV, Excel, JSON
- **Actualización**: Anual

### **2. Datos Específicos Necesarios**

#### **Campos Requeridos:**
- `RBD`: Rol Base de Datos (identificador único)
- `NOMBRE_ESTABLECIMIENTO`: Nombre completo
- `DEPENDENCIA`: Tipo de dependencia
- `REGION`: Código y nombre de región
- `COMUNA`: Código y nombre de comuna
- `DIRECCION`: Dirección física
- `TELEFONO`: Teléfono de contacto
- `EMAIL`: Email de contacto
- `SITIO_WEB`: Sitio web oficial
- `LATITUD` / `LONGITUD`: Coordenadas geográficas
- `FECHA_CREACION`: Fecha de creación
- `ESTADO`: Estado del establecimiento (activo/inactivo)

#### **Clasificaciones de Dependencia:**
- **Municipal**: Establecimientos municipales
- **Particular Subvencionado**: Establecimientos particulares con subvención
- **Particular Pagado**: Establecimientos particulares sin subvención
- **Corporación de Administración Delegada**: CAD
- **Servicio Local de Educación**: SLE

#### **Tipos de Educación:**
- **Básica**: Enseñanza básica únicamente
- **Media**: Enseñanza media únicamente
- **Básica y Media**: Ambas modalidades
- **Especial**: Educación especial

#### **Modalidades Educativas:**
- **Humanista-Científico**: Modalidad tradicional
- **Técnico-Profesional**: Modalidad técnica
- **Artístico**: Modalidad artística

---

## 🔧 Proceso de Importación

### **Paso 1: Descargar Datos**
```bash
# Descargar dataset desde MINEDUC
curl -o establecimientos_2024.csv "https://datos.mineduc.cl/api/3/action/datastore_search?resource_id=ESTABLECIMIENTOS_2024"
```

### **Paso 2: Procesar Datos**
```python
import pandas as pd
import numpy as np

# Cargar datos
df = pd.read_csv('establecimientos_2024.csv')

# Limpiar y normalizar datos
df['RBD'] = df['RBD'].astype(str).str.zfill(6)  # RBD con 6 dígitos
df['NOMBRE_ESTABLECIMIENTO'] = df['NOMBRE_ESTABLECIMIENTO'].str.strip()
df['DEPENDENCIA'] = df['DEPENDENCIA'].str.strip()

# Mapear dependencias
dependencia_map = {
    'Municipal': 'Municipal',
    'Particular Subvencionado': 'Particular Subvencionado',
    'Particular Pagado': 'Particular Pagado',
    'Corporación de Administración Delegada': 'Corporación de Administración Delegada',
    'Servicio Local de Educación': 'Servicio Local de Educación'
}

df['dependencia_normalizada'] = df['DEPENDENCIA'].map(dependencia_map)

# Filtrar solo establecimientos activos
df_activos = df[df['ESTADO'] == 'Activo']

# Crear nombre corto (primeras 3 palabras)
df_activos['nombre_corto'] = df_activos['NOMBRE_ESTABLECIMIENTO'].str.split().str[:3].str.join(' ')

# Limpiar coordenadas
df_activos['LATITUD'] = pd.to_numeric(df_activos['LATITUD'], errors='coerce')
df_activos['LONGITUD'] = pd.to_numeric(df_activos['LONGITUD'], errors='coerce')

# Guardar datos procesados
df_activos.to_csv('colegios_procesados.csv', index=False)
```

### **Paso 3: Generar SQL de Inserción**
```python
def generar_sql_insercion(df):
    sql_queries = []
    
    for _, row in df.iterrows():
        sql = f"""
INSERT INTO colegios (
    rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad,
    region_id, region_nombre, comuna_id, comuna_nombre,
    direccion, telefono, email, sitio_web,
    latitud, longitud, activo, fecha_creacion
) VALUES (
    '{row['RBD']}',
    '{row['NOMBRE_ESTABLECIMIENTO'].replace("'", "''")}',
    '{row['nombre_corto'].replace("'", "''")}',
    '{row['dependencia_normalizada']}',
    '{row['TIPO_EDUCACION']}',
    {f"'{row['MODALIDAD']}'" if pd.notna(row['MODALIDAD']) else 'NULL'},
    {row['CODIGO_REGION']},
    '{row['NOMBRE_REGION']}',
    {row['CODIGO_COMUNA']},
    '{row['NOMBRE_COMUNA']}',
    {f"'{row['DIRECCION'].replace("'", "''")}'" if pd.notna(row['DIRECCION']) else 'NULL'},
    {f"'{row['TELEFONO']}'" if pd.notna(row['TELEFONO']) else 'NULL'},
    {f"'{row['EMAIL']}'" if pd.notna(row['EMAIL']) else 'NULL'},
    {f"'{row['SITIO_WEB']}'" if pd.notna(row['SITIO_WEB']) else 'NULL'},
    {row['LATITUD'] if pd.notna(row['LATITUD']) else 'NULL'},
    {row['LONGITUD'] if pd.notna(row['LONGITUD']) else 'NULL'},
    true,
    {f"'{row['FECHA_CREACION']}'" if pd.notna(row['FECHA_CREACION']) else 'NULL'}
);"""
        sql_queries.append(sql)
    
    return sql_queries

# Generar archivo SQL
queries = generar_sql_insercion(df_activos)
with open('insertar_colegios_mineduc.sql', 'w', encoding='utf-8') as f:
    f.write('-- =====================================================\n')
    f.write('-- INSERTAR COLEGIOS DESDE MINEDUC\n')
    f.write('-- =====================================================\n\n')
    for query in queries:
        f.write(query + '\n')
```

---

## 📊 Estadísticas Esperadas

### **Distribución por Dependencia:**
- **Municipal**: ~40% (establecimientos públicos)
- **Particular Subvencionado**: ~45% (establecimientos privados con subvención)
- **Particular Pagado**: ~10% (establecimientos privados sin subvención)
- **Otros**: ~5% (CAD, SLE)

### **Distribución por Región:**
- **Región Metropolitana**: ~35% (mayor concentración)
- **Región de Valparaíso**: ~8%
- **Región del Biobío**: ~7%
- **Otras regiones**: ~50% (distribuidas)

### **Total Estimado:**
- **Establecimientos activos**: ~12,000
- **Con enseñanza media**: ~8,000
- **Técnico-profesionales**: ~2,000

---

## 🔍 Validación de Datos

### **Script de Validación:**
```sql
-- Verificar integridad de datos
SELECT 
    'TOTAL COLEGIOS' as metric,
    COUNT(*) as valor
FROM colegios
WHERE activo = true

UNION ALL

SELECT 
    'COLEGIOS CON RBD VÁLIDO' as metric,
    COUNT(*) as valor
FROM colegios
WHERE activo = true 
AND rbd ~ '^[0-9]{6}$'

UNION ALL

SELECT 
    'COLEGIOS CON COORDENADAS' as metric,
    COUNT(*) as valor
FROM colegios
WHERE activo = true 
AND latitud IS NOT NULL 
AND longitud IS NOT NULL

UNION ALL

SELECT 
    'COLEGIOS CON EMAIL' as metric,
    COUNT(*) as valor
FROM colegios
WHERE activo = true 
AND email IS NOT NULL 
AND email != '';

-- Verificar distribución por dependencia
SELECT 
    dependencia,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM colegios
WHERE activo = true
GROUP BY dependencia
ORDER BY total DESC;
```

---

## 🚀 Implementación Recomendada

### **Fase 1: Datos Básicos**
1. Importar establecimientos con enseñanza media
2. Validar RBD y datos básicos
3. Verificar integridad referencial

### **Fase 2: Datos Completos**
1. Agregar coordenadas geográficas
2. Incluir datos de contacto
3. Clasificar por modalidad educativa

### **Fase 3: Mantenimiento**
1. Actualización anual
2. Sincronización con cambios MINEDUC
3. Validación de datos obsoletos

---

## 📝 Notas Importantes

### **Consideraciones Técnicas:**
- **RBD**: Debe ser único y tener 6 dígitos
- **Coordenadas**: Validar que estén dentro de Chile
- **Emails**: Validar formato correcto
- **Teléfonos**: Normalizar formato chileno

### **Consideraciones de Negocio:**
- **Establecimientos cerrados**: Marcar como inactivos, no eliminar
- **Cambios de dependencia**: Mantener historial
- **Fusiones**: Actualizar datos de establecimientos fusionados

### **Consideraciones de Rendimiento:**
- **Índices**: Crear índices en RBD, región, comuna
- **Particionado**: Considerar particionado por región
- **Cache**: Implementar cache para búsquedas frecuentes

---

**Fecha de creación**: Diciembre 2024  
**Versión**: 1.0  
**Autor**: Equipo de Desarrollo UNIACC
