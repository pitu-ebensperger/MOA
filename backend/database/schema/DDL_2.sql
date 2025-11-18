-- Active: 1763403221678@@127.0.0.1@5432@moa
\c moa;

-- TABLA DIRECCIONES
CREATE TABLE IF NOT EXISTS direcciones (
    direccion_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    -- Identificación de la dirección
    etiqueta TEXT, -- "Casa", "Oficina", "Depto Santiago", etc.
    -- Dirección física
    calle TEXT NOT NULL,
    numero TEXT,
    depto_oficina TEXT, -- Número de departamento u oficina
    comuna TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    region TEXT NOT NULL,
    codigo_postal TEXT,
    pais TEXT DEFAULT 'Chile',
    -- Información de contacto y entrega
    telefono_contacto TEXT,
    instrucciones_entrega TEXT, -- "Tocar timbre del segundo piso", "Dejar con conserje", etc.
    -- Estado
    es_predeterminada BOOLEAN DEFAULT FALSE,
    -- Auditoría
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_direcciones_usuario 
    ON direcciones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada 
    ON direcciones(usuario_id, es_predeterminada) 
    WHERE es_predeterminada = TRUE;

COMMENT ON TABLE direcciones IS 'Direcciones de envío de los usuarios';
COMMENT ON COLUMN direcciones.etiqueta IS 'Nombre descriptivo dado por el usuario (ej: Casa, Oficina)';
COMMENT ON COLUMN direcciones.es_predeterminada IS 'Solo una dirección por usuario puede ser predeterminada';
COMMENT ON COLUMN direcciones.instrucciones_entrega IS 'Notas especiales para el repartidor';

-- TABLA METODOS DE PAGO
CREATE TABLE IF NOT EXISTS metodos_pago (
    metodo_pago_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    -- Tipo de método de pago
    tipo TEXT NOT NULL CHECK (tipo IN ('tarjeta', 'transferencia', 'webpay', 'efectivo', 'otro')),
    -- Para tarjetas de crédito/débito
    ultimos_digitos TEXT,
    marca TEXT,
    nombre_titular TEXT,
    mes_expiracion INT CHECK (mes_expiracion BETWEEN 1 AND 12),
    anio_expiracion INT CHECK (anio_expiracion >= EXTRACT(YEAR FROM CURRENT_DATE)),
    -- Para transferencias bancarias
    banco TEXT,
    tipo_cuenta TEXT,
    -- Token de pasarela de pago externa
    token_externo TEXT,
    proveedor_pago TEXT,
    -- Metadata adicional
    metadata JSONB,
    -- Estado
    es_predeterminado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    -- Auditoría
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metodos_pago_usuario 
    ON metodos_pago(usuario_id);

CREATE INDEX IF NOT EXISTS idx_metodos_pago_predeterminado 
    ON metodos_pago(usuario_id, es_predeterminado) 
    WHERE es_predeterminado = TRUE AND activo = TRUE;

CREATE INDEX IF NOT EXISTS idx_metodos_pago_token 
    ON metodos_pago(token_externo) 
    WHERE token_externo IS NOT NULL;

COMMENT ON TABLE metodos_pago IS 'Métodos de pago tokenizados de los usuarios';
COMMENT ON COLUMN metodos_pago.ultimos_digitos IS 'SOLO los últimos 4 dígitos de la tarjeta (nunca el número completo)';
COMMENT ON COLUMN metodos_pago.token_externo IS 'Token seguro de la pasarela de pago para procesar transacciones';
COMMENT ON COLUMN metodos_pago.activo IS 'Permite desactivar métodos sin eliminarlos (ej: tarjeta expirada)';

<<<<<<< HEAD:backend/database/schema/DDL_2.sql
-- EXTENSIÓN TABLA ORDENES
=======
-- TABLA PEDIDOS
>>>>>>> e1167ca338806d8d62dfa2b2d9276167cb6a0d27:backend/database/schema/DDL_DIRECCIONES_PAGOS.sql
ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS direccion_id BIGINT REFERENCES direcciones(direccion_id),
    ADD COLUMN IF NOT EXISTS metodo_pago_id BIGINT REFERENCES metodos_pago(metodo_pago_id);

ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS estado_pago TEXT DEFAULT 'pendiente' 
        CHECK (estado_pago IN ('pendiente', 'procesando', 'pagado', 'fallido', 'reembolsado', 'cancelado')),
    ADD COLUMN IF NOT EXISTS estado_envio TEXT DEFAULT 'preparacion' 
        CHECK (estado_envio IN ('preparacion', 'empaquetado', 'enviado', 'en_transito', 'entregado', 'devuelto'));

ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS notas_cliente TEXT,
    ADD COLUMN IF NOT EXISTS notas_internas TEXT,
    ADD COLUMN IF NOT EXISTS subtotal_cents INT,
    ADD COLUMN IF NOT EXISTS envio_cents INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS descuento_cents INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS impuestos_cents INT DEFAULT 0;

ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS transaccion_id TEXT,
    ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metodo_pago_usado TEXT;

ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS metodo_despacho TEXT DEFAULT 'standard' 
        CHECK (metodo_despacho IN ('standard', 'express', 'retiro')),
    ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS fecha_entrega_estimada TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS fecha_entrega_real TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS numero_seguimiento TEXT,
    ADD COLUMN IF NOT EXISTS empresa_envio TEXT;

COMMENT ON COLUMN ordenes.estado_pago IS 'Estado del pago: pendiente, procesando, pagado, fallido, reembolsado, cancelado';
COMMENT ON COLUMN ordenes.estado_envio IS 'Estado del envío: preparacion, empaquetado, enviado, en_transito, entregado, devuelto';
COMMENT ON COLUMN ordenes.metodo_despacho IS 'Método elegido: standard (3-5 días), express (1-2 días), retiro (showroom)';
COMMENT ON COLUMN ordenes.fecha_entrega_estimada IS 'Fecha calculada automáticamente según método de despacho';
COMMENT ON COLUMN ordenes.transaccion_id IS 'ID de transacción de la pasarela de pago';
COMMENT ON COLUMN ordenes.numero_seguimiento IS 'Número de seguimiento del courier (opcional, para uso futuro)';

-- FUNCIONES Y TRIGGERS
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_direcciones ON direcciones;
CREATE TRIGGER trigger_actualizar_direcciones
    BEFORE UPDATE ON direcciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_actualizar_metodos_pago ON metodos_pago;
CREATE TRIGGER trigger_actualizar_metodos_pago
    BEFORE UPDATE ON metodos_pago
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE OR REPLACE FUNCTION validar_direccion_predeterminada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_predeterminada = TRUE THEN
        UPDATE direcciones 
        SET es_predeterminada = FALSE 
        WHERE usuario_id = NEW.usuario_id 
        AND direccion_id != NEW.direccion_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_direccion_predeterminada ON direcciones;
CREATE TRIGGER trigger_validar_direccion_predeterminada
    BEFORE INSERT OR UPDATE ON direcciones
    FOR EACH ROW
    WHEN (NEW.es_predeterminada = TRUE)
    EXECUTE FUNCTION validar_direccion_predeterminada();

CREATE OR REPLACE FUNCTION validar_metodo_pago_predeterminado()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_predeterminado = TRUE AND NEW.activo = TRUE THEN
        UPDATE metodos_pago 
        SET es_predeterminado = FALSE 
        WHERE usuario_id = NEW.usuario_id 
        AND metodo_pago_id != NEW.metodo_pago_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_metodo_pago_predeterminado ON metodos_pago;
CREATE TRIGGER trigger_validar_metodo_pago_predeterminado
    BEFORE INSERT OR UPDATE ON metodos_pago
    FOR EACH ROW
    WHEN (NEW.es_predeterminado = TRUE AND NEW.activo = TRUE)
    EXECUTE FUNCTION validar_metodo_pago_predeterminado();

CREATE OR REPLACE FUNCTION calcular_fecha_entrega_estimada(
    fecha_orden TIMESTAMPTZ,
    metodo TEXT
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    dias_agregar INT;
    fecha_resultado TIMESTAMPTZ;
    dias_contados INT := 0;
BEGIN
    dias_agregar := CASE metodo
        WHEN 'express' THEN 2
        WHEN 'retiro' THEN 1
        ELSE 5
    END;
    fecha_resultado := fecha_orden;
    WHILE dias_contados < dias_agregar LOOP
        fecha_resultado := fecha_resultado + INTERVAL '1 day';
        IF EXTRACT(DOW FROM fecha_resultado) NOT IN (0, 6) THEN
            dias_contados := dias_contados + 1;
        END IF;
    END LOOP;
    RETURN fecha_resultado;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_calcular_fecha_estimada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_entrega_estimada IS NULL THEN
        NEW.fecha_entrega_estimada := calcular_fecha_entrega_estimada(
            COALESCE(NEW.creado_en, now()),
            COALESCE(NEW.metodo_despacho, 'standard')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orden_fecha_estimada ON ordenes;
CREATE TRIGGER trigger_orden_fecha_estimada
    BEFORE INSERT OR UPDATE ON ordenes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calcular_fecha_estimada();

-- DATOS DE EJEMPLO (DESARROLLO)
INSERT INTO direcciones (usuario_id, etiqueta, calle, numero, depto_oficina, comuna, ciudad, region, codigo_postal, telefono_contacto, instrucciones_entrega, es_predeterminada)
VALUES 
    (1, 'Casa', 'Av. Providencia', '1234', NULL, 'Providencia', 'Santiago', 'RM', '7500000', '+56 9 1234 5678', 'Tocar timbre del primer piso', TRUE),
    (1, 'Oficina', 'Av. Apoquindo', '5678', 'Piso 12, Of. 1201', 'Las Condes', 'Santiago', 'RM', '7550000', '+56 9 8765 4321', 'Dejar con recepción', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO metodos_pago (usuario_id, tipo, ultimos_digitos, marca, nombre_titular, mes_expiracion, anio_expiracion, token_externo, proveedor_pago, es_predeterminado, activo)
VALUES 
    (1, 'tarjeta', '4242', 'Visa', 'Juan Pérez', 12, 2026, 'tok_visa_example_123', 'transbank', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- TABLA CONFIGURACIÓN TIENDA
DROP TABLE IF EXISTS configuracion_tienda CASCADE;

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
    actualizado_por BIGINT REFERENCES usuarios(usuario_id),
    CONSTRAINT uq_single_config CHECK (id = 1)
);

CREATE INDEX idx_configuracion_actualizado ON configuracion_tienda(actualizado_en DESC);

INSERT INTO configuracion_tienda (
    id,
    nombre_tienda,
    descripcion,
    direccion,
    telefono,
    email,
    instagram_url,
    facebook_url,
    twitter_url
) VALUES (
    1,
    'MOA',
    'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.',
    'Providencia 1234, Santiago, Chile',
    '+56 2 2345 6789',
    'hola@moastudio.cl',
    'https://instagram.com/moastudio',
    'https://facebook.com/moastudio',
    'https://twitter.com/moastudio'
)
ON CONFLICT (id) DO UPDATE
    SET nombre_tienda = EXCLUDED.nombre_tienda,
        descripcion = EXCLUDED.descripcion,
        direccion = EXCLUDED.direccion,
        telefono = EXCLUDED.telefono,
        email = EXCLUDED.email,
        instagram_url = EXCLUDED.instagram_url,
        facebook_url = EXCLUDED.facebook_url,
        twitter_url = EXCLUDED.twitter_url,
        actualizado_en = CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION actualizar_configuracion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_configuracion ON configuracion_tienda;
CREATE TRIGGER trigger_actualizar_configuracion
    BEFORE UPDATE ON configuracion_tienda
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_configuracion_timestamp();

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

COMMIT;

-- VERIFICACIÓN
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('direcciones', 'metodos_pago', 'configuracion_tienda');

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'direcciones'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'metodos_pago'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'configuracion_tienda'
ORDER BY ordinal_position;

SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('direcciones', 'metodos_pago', 'ordenes', 'configuracion_tienda');
