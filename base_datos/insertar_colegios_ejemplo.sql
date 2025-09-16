-- =====================================================
-- INSERTAR COLEGIOS DE EJEMPLO
-- =====================================================
-- Este script inserta algunos colegios de ejemplo para testing
-- En producción, se debería usar el dataset completo del MINEDUC

-- =====================================================
-- COLEGIOS DE SANTIAGO (Región Metropolitana)
-- =====================================================

-- Colegios Municipales
INSERT INTO colegios (rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad, region_id, region_nombre, comuna_id, comuna_nombre, direccion, telefono, email, activo) VALUES
('1', 'Liceo A-1', 'Liceo A-1', 'Municipal', 'Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13101, 'Santiago', 'Av. Libertador Bernardo O''Higgins 3363', '+56 2 2222 2222', 'contacto@liceoa1.cl', true),
('2', 'Instituto Nacional', 'Instituto Nacional', 'Municipal', 'Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13101, 'Santiago', 'Arturo Prat 33', '+56 2 2222 3333', 'contacto@institutonacional.cl', true),
('3', 'Liceo Manuel Barros Borgoño', 'Liceo MBB', 'Municipal', 'Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13101, 'Santiago', 'San Diego 2075', '+56 2 2222 4444', 'contacto@liceombb.cl', true);

-- Colegios Particulares Subvencionados
INSERT INTO colegios (rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad, region_id, region_nombre, comuna_id, comuna_nombre, direccion, telefono, email, activo) VALUES
('1001', 'Colegio San Patricio', 'San Patricio', 'Particular Subvencionado', 'Básica y Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13120, 'Las Condes', 'Av. Las Condes 12345', '+56 2 2222 5555', 'contacto@sanpatricio.cl', true),
('1002', 'Colegio San Ignacio', 'San Ignacio', 'Particular Subvencionado', 'Básica y Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13120, 'Las Condes', 'Av. Las Condes 67890', '+56 2 2222 6666', 'contacto@sanignacio.cl', true),
('1003', 'Colegio Técnico Profesional', 'CTP', 'Particular Subvencionado', 'Media', 'Técnico-Profesional', 13, 'Región Metropolitana', 13101, 'Santiago', 'Av. Vicuña Mackenna 1234', '+56 2 2222 7777', 'contacto@ctp.cl', true);

-- Colegios Particulares Pagados
INSERT INTO colegios (rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad, region_id, region_nombre, comuna_id, comuna_nombre, direccion, telefono, email, activo) VALUES
('2001', 'Colegio San Ignacio El Bosque', 'SI El Bosque', 'Particular Pagado', 'Básica y Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13120, 'Las Condes', 'Av. El Bosque 123', '+56 2 2222 8888', 'contacto@si.cl', true),
('2002', 'Colegio Tabancura', 'Tabancura', 'Particular Pagado', 'Básica y Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13120, 'Las Condes', 'Av. Tabancura 456', '+56 2 2222 9999', 'contacto@tabancura.cl', true),
('2003', 'Colegio Grange School', 'Grange', 'Particular Pagado', 'Básica y Media', 'Humanista-Científico', 13, 'Región Metropolitana', 13120, 'Las Condes', 'Av. Las Condes 789', '+56 2 2222 0000', 'contacto@grange.cl', true);

-- =====================================================
-- COLEGIOS DE REGIONES
-- =====================================================

-- Valparaíso
INSERT INTO colegios (rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad, region_id, region_nombre, comuna_id, comuna_nombre, direccion, telefono, email, activo) VALUES
('3001', 'Liceo Eduardo de la Barra', 'Eduardo de la Barra', 'Municipal', 'Media', 'Humanista-Científico', 5, 'Región de Valparaíso', 5101, 'Valparaíso', 'Av. Brasil 1234', '+56 32 222 1111', 'contacto@eduardobarra.cl', true),
('3002', 'Colegio San Patricio Viña', 'San Patricio Viña', 'Particular Subvencionado', 'Básica y Media', 'Humanista-Científico', 5, 'Región de Valparaíso', 5109, 'Viña del Mar', 'Av. Libertad 5678', '+56 32 222 2222', 'contacto@sanpatricioviña.cl', true);

-- Concepción
INSERT INTO colegios (rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad, region_id, region_nombre, comuna_id, comuna_nombre, direccion, telefono, email, activo) VALUES
('4001', 'Liceo Enrique Molina', 'Enrique Molina', 'Municipal', 'Media', 'Humanista-Científico', 8, 'Región del Biobío', 8101, 'Concepción', 'Av. O''Higgins 1234', '+56 41 222 1111', 'contacto@enriquemolina.cl', true),
('4002', 'Colegio San Agustín', 'San Agustín', 'Particular Subvencionado', 'Básica y Media', 'Humanista-Científico', 8, 'Región del Biobío', 8101, 'Concepción', 'Av. Libertador 5678', '+56 41 222 2222', 'contacto@sanagustin.cl', true);

-- =====================================================
-- COLEGIOS RURALES
-- =====================================================

-- Colegios rurales de diferentes regiones
INSERT INTO colegios (rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad, region_id, region_nombre, comuna_id, comuna_nombre, direccion, telefono, email, activo) VALUES
('5001', 'Escuela Rural El Arrayán', 'El Arrayán', 'Municipal', 'Básica', NULL, 13, 'Región Metropolitana', 13120, 'Las Condes', 'Camino El Arrayán s/n', '+56 2 2222 1111', 'contacto@arrayan.cl', true),
('5002', 'Escuela Rural San José', 'San José', 'Municipal', 'Básica', NULL, 5, 'Región de Valparaíso', 5101, 'Valparaíso', 'Camino San José s/n', '+56 32 222 3333', 'contacto@sanjose.cl', true),
('5003', 'Liceo Rural Los Andes', 'Los Andes', 'Municipal', 'Media', 'Técnico-Profesional', 5, 'Región de Valparaíso', 5101, 'Valparaíso', 'Camino Los Andes s/n', '+56 32 222 4444', 'contacto@losandes.cl', true);

-- =====================================================
-- COLEGIOS TÉCNICO-PROFESIONALES
-- =====================================================

INSERT INTO colegios (rbd, nombre, nombre_corto, dependencia, tipo_educacion, modalidad, region_id, region_nombre, comuna_id, comuna_nombre, direccion, telefono, email, activo) VALUES
('6001', 'Liceo Industrial', 'Industrial', 'Municipal', 'Media', 'Técnico-Profesional', 13, 'Región Metropolitana', 13101, 'Santiago', 'Av. Industrial 1234', '+56 2 2222 5555', 'contacto@industrial.cl', true),
('6002', 'Colegio Técnico San José', 'Técnico San José', 'Particular Subvencionado', 'Media', 'Técnico-Profesional', 13, 'Región Metropolitana', 13101, 'Santiago', 'Av. Técnica 5678', '+56 2 2222 6666', 'contacto@tecnicosanjose.cl', true);

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen por dependencia
SELECT 
    dependencia,
    COUNT(*) as total_colegios,
    COUNT(CASE WHEN activo = true THEN 1 END) as activos,
    COUNT(CASE WHEN tipo_educacion = 'Media' THEN 1 END) as con_media,
    COUNT(CASE WHEN modalidad = 'Técnico-Profesional' THEN 1 END) as tecnicos
FROM colegios 
GROUP BY dependencia
ORDER BY total_colegios DESC;

-- Mostrar resumen por región
SELECT 
    region_nombre,
    COUNT(*) as total_colegios,
    COUNT(CASE WHEN dependencia = 'Municipal' THEN 1 END) as municipales,
    COUNT(CASE WHEN dependencia = 'Particular Subvencionado' THEN 1 END) as subvencionados,
    COUNT(CASE WHEN dependencia = 'Particular Pagado' THEN 1 END) as particulares
FROM colegios 
WHERE activo = true
GROUP BY region_nombre
ORDER BY total_colegios DESC;

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
LIMIT 20;