-- Active: 1763403221678@@127.0.0.1@5432@moa
CREATE DATABASE moa;

\c moa;

CREATE TABLE usuarios (
    usuario_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    password_hash TEXT NOT NULL,
    rol TEXT DEFAULT 'user',
    rol_code TEXT DEFAULT 'USER',
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categorias (
    categoria_id SMALLSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    cover_image TEXT
);

CREATE TABLE productos (
    producto_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    categoria_id INT REFERENCES categorias (categoria_id),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    precio_cents INT NOT NULL,
    compare_at_price_cents INT,
    stock INT DEFAULT 0,
    status TEXT DEFAULT 'activo',
    descripcion TEXT,
    descripcion_corta TEXT,
    img_url TEXT,
    gallery TEXT [],
    badge TEXT [],
    tags TEXT [],
    color TEXT,
    material TEXT,
    dimensions JSONB,
    weight JSONB,
    specs JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE carritos (
    carrito_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id) UNIQUE,
    status TEXT NOT NULL DEFAULT 'ABIERTO',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE carrito_items (
    carrito_item_id BIGSERIAL PRIMARY KEY,
    carrito_id BIGINT REFERENCES carritos (carrito_id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unit INT NOT NULL,
    UNIQUE (carrito_id, producto_id)
);

CREATE TABLE wishlists (
    wishlist_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id)
);

CREATE TABLE wishlist_items (
    wishlist_item_id BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT NOT NULL REFERENCES wishlists (wishlist_id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos (producto_id) ON DELETE CASCADE,
    UNIQUE (wishlist_id, producto_id)
);

CREATE TABLE ordenes (
    orden_id BIGSERIAL PRIMARY KEY,
    order_code TEXT UNIQUE NOT NULL, -- MOA-YYYYMMDD-XXXX
    usuario_id BIGINT REFERENCES usuarios (usuario_id),
    total_cents INT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orden_items (
    orden_item_id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT REFERENCES ordenes (orden_id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unit INT NOT NULL
);

-- =============================================================
--  Direcciones de usuario (envío/facturación)
-- =============================================================

CREATE TABLE IF NOT EXISTS direcciones (
        direccion_id BIGSERIAL PRIMARY KEY,
        usuario_id   BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
        etiqueta     TEXT,                                 -- Ej: "Casa", "Oficina"
        calle        TEXT NOT NULL,
        numero       TEXT,
        depto_oficina TEXT,
        comuna       TEXT,
        ciudad       TEXT,
        region       TEXT,
        codigo_postal TEXT,
        pais         TEXT DEFAULT 'Chile',
        telefono_contacto TEXT,
        instrucciones_entrega TEXT,
        es_predeterminada BOOLEAN DEFAULT FALSE,
        creado_en    TIMESTAMPTZ DEFAULT now(),
        actualizado_en TIMESTAMPTZ DEFAULT now(),
        UNIQUE (usuario_id, etiqueta, calle)
);

-- Mantener una sola dirección predeterminada por usuario
CREATE OR REPLACE FUNCTION fn_direcciones_enforce_default()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_predeterminada IS TRUE THEN
        UPDATE direcciones
             SET es_predeterminada = FALSE,
                     actualizado_en = now()
         WHERE usuario_id = NEW.usuario_id
             AND direccion_id <> COALESCE(NEW.direccion_id, -1);
    END IF;

    NEW.actualizado_en := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_direcciones_before_ins_upd ON direcciones;
CREATE TRIGGER trg_direcciones_before_ins_upd
BEFORE INSERT OR UPDATE ON direcciones
FOR EACH ROW EXECUTE FUNCTION fn_direcciones_enforce_default();

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario ON direcciones (usuario_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada ON direcciones (usuario_id, es_predeterminada DESC);

-- =============================================================
--  Métodos de pago (compatibles con modelos y seed actuales)
-- =============================================================

CREATE TABLE IF NOT EXISTS metodos_pago (
        metodo_pago_id   BIGSERIAL PRIMARY KEY,
        usuario_id       BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,

        -- Esquema actual (utilizado por modelos/backend)
        tipo_metodo      TEXT,                    -- credito | debito | webpay | etc.
        ultimos_digitos  TEXT,
        nombre_titular   TEXT,
        fecha_expiracion DATE,                    -- si se provee fecha completa
        token_pago       TEXT UNIQUE,             -- token interno/externo
        predeterminado   BOOLEAN DEFAULT FALSE,

        marca            TEXT,
        proveedor_pago   TEXT,                    -- Transbank, Stripe, etc.
        metadata         JSONB,

        -- Campos de compatibilidad con seeds existentes
        tipo             TEXT,                    -- alias de tipo_metodo
        mes_expiracion   SMALLINT,                -- 1..12
        anio_expiracion  SMALLINT,                -- YYYY
        token_externo    TEXT UNIQUE,             -- alias de token_pago
        es_predeterminado BOOLEAN DEFAULT FALSE,  -- alias de predeterminado
        activo           BOOLEAN DEFAULT TRUE,

        creado_en        TIMESTAMPTZ DEFAULT now(),
        actualizado_en   TIMESTAMPTZ DEFAULT now()
);

-- Función para sincronizar alias y mantener consistencia
CREATE OR REPLACE FUNCTION fn_metodos_pago_sync_alias()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar tipo <-> tipo_metodo
    IF NEW.tipo_metodo IS NULL AND NEW.tipo IS NOT NULL THEN
        NEW.tipo_metodo := NEW.tipo;
    ELSIF NEW.tipo IS NULL AND NEW.tipo_metodo IS NOT NULL THEN
        NEW.tipo := NEW.tipo_metodo;
    END IF;

    -- Sincronizar token_pago <-> token_externo
    IF NEW.token_pago IS NULL AND NEW.token_externo IS NOT NULL THEN
        NEW.token_pago := NEW.token_externo;
    ELSIF NEW.token_externo IS NULL AND NEW.token_pago IS NOT NULL THEN
        NEW.token_externo := NEW.token_pago;
    END IF;

    -- Construir fecha_expiracion desde mes/anio si no viene
    IF NEW.fecha_expiracion IS NULL AND NEW.mes_expiracion IS NOT NULL AND NEW.anio_expiracion IS NOT NULL THEN
        NEW.fecha_expiracion := make_date(NEW.anio_expiracion, GREATEST(1, LEAST(12, NEW.mes_expiracion)), 1);
    END IF;

    -- Propagar desde fecha_expiracion a mes/anio si faltan
    IF NEW.fecha_expiracion IS NOT NULL THEN
        IF NEW.mes_expiracion IS NULL THEN
            NEW.mes_expiracion := EXTRACT(MONTH FROM NEW.fecha_expiracion)::SMALLINT;
        END IF;
        IF NEW.anio_expiracion IS NULL THEN
            NEW.anio_expiracion := EXTRACT(YEAR FROM NEW.fecha_expiracion)::SMALLINT;
        END IF;
    END IF;

    -- Sincronizar predeterminado <-> es_predeterminado
    IF NEW.predeterminado IS NULL AND NEW.es_predeterminado IS NOT NULL THEN
        NEW.predeterminado := NEW.es_predeterminado;
    ELSIF NEW.es_predeterminado IS NULL AND NEW.predeterminado IS NOT NULL THEN
        NEW.es_predeterminado := NEW.predeterminado;
    END IF;

    NEW.actualizado_en := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_metodos_pago_sync_before_ins_upd ON metodos_pago;
CREATE TRIGGER trg_metodos_pago_sync_before_ins_upd
BEFORE INSERT OR UPDATE ON metodos_pago
FOR EACH ROW EXECUTE FUNCTION fn_metodos_pago_sync_alias();

-- Mantener un solo método predeterminado por usuario
CREATE OR REPLACE FUNCTION fn_metodos_pago_enforce_default()
RETURNS TRIGGER AS $$
BEGIN
    IF COALESCE(NEW.predeterminado, NEW.es_predeterminado) IS TRUE THEN
        UPDATE metodos_pago
             SET predeterminado = FALSE,
                     es_predeterminado = FALSE,
                     actualizado_en = now()
         WHERE usuario_id = NEW.usuario_id
             AND metodo_pago_id <> COALESCE(NEW.metodo_pago_id, -1);
        NEW.predeterminado := TRUE;
        NEW.es_predeterminado := TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_metodos_pago_default_before_ins_upd ON metodos_pago;
CREATE TRIGGER trg_metodos_pago_default_before_ins_upd
BEFORE INSERT OR UPDATE ON metodos_pago
FOR EACH ROW EXECUTE FUNCTION fn_metodos_pago_enforce_default();

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_metodos_pago_usuario ON metodos_pago (usuario_id);
CREATE INDEX IF NOT EXISTS idx_metodos_pago_predeterminado ON metodos_pago (usuario_id, predeterminado DESC);
