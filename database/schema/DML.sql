-- Active: 1763944864416@@127.0.0.1@5432@moa
SELECT * FROM usuarios;
-- Crear usuario administrador
TRUNCATE TABLE RESTART IDENTITY;

DROP TABLE wishlist_items CASCADE;

CREATE SCHEMA moa;

SELECT * FROM productos WHERE producto_id = 39;