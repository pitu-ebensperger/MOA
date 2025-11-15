-- Crear usuario administrador (ejecutar una sola vez o después de limpiar la tabla).
INSERT INTO usuarios (
    public_id,
    nombre,
    email,
    telefono,
    password_hash,
    rol,
    rol_code
)
VALUES (
    'abc123xyz',
    'Administrador MOA',
    'admin@moa.cl',
    '123456789',
    '$2b$10$vejGQR/60wieq.KFRWDGdeOlpkpvV1rwMoK0ewU1CmZP91JCuDRKS',
    'admin',
    'ADMIN'
);
