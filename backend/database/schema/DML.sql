SELECT * FROM usuarios;

-- Crear usuario administrador
INSERT INTO
    usuarios (
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
        'admin',
        'admin@moa.cl',
        '123456789',
        '$2b$10$VJebpB12zPzZaLf7bc3DLebhZUK8cN.HHzKKCxZl1B6ojY/FCRC7W',
        'admin',
        'ADMIN'
    );

TRUNCATE TABLE usuarios RESTART IDENTITY;

DROP TABLE categorias