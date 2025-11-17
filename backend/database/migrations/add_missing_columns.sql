-- Migración para agregar columnas faltantes si no existen

-- Agregar compare_at_price_cents si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'compare_at_price_cents') THEN
        ALTER TABLE productos ADD COLUMN compare_at_price_cents INT;
    END IF;
END $$;

-- Agregar status si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'status') THEN
        ALTER TABLE productos ADD COLUMN status TEXT DEFAULT 'activo';
    END IF;
END $$;

-- Agregar badge si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'badge') THEN
        ALTER TABLE productos ADD COLUMN badge TEXT[];
    END IF;
END $$;

-- Agregar tags si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'tags') THEN
        ALTER TABLE productos ADD COLUMN tags TEXT[];
    END IF;
END $$;

-- Agregar color si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'color') THEN
        ALTER TABLE productos ADD COLUMN color TEXT;
    END IF;
END $$;

-- Agregar material si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'material') THEN
        ALTER TABLE productos ADD COLUMN material TEXT;
    END IF;
END $$;

-- Agregar dimensions si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'dimensions') THEN
        ALTER TABLE productos ADD COLUMN dimensions JSONB;
    END IF;
END $$;

-- Agregar weight si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'weight') THEN
        ALTER TABLE productos ADD COLUMN weight JSONB;
    END IF;
END $$;

-- Agregar specs si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'specs') THEN
        ALTER TABLE productos ADD COLUMN specs JSONB;
    END IF;
END $$;

-- Verificar que todas las columnas necesarias existan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY column_name;