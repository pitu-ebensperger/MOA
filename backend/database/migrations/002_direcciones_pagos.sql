--DIRECCIONES & PAGOS---------------------------------------------

BEGIN;

-- Direcciones
CREATE TABLE IF NOT EXISTS direcciones (
    direccion_id BIGSERIAL PRIMARY KEY,
    usuario_id   BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    etiqueta     TEXT,
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

CREATE INDEX IF NOT EXISTS idx_direcciones_usuario ON direcciones (usuario_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada ON direcciones (usuario_id, es_predeterminada DESC);

-- Métodos de pago
CREATE TABLE IF NOT EXISTS metodos_pago (
    metodo_pago_id   BIGSERIAL PRIMARY KEY,
    usuario_id       BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    -- Campos usados por el backend actual
    tipo_metodo      TEXT,
    ultimos_digitos  TEXT,
    nombre_titular   TEXT,
    fecha_expiracion DATE,
    token_pago       TEXT UNIQUE,
    predeterminado   BOOLEAN DEFAULT FALSE,
    marca            TEXT,
    proveedor_pago   TEXT,
    metadata         JSONB,
    -- Compatibilidad con seeds existentes
    tipo             TEXT,
    mes_expiracion   SMALLINT,
    anio_expiracion  SMALLINT,
    token_externo    TEXT UNIQUE,
    es_predeterminado BOOLEAN DEFAULT FALSE,
    activo           BOOLEAN DEFAULT TRUE,
    creado_en        TIMESTAMPTZ DEFAULT now(),
    actualizado_en   TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION fn_metodos_pago_sync_alias()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_metodo IS NULL AND NEW.tipo IS NOT NULL THEN
    NEW.tipo_metodo := NEW.tipo;
  ELSIF NEW.tipo IS NULL AND NEW.tipo_metodo IS NOT NULL THEN
    NEW.tipo := NEW.tipo_metodo;
  END IF;

  IF NEW.token_pago IS NULL AND NEW.token_externo IS NOT NULL THEN
    NEW.token_pago := NEW.token_externo;
  ELSIF NEW.token_externo IS NULL AND NEW.token_pago IS NOT NULL THEN
    NEW.token_externo := NEW.token_pago;
  END IF;

  IF NEW.fecha_expiracion IS NULL AND NEW.mes_expiracion IS NOT NULL AND NEW.anio_expiracion IS NOT NULL THEN
    NEW.fecha_expiracion := make_date(NEW.anio_expiracion, GREATEST(1, LEAST(12, NEW.mes_expiracion)), 1);
  END IF;

  IF NEW.fecha_expiracion IS NOT NULL THEN
    IF NEW.mes_expiracion IS NULL THEN
      NEW.mes_expiracion := EXTRACT(MONTH FROM NEW.fecha_expiracion)::SMALLINT;
    END IF;
    IF NEW.anio_expiracion IS NULL THEN
      NEW.anio_expiracion := EXTRACT(YEAR FROM NEW.fecha_expiracion)::SMALLINT;
    END IF;
  END IF;

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

CREATE INDEX IF NOT EXISTS idx_metodos_pago_usuario ON metodos_pago (usuario_id);
CREATE INDEX IF NOT EXISTS idx_metodos_pago_predeterminado ON metodos_pago (usuario_id, predeterminado DESC);

COMMIT;