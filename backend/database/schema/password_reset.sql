-- Tabla para tokens de reset de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Comentarios
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único generado con crypto';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha de expiración (típicamente 1 hora)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Fecha cuando se usó el token (null = no usado)';
