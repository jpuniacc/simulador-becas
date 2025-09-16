-- =====================================================
-- VERIFICAR DUPLICADOS EN BENEFICIOS UNIACC
-- =====================================================

-- Mostrar todos los beneficios ordenados por código
SELECT 
    codigo_beneficio,
    descripcion,
    prioridad,
    tipo_beneficio,
    COUNT(*) as ocurrencias
FROM beneficios_uniacc 
WHERE vigente = true
GROUP BY codigo_beneficio, descripcion, prioridad, tipo_beneficio
ORDER BY codigo_beneficio;

-- Buscar duplicados por código
SELECT 
    codigo_beneficio,
    COUNT(*) as duplicados
FROM beneficios_uniacc 
WHERE vigente = true
GROUP BY codigo_beneficio
HAVING COUNT(*) > 1
ORDER BY codigo_beneficio;

-- Mostrar estadísticas finales
SELECT 
    'TOTAL BENEFICIOS' as metric,
    COUNT(*) as valor
FROM beneficios_uniacc 
WHERE vigente = true

UNION ALL

SELECT 
    'BENEFICIOS ÚNICOS' as metric,
    COUNT(DISTINCT codigo_beneficio) as valor
FROM beneficios_uniacc 
WHERE vigente = true

UNION ALL

SELECT 
    'DUPLICADOS' as metric,
    COUNT(*) - COUNT(DISTINCT codigo_beneficio) as valor
FROM beneficios_uniacc 
WHERE vigente = true;
