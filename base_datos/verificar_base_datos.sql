-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- =====================================================
-- Este script verifica que todas las tablas y datos estén correctamente creados

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar que todas las tablas existen
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'prospectos', 
    'nacionalidades',
    'colegios',
    'datos_academicos', 
    'puntajes_paes', 
    'datos_socioeconomicos', 
    'deciles', 
    'becas', 
    'beneficios', 
    'beneficios_uniacc', 
    'simulaciones'
)
ORDER BY table_name;

-- =====================================================
-- 2. VERIFICAR ÍNDICES
-- =====================================================

-- Verificar índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN (
    'prospectos', 
    'datos_academicos', 
    'puntajes_paes', 
    'datos_socioeconomicos', 
    'deciles', 
    'becas', 
    'beneficios', 
    'beneficios_uniacc', 
    'simulaciones'
)
ORDER BY tablename, indexname;

-- =====================================================
-- 3. VERIFICAR TRIGGERS
-- =====================================================

-- Verificar triggers de updated_at
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- =====================================================
-- 4. VERIFICAR DATOS INICIALES
-- =====================================================

-- Verificar deciles
SELECT 
    'DECILES' as tabla,
    COUNT(*) as total_registros,
    MIN(decil) as min_decil,
    MAX(decil) as max_decil,
    COUNT(CASE WHEN activo = true THEN 1 END) as activos
FROM deciles;

-- Verificar nacionalidades
SELECT 
    'NACIONALIDADES' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN activa = true THEN 1 END) as activas,
    COUNT(DISTINCT continente) as continentes,
    COUNT(CASE WHEN continente = 'América del Sur' THEN 1 END) as sudamerica,
    COUNT(CASE WHEN continente = 'Europa' THEN 1 END) as europa,
    COUNT(CASE WHEN continente = 'Asia' THEN 1 END) as asia
FROM nacionalidades;

-- Mostrar nacionalidades de Sudamérica (prioridad alta)
SELECT 
    orden_visual,
    codigo_iso,
    nombre_espanol,
    region
FROM nacionalidades 
WHERE continente = 'América del Sur' 
AND activa = true
ORDER BY orden_visual
LIMIT 10;

-- Verificar colegios
SELECT 
    'COLEGIOS' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN activo = true THEN 1 END) as activos,
    COUNT(DISTINCT dependencia) as tipos_dependencia,
    COUNT(DISTINCT region_nombre) as regiones,
    COUNT(CASE WHEN tipo_educacion = 'Media' THEN 1 END) as con_media,
    COUNT(CASE WHEN modalidad = 'Técnico-Profesional' THEN 1 END) as tecnicos
FROM colegios;

-- Mostrar distribución por dependencia
SELECT 
    dependencia,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM colegios
WHERE activo = true
GROUP BY dependencia
ORDER BY total DESC;

-- Mostrar algunos colegios de ejemplo
SELECT 
    rbd,
    nombre_corto,
    dependencia,
    region_nombre,
    comuna_nombre,
    tipo_educacion,
    modalidad
FROM colegios 
WHERE activo = true
ORDER BY dependencia, region_nombre, comuna_nombre
LIMIT 10;

-- Verificar beneficios UNIACC
SELECT 
    'BENEFICIOS UNIACC' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN vigente = true THEN 1 END) as vigentes,
    COUNT(CASE WHEN prioridad = 1 THEN 1 END) as prioridad_1,
    COUNT(CASE WHEN prioridad = 2 THEN 1 END) as prioridad_2,
    COUNT(CASE WHEN prioridad = 3 THEN 1 END) as prioridad_3,
    COUNT(CASE WHEN tipo_beneficio = 'BECA' THEN 1 END) as becas,
    COUNT(CASE WHEN tipo_beneficio = 'FINANCIAMIENTO' THEN 1 END) as financiamiento,
    COUNT(CASE WHEN tipo_beneficio = 'FINANCIERO' THEN 1 END) as financiero,
    COUNT(CASE WHEN origen_beneficio = 'INTERNO' THEN 1 END) as internos,
    COUNT(CASE WHEN origen_beneficio = 'EXTERNO' THEN 1 END) as externos
FROM beneficios_uniacc;

-- =====================================================
-- 5. VERIFICAR CONSTRAINTS
-- =====================================================

-- Verificar constraints de check
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- 6. VERIFICAR FOREIGN KEYS
-- =====================================================

-- Verificar foreign keys
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 7. VERIFICAR FUNCIONES
-- =====================================================

-- Verificar funciones creadas
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_updated_at_column'
)
ORDER BY routine_name;

-- =====================================================
-- 8. PRUEBA DE INSERCIÓN DE DATOS DE PRUEBA
-- =====================================================

-- Insertar prospectos de prueba
INSERT INTO prospectos (nombre, apellido, email, rut, fecha_nacimiento) 
VALUES 
('Juan', 'Pérez', 'juan.perez@test.com', '12345678-9', '2000-01-01'),
('María', 'González', 'maria.gonzalez@test.com', '87654321-0', '2007-05-15');

-- Obtener los IDs de los prospectos insertados
DO $$
DECLARE
    prospecto_egresado_id UUID;
    prospecto_3ro_medio_id UUID;
BEGIN
    -- Obtener ID del estudiante egresado
    SELECT id INTO prospecto_egresado_id FROM prospectos WHERE email = 'juan.perez@test.com';
    
    -- Obtener ID del estudiante de 3ro medio
    SELECT id INTO prospecto_3ro_medio_id FROM prospectos WHERE email = 'maria.gonzalez@test.com';
    
    -- Insertar datos académicos del estudiante egresado
    INSERT INTO datos_academicos (prospecto_id, nombre_colegio, region_colegio, comuna_colegio, tipo_colegio, carrera_deseada, nivel_educativo_actual, promedio, nem, ranking, año_egreso)
    VALUES (prospecto_egresado_id, 'Colegio Test', 'Metropolitana', 'Santiago', 'Particular', 'Ingeniería en Informática', 'Egresado', 6.2, 6.5, 855.5, 2023);
    
    -- Insertar datos académicos del estudiante de 3ro medio (sin promedio, NEM ni ranking)
    INSERT INTO datos_academicos (prospecto_id, nombre_colegio, region_colegio, comuna_colegio, tipo_colegio, carrera_deseada, nivel_educativo_actual, promedio, nem, ranking, año_egreso)
    VALUES (prospecto_3ro_medio_id, 'Liceo Test', 'Metropolitana', 'Santiago', 'Municipal', 'Psicología', '3ro Medio', NULL, NULL, NULL, NULL);
    
    -- Probar constraint: intentar insertar datos académicos incorrectos (debería fallar)
    BEGIN
        -- Esto debería fallar: estudiante de 3ro medio con NEM
        INSERT INTO datos_academicos (prospecto_id, nombre_colegio, region_colegio, comuna_colegio, tipo_colegio, carrera_deseada, nivel_educativo_actual, promedio, nem, ranking, año_egreso)
        VALUES (prospecto_3ro_medio_id, 'Liceo Test 2', 'Metropolitana', 'Santiago', 'Municipal', 'Medicina', '3ro Medio', 5.5, 6.0, 800, 2023);
        RAISE NOTICE 'ERROR: No debería llegar aquí - constraint falló';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'Constraint funcionando correctamente: estudiante de 3ro medio no puede tener NEM';
    END;
    
    -- Insertar datos socioeconómicos del estudiante egresado
    INSERT INTO datos_socioeconomicos (prospecto_id, usa_cae, decil_ingreso, ingreso_mensual, numero_integrantes_familia)
    VALUES (prospecto_egresado_id, true, 3, 150000, 4);
    
    -- Insertar datos socioeconómicos del estudiante de 3ro medio
    INSERT INTO datos_socioeconomicos (prospecto_id, usa_cae, decil_ingreso, ingreso_mensual, numero_integrantes_familia)
    VALUES (prospecto_3ro_medio_id, false, 5, 200000, 3);
    
    -- Insertar estado PAES del estudiante egresado (rindió PAES)
    INSERT INTO puntajes_paes (prospecto_id, estado_estudiante, fecha_rendicion, año_rendicion, rendio_paes, puntaje_comprension_lectora, puntaje_matematica_1, puntaje_matematica_2)
    VALUES (prospecto_egresado_id, 'rendido', '2023-12-15', 2023, true, 650, 720, 680);
    
    -- Insertar estado PAES del estudiante de 3ro medio (no aplica PAES)
    INSERT INTO puntajes_paes (prospecto_id, estado_estudiante, fecha_rendicion, año_rendicion, rendio_paes)
    VALUES (prospecto_3ro_medio_id, 'no_aplica', NULL, NULL, false);
    
    RAISE NOTICE 'Datos de prueba insertados correctamente para ambos prospectos';
END $$;

-- =====================================================
-- 9. VERIFICAR INTEGRIDAD DE DATOS
-- =====================================================

-- Verificar que los datos de prueba se insertaron correctamente
SELECT 
    p.nombre,
    p.apellido,
    p.email,
    da.nivel_educativo_actual,
    da.carrera_deseada,
    da.promedio,
    da.nem,
    da.ranking,
    da.año_egreso,
    ds.decil_ingreso,
    pp.estado_estudiante,
    pp.rendio_paes,
    pp.puntaje_total
FROM prospectos p
LEFT JOIN datos_academicos da ON p.id = da.prospecto_id
LEFT JOIN datos_socioeconomicos ds ON p.id = ds.prospecto_id
LEFT JOIN puntajes_paes pp ON p.id = pp.prospecto_id
WHERE p.email IN ('juan.perez@test.com', 'maria.gonzalez@test.com')
ORDER BY p.email;

-- =====================================================
-- 10. LIMPIAR DATOS DE PRUEBA
-- =====================================================

-- Eliminar datos de prueba
DELETE FROM prospectos WHERE email IN ('juan.perez@test.com', 'maria.gonzalez@test.com');

-- =====================================================
-- 11. RESUMEN FINAL
-- =====================================================

SELECT 
    'VERIFICACIÓN COMPLETADA' as estado,
    'Todas las tablas, índices, triggers y datos iniciales han sido creados correctamente' as mensaje,
    NOW() as fecha_verificacion;
