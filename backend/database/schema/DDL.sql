-- ===============================================
-- MOA E-COMMERCE DATABASE SCHEMA - FINAL VERSION
-- ===============================================
-- Version: 1.0.0 (Production Ready)
-- Date: November 22, 2025
-- Database: PostgreSQL 17+
-- Description: Schema consolidado con todas las optimizaciones y migraciones aplicadas
-- ===============================================

-- Reset database (WARNING: Destructive operation)
DROP DATABASE IF EXISTS moa;
CREATE DATABASE moa;
\c moa;

-- ===============================================
-- EXTENSIONS
-- ===============================================

-- Extensión para búsquedas por similitud de texto (trigram)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===============================================
-- FUNCTIONS & TRIGGERS
-- ===============================================

-- Función para actualizar automáticamente la columna actualizado_en
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- TABLES
-- ===============================================

-- Usuarios (clientes y administradores)
CREATE TABLE usuarios (
    usuario_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    password_hash TEXT NOT NULL,
    rol_code TEXT DEFAULT 'CLIENT' CHECK (rol_code IN ('CLIENT', 'ADMIN')),
    status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'bloqueado')),
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol_code ON usuarios(rol_code);
CREATE INDEX idx_usuarios_status ON usuarios(status);

CREATE TABLE password_reset_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT now(),
    expira_en TIMESTAMPTZ NOT NULL,
    usado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expira_en);

CREATE TABLE categorias (
    categoria_id SMALLSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    cover_image TEXT
);

CREATE TABLE direcciones (
    direccion_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    label TEXT DEFAULT 'casa' CHECK (label IN ('casa', 'oficina', 'trabajo', 'otro')),
    nombre_contacto TEXT NOT NULL,
    telefono_contacto TEXT NOT NULL,
    calle TEXT NOT NULL,
    numero TEXT NOT NULL,
    departamento TEXT,
    comuna TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    region TEXT NOT NULL,
    codigo_postal TEXT,
    referencia TEXT,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_direcciones_usuario ON direcciones (usuario_id);
CREATE INDEX idx_direcciones_predeterminada ON direcciones (usuario_id, es_predeterminada);

CREATE TRIGGER trigger_direcciones_updated_at
BEFORE UPDATE ON direcciones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TABLE productos (
    producto_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    categoria_id SMALLINT REFERENCES categorias (categoria_id),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    precio_cents INT NOT NULL,
    stock INT DEFAULT 0,
    status TEXT DEFAULT 'activo',
    descripcion TEXT,
    img_url TEXT,
    gallery TEXT [],
    badge TEXT [],
    tags TEXT [],
    color TEXT,
    material TEXT,
    dimensions JSONB,
    weight JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimización de productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_status ON productos(status);
CREATE INDEX IF NOT EXISTS idx_productos_slug ON productos(slug);
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);

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

-- Órdenes de compra
CREATE TABLE ordenes (
    orden_id BIGSERIAL PRIMARY KEY,
    order_code TEXT UNIQUE NOT NULL,
    usuario_id BIGINT REFERENCES usuarios (usuario_id),
    direccion_id BIGINT REFERENCES direcciones (direccion_id),
    
    -- Montos en centavos (evita problemas de precisión con decimales)
    subtotal_cents INT DEFAULT 0,
    envio_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    
    -- Métodos (con validación a nivel BD)
    metodo_pago TEXT CHECK (metodo_pago IN ('transferencia', 'webpay', 'tarjeta_credito', 'tarjeta_debito', 'paypal', 'efectivo')),
    metodo_despacho TEXT DEFAULT 'standard' CHECK (metodo_despacho IN ('standard', 'express', 'retiro')),
    
    -- Estados (workflow completo)
    estado_orden TEXT DEFAULT 'confirmed' CHECK (estado_orden IN ('draft', 'confirmed', 'cancelled')),
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'rechazado', 'reembolsado')),
    estado_envio TEXT DEFAULT 'preparacion' CHECK (estado_envio IN ('preparacion', 'enviado', 'en_transito', 'entregado', 'cancelado')),
    
    -- Notas
    notas_cliente TEXT,
    
    -- Fechas de seguimiento
    fecha_pago TIMESTAMPTZ,
    fecha_envio TIMESTAMPTZ,
    fecha_entrega_real TIMESTAMPTZ,
    
    -- Tracking info
    numero_seguimiento TEXT DEFAULT 'PENDIENTE_ASIGNAR',
    empresa_envio TEXT DEFAULT 'por_asignar' CHECK (empresa_envio IN ('chilexpress', 'blue_express', 'starken', 'correos_chile', 'por_asignar')),
    
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices optimizados para órdenes
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);
CREATE INDEX idx_ordenes_estado_pago ON ordenes(estado_pago);
CREATE INDEX idx_ordenes_estado_envio ON ordenes(estado_envio);
CREATE INDEX idx_ordenes_creado_en ON ordenes(creado_en DESC);
CREATE INDEX idx_ordenes_estado_creado ON ordenes(estado_orden, creado_en);
CREATE INDEX idx_ordenes_analytics ON ordenes(estado_orden, estado_pago, metodo_pago, creado_en) WHERE estado_orden = 'confirmed';

CREATE TABLE orden_items (
    orden_item_id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT REFERENCES ordenes (orden_id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unit INT NOT NULL
);

-- Índices para optimización de orden_items
CREATE INDEX IF NOT EXISTS idx_orden_items_orden ON orden_items(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_producto ON orden_items(producto_id);

CREATE TABLE configuracion_tienda (
    id SERIAL PRIMARY KEY,
    nombre_tienda TEXT NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    actualizado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_por BIGINT REFERENCES usuarios(usuario_id)
);

-- Insertar configuración inicial
INSERT INTO configuracion_tienda (
    nombre_tienda, descripcion, direccion, telefono, email, instagram_url, facebook_url, twitter_url
) VALUES (
    'MOA', 'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.', 'Providencia 1234, Santiago, Chile', '+56 2 2345 6789', 'contacto@moa.cl', 'https://instagram.com/moa', '', ''
);

-- ===============================================
-- ÍNDICES DE BÚSQUEDA AVANZADA
-- ===============================================

-- Índice GIN para búsqueda por similitud de nombre (trigram)
CREATE INDEX idx_productos_nombre_trgm ON productos USING gin(nombre gin_trgm_ops);

-- Índice GIN para búsqueda full-text en español
CREATE INDEX idx_productos_search ON productos USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion, '')));

-- ===============================================
-- INITIAL DATA
-- ===============================================

-- Configuración inicial de la tienda
INSERT INTO configuracion_tienda (
    nombre_tienda, 
    descripcion, 
    direccion, 
    telefono, 
    email, 
    instagram_url, 
    facebook_url, 
    twitter_url
) VALUES (
    'MOA', 
    'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.', 
    'Providencia 1234, Santiago, Chile', 
    '+56 2 2345 6789', 
    'contacto@moa.cl', 
    'https://instagram.com/moa', 
    '', 
    ''
);

-- ===============================================
-- END OF SCHEMA
-- ===============================================
