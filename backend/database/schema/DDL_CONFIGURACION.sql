-- =====================================================
-- TABLA DE CONFIGURACIÓN DE TIENDA
-- =====================================================
-- Autor: Sistema MOA
-- Fecha: 2025-11-17
-- Descripción: Tabla para almacenar configuración editable
--              de la tienda (info, contacto, redes sociales)
-- =====================================================

-- Eliminar tabla si existe
DROP TABLE IF EXISTS configuracion_tienda CASCADE;

-- Crear tabla de configuración
CREATE TABLE configuracion_tienda (
    id SERIAL PRIMARY KEY,
    nombre_tienda VARCHAR(100) NOT NULL DEFAULT 'MOA',
    descripcion TEXT NOT NULL DEFAULT 'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.',
    direccion VARCHAR(255) NOT NULL DEFAULT 'Providencia 1234, Santiago, Chile',
    telefono VARCHAR(50) NOT NULL DEFAULT '+56 2 2345 6789',
    email VARCHAR(100) NOT NULL DEFAULT 'hola@moastudio.cl',
    instagram_url VARCHAR(255) DEFAULT 'https://instagram.com/moastudio',
    facebook_url VARCHAR(255) DEFAULT 'https://facebook.com/moastudio',
    twitter_url VARCHAR(255) DEFAULT 'https://twitter.com/moastudio',
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_por INTEGER REFERENCES usuarios (id_usuario),
    CONSTRAINT uq_single_config CHECK (id = 1)
);

-- Crear índice para búsquedas
CREATE INDEX idx_configuracion_actualizado ON configuracion_tienda (actualizado_en DESC);

-- Insertar configuración por defecto
INSERT INTO
    configuracion_tienda (
        id,
        nombre_tienda,
        descripcion,
        direccion,
        telefono,
        email,
        instagram_url,
        facebook_url,
        twitter_url
    )
VALUES (
        1,
        'MOA',
        'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.',
        'Providencia 1234, Santiago, Chile',
        '+56 2 2345 6789',
        'hola@moastudio.cl',
        'https://instagram.com/moastudio',
        'https://facebook.com/moastudio',
        'https://twitter.com/moastudio'
    );

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_configuracion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_configuracion
    BEFORE UPDATE ON configuracion_tienda
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_configuracion_timestamp();

-- Comentarios
COMMENT ON TABLE configuracion_tienda IS 'Configuración editable de la tienda (información, contacto, redes sociales)';

COMMENT ON COLUMN configuracion_tienda.nombre_tienda IS 'Nombre de la tienda';

COMMENT ON COLUMN configuracion_tienda.descripcion IS 'Descripción de la tienda mostrada en footer';

COMMENT ON COLUMN configuracion_tienda.direccion IS 'Dirección física de la tienda';

COMMENT ON COLUMN configuracion_tienda.telefono IS 'Teléfono de contacto';

COMMENT ON COLUMN configuracion_tienda.email IS 'Email de contacto';

COMMENT ON COLUMN configuracion_tienda.instagram_url IS 'URL del perfil de Instagram';

COMMENT ON COLUMN configuracion_tienda.facebook_url IS 'URL del perfil de Facebook';

COMMENT ON COLUMN configuracion_tienda.twitter_url IS 'URL del perfil de Twitter';

COMMENT ON COLUMN configuracion_tienda.actualizado_en IS 'Fecha y hora de última actualización';

COMMENT ON COLUMN configuracion_tienda.actualizado_por IS 'Usuario que realizó la última actualización';