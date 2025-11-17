-- =====================================================
-- MIGRACIÓN INICIAL - SCHEMA COMPLETO MOA
-- =====================================================
-- Versión: 001
-- Fecha: 2025-11-17
-- Descripción: Schema inicial completo para el sistema MOA
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLAS PRINCIPALES
-- =====================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    password_hash TEXT NOT NULL,
    rol TEXT DEFAULT 'CLIENTE',
    rol_code TEXT DEFAULT 'CLIENTE',
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    categoria_id SMALLSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    cover_image TEXT
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    producto_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
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

-- =====================================================
-- 2. CONFIGURACIÓN DE TIENDA
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracion_tienda (
    id SERIAL PRIMARY KEY,
    -- Información de la tienda
    nombre_tienda VARCHAR(100) NOT NULL DEFAULT 'MOA',
    descripcion TEXT NOT NULL DEFAULT 'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.',
    
    -- Datos de contacto
    direccion VARCHAR(255) NOT NULL DEFAULT 'Providencia 1234, Santiago, Chile',
    telefono VARCHAR(50) NOT NULL DEFAULT '+56 2 2345 6789',
    email VARCHAR(100) NOT NULL DEFAULT 'hola@moastudio.cl',
    
    -- Redes sociales
    instagram_url VARCHAR(255) DEFAULT 'https://instagram.com/moastudio',
    facebook_url VARCHAR(255) DEFAULT 'https://facebook.com/moastudio',
    twitter_url VARCHAR(255) DEFAULT 'https://twitter.com/moastudio',
    
    -- Metadata
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_por BIGINT REFERENCES usuarios(usuario_id),
    
    CONSTRAINT uq_single_config CHECK (id = 1) -- Solo permitir un registro
);

-- =====================================================
-- 3. DIRECCIONES Y MÉTODOS DE PAGO
-- =====================================================

-- Tabla de direcciones
CREATE TABLE IF NOT EXISTS direcciones (
    direccion_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    etiqueta TEXT, -- 'Casa', 'Oficina', etc.
    calle TEXT NOT NULL,
    numero TEXT, -- Separado para facilitar búsquedas
    depto_oficina TEXT, -- Depto, oficina, etc.
    comuna TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    region TEXT NOT NULL,
    codigo_postal TEXT,
    pais TEXT DEFAULT 'Chile',
    telefono_contacto TEXT,
    instrucciones_entrega TEXT,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de métodos de pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    metodo_pago_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'tarjeta_credito', 'tarjeta_debito', 'transferencia'
    ultimos_digitos TEXT,
    marca TEXT, -- 'Visa', 'MasterCard', 'Banco Estado', etc.
    nombre_titular TEXT,
    mes_expiracion INTEGER,
    anio_expiracion INTEGER,
    banco TEXT,
    tipo_cuenta TEXT, -- Para transferencias
    token_externo TEXT, -- Token del proveedor de pagos
    proveedor_pago TEXT, -- 'webpay', 'mercadopago', etc.
    metadata JSONB, -- Datos adicionales específicos del proveedor
    es_predeterminado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CARRITO Y WISHLIST
-- =====================================================

-- Tabla de carritos
CREATE TABLE IF NOT EXISTS carritos (
    carrito_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id),
    session_id TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS carrito_items (
    carrito_id BIGINT REFERENCES carritos (carrito_id),
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT DEFAULT 1,
    PRIMARY KEY (carrito_id, producto_id)
);

-- Tabla de wishlist
CREATE TABLE IF NOT EXISTS wishlists (
    wishlist_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id),
    nombre TEXT DEFAULT 'Mi Lista de Deseos',
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de items de wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
    wishlist_id BIGINT REFERENCES wishlists (wishlist_id),
    producto_id BIGINT REFERENCES productos (producto_id),
    agregado_en TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (wishlist_id, producto_id)
);

-- =====================================================
-- 5. ÓRDENES Y VENTAS
-- =====================================================

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS ordenes (
    orden_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id),
    total_cents INT NOT NULL,
    estado_pago TEXT DEFAULT 'pendiente',
    estado_envio TEXT DEFAULT 'preparando',
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de items de orden
CREATE TABLE IF NOT EXISTS orden_items (
    orden_id BIGINT REFERENCES ordenes (orden_id),
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT DEFAULT 1,
    precio_unitario_cents INT NOT NULL,
    PRIMARY KEY (orden_id, producto_id)
);

-- =====================================================
-- 6. ÍNDICES
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_public_id ON usuarios(public_id);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_slug ON productos(slug);
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_productos_status ON productos(status);

-- Índices para direcciones
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario ON direcciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada ON direcciones(usuario_id, es_predeterminada);

-- Índices para métodos de pago
CREATE INDEX IF NOT EXISTS idx_metodos_pago_usuario ON metodos_pago(usuario_id);
CREATE INDEX IF NOT EXISTS idx_metodos_pago_predeterminado ON metodos_pago(usuario_id, es_predeterminado);
CREATE INDEX IF NOT EXISTS idx_metodos_pago_activo ON metodos_pago(activo);

-- Índices para configuración
CREATE INDEX IF NOT EXISTS idx_configuracion_actualizado ON configuracion_tienda(actualizado_en DESC);

-- =====================================================
-- 7. TRIGGERS Y FUNCIONES
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para configuración
DROP TRIGGER IF EXISTS trigger_actualizar_configuracion ON configuracion_tienda;
CREATE TRIGGER trigger_actualizar_configuracion
    BEFORE UPDATE ON configuracion_tienda
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

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

-- =====================================================
-- 8. DATOS INICIALES
-- =====================================================

-- Insertar usuario admin
INSERT INTO usuarios (public_id, nombre, email, password_hash, rol, rol_code)
VALUES ('admin-1', 'Administrador', 'admin@moa.cl', '$2a$12$dummy.hash.for.testing', 'ADMIN', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insertar configuración por defecto
INSERT INTO configuracion_tienda (
    id, nombre_tienda, descripcion, direccion, telefono, email,
    instagram_url, facebook_url, twitter_url
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
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE categorias IS 'Categorías de productos';
COMMENT ON TABLE productos IS 'Productos del catálogo';
COMMENT ON TABLE configuracion_tienda IS 'Configuración editable de la tienda';
COMMENT ON TABLE direcciones IS 'Direcciones de entrega de usuarios';
COMMENT ON TABLE metodos_pago IS 'Métodos de pago de usuarios';

COMMIT;