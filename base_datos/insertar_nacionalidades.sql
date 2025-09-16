-- =====================================================
-- INSERTAR NACIONALIDADES PRINCIPALES
-- =====================================================

-- Limpiar datos existentes (opcional)
-- DELETE FROM nacionalidades;

-- =====================================================
-- SUDAMÉRICA (Prioridad alta - orden_visual 1-20)
-- =====================================================

-- Cono Sur
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('CL', 'Chile', 'Chile', 'América del Sur', 'Cono Sur', true, 1),
('AR', 'Argentina', 'Argentina', 'América del Sur', 'Cono Sur', true, 2),
('UY', 'Uruguay', 'Uruguay', 'América del Sur', 'Cono Sur', true, 3),
('PY', 'Paraguay', 'Paraguay', 'América del Sur', 'Cono Sur', true, 4);

-- Región Andina
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('PE', 'Perú', 'Peru', 'América del Sur', 'Andina', true, 5),
('BO', 'Bolivia', 'Bolivia', 'América del Sur', 'Andina', true, 6),
('EC', 'Ecuador', 'Ecuador', 'América del Sur', 'Andina', true, 7),
('CO', 'Colombia', 'Colombia', 'América del Sur', 'Andina', true, 8),
('VE', 'Venezuela', 'Venezuela', 'América del Sur', 'Andina', true, 9);

-- Región Amazónica
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('BR', 'Brasil', 'Brazil', 'América del Sur', 'Amazónica', true, 10),
('GY', 'Guyana', 'Guyana', 'América del Sur', 'Amazónica', true, 11),
('SR', 'Surinam', 'Suriname', 'América del Sur', 'Amazónica', true, 12),
('GF', 'Guayana Francesa', 'French Guiana', 'América del Sur', 'Amazónica', true, 13);

-- Región del Caribe Sudamericano
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('TT', 'Trinidad y Tobago', 'Trinidad and Tobago', 'América del Sur', 'Caribe', true, 14);

-- =====================================================
-- AMÉRICA DEL NORTE Y CENTROAMÉRICA (orden_visual 21-40)
-- =====================================================

-- América del Norte
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('US', 'Estados Unidos', 'United States', 'América del Norte', 'Norteamérica', true, 21),
('CA', 'Canadá', 'Canada', 'América del Norte', 'Norteamérica', true, 22),
('MX', 'México', 'Mexico', 'América del Norte', 'Norteamérica', true, 23);

-- Centroamérica
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('GT', 'Guatemala', 'Guatemala', 'América Central', 'Centroamérica', true, 24),
('BZ', 'Belice', 'Belize', 'América Central', 'Centroamérica', true, 25),
('SV', 'El Salvador', 'El Salvador', 'América Central', 'Centroamérica', true, 26),
('HN', 'Honduras', 'Honduras', 'América Central', 'Centroamérica', true, 27),
('NI', 'Nicaragua', 'Nicaragua', 'América Central', 'Centroamérica', true, 28),
('CR', 'Costa Rica', 'Costa Rica', 'América Central', 'Centroamérica', true, 29),
('PA', 'Panamá', 'Panama', 'América Central', 'Centroamérica', true, 30);

-- Caribe
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('CU', 'Cuba', 'Cuba', 'América Central', 'Caribe', true, 31),
('JM', 'Jamaica', 'Jamaica', 'América Central', 'Caribe', true, 32),
('HT', 'Haití', 'Haiti', 'América Central', 'Caribe', true, 33),
('DO', 'República Dominicana', 'Dominican Republic', 'América Central', 'Caribe', true, 34),
('PR', 'Puerto Rico', 'Puerto Rico', 'América Central', 'Caribe', true, 35);

-- =====================================================
-- EUROPA (orden_visual 41-60)
-- =====================================================

-- Europa Occidental
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('ES', 'España', 'Spain', 'Europa', 'Occidental', true, 41),
('FR', 'Francia', 'France', 'Europa', 'Occidental', true, 42),
('DE', 'Alemania', 'Germany', 'Europa', 'Occidental', true, 43),
('IT', 'Italia', 'Italy', 'Europa', 'Occidental', true, 44),
('PT', 'Portugal', 'Portugal', 'Europa', 'Occidental', true, 45),
('GB', 'Reino Unido', 'United Kingdom', 'Europa', 'Occidental', true, 46),
('IE', 'Irlanda', 'Ireland', 'Europa', 'Occidental', true, 47),
('NL', 'Países Bajos', 'Netherlands', 'Europa', 'Occidental', true, 48),
('BE', 'Bélgica', 'Belgium', 'Europa', 'Occidental', true, 49),
('CH', 'Suiza', 'Switzerland', 'Europa', 'Occidental', true, 50);

-- Europa del Este
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('RU', 'Rusia', 'Russia', 'Europa', 'Oriental', true, 51),
('PL', 'Polonia', 'Poland', 'Europa', 'Oriental', true, 52),
('CZ', 'República Checa', 'Czech Republic', 'Europa', 'Oriental', true, 53),
('HU', 'Hungría', 'Hungary', 'Europa', 'Oriental', true, 54),
('RO', 'Rumania', 'Romania', 'Europa', 'Oriental', true, 55),
('BG', 'Bulgaria', 'Bulgaria', 'Europa', 'Oriental', true, 56);

-- Europa del Norte
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('SE', 'Suecia', 'Sweden', 'Europa', 'Nórdica', true, 57),
('NO', 'Noruega', 'Norway', 'Europa', 'Nórdica', true, 58),
('DK', 'Dinamarca', 'Denmark', 'Europa', 'Nórdica', true, 59),
('FI', 'Finlandia', 'Finland', 'Europa', 'Nórdica', true, 60);

-- =====================================================
-- ASIA (orden_visual 61-80)
-- =====================================================

-- Asia Oriental
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('CN', 'China', 'China', 'Asia', 'Oriental', true, 61),
('JP', 'Japón', 'Japan', 'Asia', 'Oriental', true, 62),
('KR', 'Corea del Sur', 'South Korea', 'Asia', 'Oriental', true, 63),
('KP', 'Corea del Norte', 'North Korea', 'Asia', 'Oriental', true, 64),
('TW', 'Taiwán', 'Taiwan', 'Asia', 'Oriental', true, 65),
('HK', 'Hong Kong', 'Hong Kong', 'Asia', 'Oriental', true, 66),
('SG', 'Singapur', 'Singapore', 'Asia', 'Oriental', true, 67);

-- Asia del Sur
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('IN', 'India', 'India', 'Asia', 'Meridional', true, 68),
('PK', 'Pakistán', 'Pakistan', 'Asia', 'Meridional', true, 69),
('BD', 'Bangladesh', 'Bangladesh', 'Asia', 'Meridional', true, 70),
('LK', 'Sri Lanka', 'Sri Lanka', 'Asia', 'Meridional', true, 71),
('NP', 'Nepal', 'Nepal', 'Asia', 'Meridional', true, 72),
('BT', 'Bután', 'Bhutan', 'Asia', 'Meridional', true, 73),
('MV', 'Maldivas', 'Maldives', 'Asia', 'Meridional', true, 74);

-- Asia del Sudeste
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('TH', 'Tailandia', 'Thailand', 'Asia', 'Sudeste', true, 75),
('VN', 'Vietnam', 'Vietnam', 'Asia', 'Sudeste', true, 76),
('MY', 'Malasia', 'Malaysia', 'Asia', 'Sudeste', true, 77),
('ID', 'Indonesia', 'Indonesia', 'Asia', 'Sudeste', true, 78),
('PH', 'Filipinas', 'Philippines', 'Asia', 'Sudeste', true, 79),
('MM', 'Myanmar', 'Myanmar', 'Asia', 'Sudeste', true, 80);

-- =====================================================
-- ÁFRICA (orden_visual 81-100)
-- =====================================================

-- África del Norte
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('EG', 'Egipto', 'Egypt', 'África', 'Norte', true, 81),
('LY', 'Libia', 'Libya', 'África', 'Norte', true, 82),
('TN', 'Túnez', 'Tunisia', 'África', 'Norte', true, 83),
('DZ', 'Argelia', 'Algeria', 'África', 'Norte', true, 84),
('MA', 'Marruecos', 'Morocco', 'África', 'Norte', true, 85),
('SD', 'Sudán', 'Sudan', 'África', 'Norte', true, 86);

-- África Subsahariana
INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('NG', 'Nigeria', 'Nigeria', 'África', 'Subsahariana', true, 87),
('ZA', 'Sudáfrica', 'South Africa', 'África', 'Subsahariana', true, 88),
('KE', 'Kenia', 'Kenya', 'África', 'Subsahariana', true, 89),
('ET', 'Etiopía', 'Ethiopia', 'África', 'Subsahariana', true, 90),
('GH', 'Ghana', 'Ghana', 'África', 'Subsahariana', true, 91),
('UG', 'Uganda', 'Uganda', 'África', 'Subsahariana', true, 92),
('TZ', 'Tanzania', 'Tanzania', 'África', 'Subsahariana', true, 93);

-- =====================================================
-- OCEANÍA (orden_visual 101-110)
-- =====================================================

INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('AU', 'Australia', 'Australia', 'Oceanía', 'Pacífico', true, 101),
('NZ', 'Nueva Zelanda', 'New Zealand', 'Oceanía', 'Pacífico', true, 102),
('FJ', 'Fiyi', 'Fiji', 'Oceanía', 'Pacífico', true, 103),
('PG', 'Papúa Nueva Guinea', 'Papua New Guinea', 'Oceanía', 'Pacífico', true, 104),
('SB', 'Islas Salomón', 'Solomon Islands', 'Oceanía', 'Pacífico', true, 105);

-- =====================================================
-- OTRAS NACIONALIDADES IMPORTANTES (orden_visual 111-120)
-- =====================================================

INSERT INTO nacionalidades (codigo_iso, nombre_espanol, nombre_ingles, continente, region, activa, orden_visual) VALUES
('IL', 'Israel', 'Israel', 'Asia', 'Oriente Medio', true, 111),
('SA', 'Arabia Saudí', 'Saudi Arabia', 'Asia', 'Oriente Medio', true, 112),
('AE', 'Emiratos Árabes Unidos', 'United Arab Emirates', 'Asia', 'Oriente Medio', true, 113),
('TR', 'Turquía', 'Turkey', 'Asia', 'Oriente Medio', true, 114),
('IR', 'Irán', 'Iran', 'Asia', 'Oriente Medio', true, 115);

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar resumen por continente
SELECT 
    continente,
    region,
    COUNT(*) as total_nacionalidades,
    STRING_AGG(nombre_espanol, ', ' ORDER BY orden_visual) as paises
FROM nacionalidades 
WHERE activa = true
GROUP BY continente, region
ORDER BY continente, region;

-- Mostrar las primeras 20 nacionalidades (Sudamérica)
SELECT 
    orden_visual,
    codigo_iso,
    nombre_espanol,
    continente,
    region
FROM nacionalidades 
WHERE activa = true
ORDER BY orden_visual
LIMIT 20;
