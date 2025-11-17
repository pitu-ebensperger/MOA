import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import pool from "../database/config.js";
import "dotenv/config";

/**
 * Script para crear un usuario administrador inicial
 * Uso: node scripts/createAdmin.js <email> <password> <nombre>
 */

const createAdmin = async (email, password, nombre) => {
  try {
    // Verificar si ya existe un usuario con ese email
    const existingUser = await pool.query(
      "SELECT usuario_id FROM usuarios WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log(`❌ Ya existe un usuario con el email: ${email}`);
      process.exit(1);
    }

    // Crear el usuario administrador
    const publicId = nanoid();
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sqlQuery = {
      text: `
        INSERT INTO usuarios (public_id, nombre, email, password_hash, rol, rol_code)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING usuario_id, public_id, nombre, email, rol, rol_code, creado_en
      `,
      values: [publicId, nombre, email, hashedPassword, 'Administrador', 'admin'],
    };

    const response = await pool.query(sqlQuery);
    const newAdmin = response.rows[0];

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email:', newAdmin.email);
    console.log('👤 Nombre:', newAdmin.nombre);
    console.log('🔑 Rol:', newAdmin.rol);
    console.log('🆔 Public ID:', newAdmin.public_id);
    console.log('📅 Creado en:', newAdmin.creado_en);
    console.log('\n🚀 Ahora puedes usar estas credenciales para acceder al panel de administración');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Validar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.length !== 3) {
  console.log('❌ Uso incorrecto del script');
  console.log('✅ Uso: node scripts/createAdmin.js <email> <password> <nombre>');
  console.log('📝 Ejemplo: node scripts/createAdmin.js admin@moa.cl mi_password_seguro "Admin MOA"');
  process.exit(1);
}

const [email, password, nombre] = args;

// Validaciones básicas
if (!email.includes('@')) {
  console.log('❌ Email inválido');
  process.exit(1);
}

if (password.length < 6) {
  console.log('❌ La contraseña debe tener al menos 6 caracteres');
  process.exit(1);
}

if (nombre.length < 2) {
  console.log('❌ El nombre debe tener al menos 2 caracteres');
  process.exit(1);
}

console.log('🔧 Creando usuario administrador...');
console.log('📧 Email:', email);
console.log('👤 Nombre:', nombre);

createAdmin(email, password, nombre);