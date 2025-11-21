-- Agregar columna estado_orden para gestionar el ciclo de vida completo de las órdenes
-- Estados:
-- - 'draft': Orden creada pero no confirmada por el frontend (se puede eliminar automáticamente)
-- - 'confirmed': Orden confirmada por el usuario (lista para procesamiento)
-- - 'cancelled': Orden cancelada por el usuario o el sistema

ALTER TABLE ordenes 
ADD COLUMN estado_orden TEXT DEFAULT 'draft' CHECK (estado_orden IN ('draft', 'confirmed', 'cancelled'));

-- Índice para optimizar consultas de limpieza de drafts
CREATE INDEX idx_ordenes_estado_creado ON ordenes (estado_orden, creado_en);

-- Actualizar órdenes existentes a 'confirmed' (asumiendo que son órdenes válidas)
UPDATE ordenes SET estado_orden = 'confirmed' WHERE estado_orden IS NULL;

-- Comentario sobre limpieza automática
COMMENT ON COLUMN ordenes.estado_orden IS 'Estados: draft (no confirmada, se elimina automáticamente), confirmed (confirmada por usuario), cancelled (cancelada)';
