-- Active: 1763403221678@@127.0.0.1@5432@moa

-- Reset
DROP DATABASE IF EXISTS moa;

CREATE DATABASE moa;

\c moa;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE usuarios (
    usuario_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    password_hash TEXT NOT NULL,
    rol TEXT DEFAULT 'user',
    rol_code TEXT DEFAULT 'USER',
    status TEXT DEFAULT 'activo',
    creado_en TIMESTAMPTZ DEFAULT now()
);

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
    direccion_id BIGINT REFERENCES direcciones (direccion_id),
    metodo_pago TEXT,
    subtotal_cents INT DEFAULT 0,
    envio_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    metodo_despacho TEXT DEFAULT 'standard',
    estado_pago TEXT DEFAULT 'pendiente',
    estado_envio TEXT DEFAULT 'preparacion',
    notas_cliente TEXT,
    notas_internas TEXT,
    fecha_pago TIMESTAMPTZ,
    fecha_envio TIMESTAMPTZ,
    fecha_entrega_real TIMESTAMPTZ,
    numero_seguimiento TEXT,
    empresa_envio TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orden_items (
    orden_item_id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT REFERENCES ordenes (orden_id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unit INT NOT NULL
);

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
    'MOA', 'Muebles y decoración', 'Providencia 1234, Santiago, Chile', '+56 2 2345 6789', 'contacto@moa.cl', 'http://instagram.com/moa', '', ''
);
