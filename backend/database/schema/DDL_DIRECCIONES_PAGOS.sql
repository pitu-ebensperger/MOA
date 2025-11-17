
-- INSTRUCCIONES:
-- 1. Asegúrate de que DDL.sql ya fue ejecutado
-- 2. Ejecuta este archivo con: psql -d moa -f DDL_DIRECCIONES_PAGOS.sql
-- ============================================================================

\c moa;

-- TABLA DIRECCIONES
-- (usuario puede tener múltiples direcciones, pero solo una predeterminada)
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

-- Índices para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario 
    ON direcciones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada 
    ON direcciones(usuario_id, es_predeterminada) 
    WHERE es_predeterminada = TRUE;

-- Comentarios para documentación
COMMENT ON TABLE direcciones IS 'Direcciones de envío de los usuarios';
COMMENT ON COLUMN direcciones.etiqueta IS 'Nombre descriptivo dado por el usuario (ej: Casa, Oficina)';
COMMENT ON COLUMN direcciones.es_predeterminada IS 'Solo una dirección por usuario puede ser predeterminada';
COMMENT ON COLUMN direcciones.instrucciones_entrega IS 'Notas especiales para el repartidor';

-- TABLA METODOS DE PAGOS
CREATE TABLE IF NOT EXISTS metodos_pago (
    metodo_pago_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    
    -- Tipo de método de pago
    tipo TEXT NOT NULL CHECK (tipo IN ('tarjeta', 'transferencia', 'webpay', 'efectivo', 'otro')),
    
    -- Para tarjetas de crédito/débito
    ultimos_digitos TEXT, -- Solo los últimos 4 dígitos (ej: "4242")
    marca TEXT, -- "Visa", "Mastercard", "Amex", "Redcompra"
    nombre_titular TEXT,
    mes_expiracion INT CHECK (mes_expiracion BETWEEN 1 AND 12),
    anio_expiracion INT CHECK (anio_expiracion >= EXTRACT(YEAR FROM CURRENT_DATE)),
    
    -- Para transferencias bancarias
    banco TEXT, -- "Banco de Chile", "Santander", etc.
    tipo_cuenta TEXT, -- "Corriente", "Vista", "RUT"
    
    -- Token de pasarela de pago externa (Transbank, Flow, Stripe, etc.)
    -- Este es el identificador seguro que se usa para procesar pagos
    token_externo TEXT,
    proveedor_pago TEXT, -- "transbank", "flow", "stripe", etc.
    
    -- Metadata adicional (JSON para flexibilidad)
    metadata JSONB,
    
    -- Estado
    es_predeterminado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Auditoría
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_metodos_pago_usuario 
    ON metodos_pago(usuario_id);

CREATE INDEX IF NOT EXISTS idx_metodos_pago_predeterminado 
    ON metodos_pago(usuario_id, es_predeterminado) 
    WHERE es_predeterminado = TRUE AND activo = TRUE;

CREATE INDEX IF NOT EXISTS idx_metodos_pago_token 
    ON metodos_pago(token_externo) 
    WHERE token_externo IS NOT NULL;

-- Comentarios para documentación
COMMENT ON TABLE metodos_pago IS 'Métodos de pago tokenizados de los usuarios';
COMMENT ON COLUMN metodos_pago.ultimos_digitos IS 'SOLO los últimos 4 dígitos de la tarjeta (nunca el número completo)';
COMMENT ON COLUMN metodos_pago.token_externo IS 'Token seguro de la pasarela de pago para procesar transacciones';
COMMENT ON COLUMN metodos_pago.activo IS 'Permite desactivar métodos sin eliminarlos (ej: tarjeta expirada)';

-- ============================================================================
-- EXTENSIÓN DE TABLA: ordenes
-- ============================================================================
-- Agregar campos necesarios para vincular direcciones y métodos de pago
ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS direccion_id BIGINT REFERENCES direcciones(direccion_id),
    ADD COLUMN IF NOT EXISTS metodo_pago_id BIGINT REFERENCES metodos_pago(metodo_pago_id);

-- Estados de pago y envío
ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS estado_pago TEXT DEFAULT 'pendiente' 
        CHECK (estado_pago IN ('pendiente', 'procesando', 'pagado', 'fallido', 'reembolsado', 'cancelado')),
    ADD COLUMN IF NOT EXISTS estado_envio TEXT DEFAULT 'preparacion' 
        CHECK (estado_envio IN ('preparacion', 'empaquetado', 'enviado', 'en_transito', 'entregado', 'devuelto'));

-- Información adicional
ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS notas_cliente TEXT,
    ADD COLUMN IF NOT EXISTS notas_internas TEXT,
    ADD COLUMN IF NOT EXISTS subtotal_cents INT,
    ADD COLUMN IF NOT EXISTS envio_cents INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS descuento_cents INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS impuestos_cents INT DEFAULT 0;

-- Información de pago procesado
ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS transaccion_id TEXT, -- ID de transacción de la pasarela
    ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metodo_pago_usado TEXT; -- Descripción legible del método usado

-- Información de envío y método de despacho
ALTER TABLE ordenes 
    ADD COLUMN IF NOT EXISTS metodo_despacho TEXT DEFAULT 'standard' 
        CHECK (metodo_despacho IN ('standard', 'express', 'retiro')),
    ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS fecha_entrega_estimada TIMESTAMPTZ, -- Calculada automáticamente
    ADD COLUMN IF NOT EXISTS fecha_entrega_real TIMESTAMPTZ, -- Cuando realmente se entregó
    ADD COLUMN IF NOT EXISTS numero_seguimiento TEXT, 
    ADD COLUMN IF NOT EXISTS empresa_envio TEXT; -- "Starken", "Chilexpress", etc.

-- Comentarios
COMMENT ON COLUMN ordenes.estado_pago IS 'Estado del pago: pendiente, procesando, pagado, fallido, reembolsado, cancelado';
COMMENT ON COLUMN ordenes.estado_envio IS 'Estado del envío: preparacion, empaquetado, enviado, en_transito, entregado, devuelto';
COMMENT ON COLUMN ordenes.metodo_despacho IS 'Método elegido: standard (3-5 días), express (1-2 días), retiro (showroom)';
COMMENT ON COLUMN ordenes.fecha_entrega_estimada IS 'Fecha calculada automáticamente según método de despacho';
COMMENT ON COLUMN ordenes.transaccion_id IS 'ID de transacción de la pasarela de pago';
COMMENT ON COLUMN ordenes.numero_seguimiento IS 'Número de seguimiento del courier (opcional, para uso futuro)';

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar timestamp de actualizado_en
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular fecha estimada de entrega
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
    -- Determinar días según método
    dias_agregar := CASE metodo
        WHEN 'express' THEN 2
        WHEN 'retiro' THEN 1
        ELSE 5  -- standard
    END;
    
    fecha_resultado := fecha_orden;
    
    -- Agregar días hábiles (excluyendo fines de semana)
    WHILE dias_contados < dias_agregar LOOP
        fecha_resultado := fecha_resultado + INTERVAL '1 day';
        
        -- Si no es sábado (6) ni domingo (0), contar como día hábil
        IF EXTRACT(DOW FROM fecha_resultado) NOT IN (0, 6) THEN
            dias_contados := dias_contados + 1;
        END IF;
    END LOOP;
    
    RETURN fecha_resultado;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automáticamente fecha estimada al crear orden
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

-- Trigger para direcciones
DROP TRIGGER IF EXISTS trigger_actualizar_direcciones ON direcciones;
CREATE TRIGGER trigger_actualizar_direcciones
    BEFORE UPDATE ON direcciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Trigger para métodos de pago
DROP TRIGGER IF EXISTS trigger_actualizar_metodos_pago ON metodos_pago;
CREATE TRIGGER trigger_actualizar_metodos_pago
    BEFORE UPDATE ON metodos_pago
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Función para asegurar solo una dirección predeterminada por usuario
CREATE OR REPLACE FUNCTION validar_direccion_predeterminada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_predeterminada = TRUE THEN
        -- Quitar flag de otras direcciones del mismo usuario
        UPDATE direcciones 
        SET es_predeterminada = FALSE 
        WHERE usuario_id = NEW.usuario_id 
        AND direccion_id != NEW.direccion_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para direcciones predeterminadas
DROP TRIGGER IF EXISTS trigger_validar_direccion_predeterminada ON direcciones;
CREATE TRIGGER trigger_validar_direccion_predeterminada
    BEFORE INSERT OR UPDATE ON direcciones
    FOR EACH ROW
    WHEN (NEW.es_predeterminada = TRUE)
    EXECUTE FUNCTION validar_direccion_predeterminada();

-- Función para asegurar solo un método de pago predeterminado por usuario
CREATE OR REPLACE FUNCTION validar_metodo_pago_predeterminado()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_predeterminado = TRUE AND NEW.activo = TRUE THEN
        -- Quitar flag de otros métodos del mismo usuario
        UPDATE metodos_pago 
        SET es_predeterminado = FALSE 
        WHERE usuario_id = NEW.usuario_id 
        AND metodo_pago_id != NEW.metodo_pago_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para métodos de pago predeterminados
DROP TRIGGER IF EXISTS trigger_validar_metodo_pago_predeterminado ON metodos_pago;
CREATE TRIGGER trigger_validar_metodo_pago_predeterminado
    BEFORE INSERT OR UPDATE ON metodos_pago
    FOR EACH ROW
    WHEN (NEW.es_predeterminado = TRUE AND NEW.activo = TRUE)
    EXECUTE FUNCTION validar_metodo_pago_predeterminado();

-- ============================================================================
-- DATOS DE EJEMPLO (DESARROLLO)
-- ============================================================================
-- Comentar o eliminar en producción

-- Insertar direcciones de ejemplo para el usuario con usuario_id = 1
INSERT INTO direcciones (usuario_id, etiqueta, calle, numero, depto_oficina, comuna, ciudad, region, codigo_postal, telefono_contacto, instrucciones_entrega, es_predeterminada)
VALUES 
    (1, 'Casa', 'Av. Providencia', '1234', NULL, 'Providencia', 'Santiago', 'RM', '7500000', '+56 9 1234 5678', 'Tocar timbre del primer piso', TRUE),
    (1, 'Oficina', 'Av. Apoquindo', '5678', 'Piso 12, Of. 1201', 'Las Condes', 'Santiago', 'RM', '7550000', '+56 9 8765 4321', 'Dejar con recepción', FALSE)
ON CONFLICT DO NOTHING;

-- Insertar método de pago de ejemplo para el usuario con usuario_id = 1
INSERT INTO metodos_pago (usuario_id, tipo, ultimos_digitos, marca, nombre_titular, mes_expiracion, anio_expiracion, token_externo, proveedor_pago, es_predeterminado, activo)
VALUES 
    (1, 'tarjeta', '4242', 'Visa', 'Juan Pérez', 12, 2026, 'tok_visa_example_123', 'transbank', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Consultas para verificar que todo se creó correctamente

-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('direcciones', 'metodos_pago');

-- Ver columnas de direcciones
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'direcciones'
ORDER BY ordinal_position;

-- Ver columnas de metodos_pago
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'metodos_pago'
ORDER BY ordinal_position;

-- Ver triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('direcciones', 'metodos_pago');

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

COMMIT;
