-- Active: 1730684071005@@127.0.0.1@5432@moa
CREATE DATABASE moa;

\c moa;

CREATE TABLE usuarios (
    usuario_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    password_hash TEXT NOT NULL,
    rol TEXT,
    rol_code TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE roles (
    rol_id SMALLSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL --> 'ADMIN' | 'USER'
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
    public_id TEXT UNIQUE NOT NULL, --> creada con nanoid? o definir sistema propio?
    categoria_id INT REFERENCES categorias (categoria_id),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    precio_cents INT NOT NULL,
    stock INT DEFAULT 0,
    descripcion TEXT,
    descripcion_corta TEXT,
    img_url TEXT,
    gallery TEXT [],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE carritos (
    carrito_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id),
    status TEXT NOT NULL DEFAULT 'ABIERTO', -- 'ABIERTO' | 'CERRADO'
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
    wishlist_id BIGINT REFERENCES wishlists (wishlist_id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos (producto_id),
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