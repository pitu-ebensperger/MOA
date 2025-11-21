import pool from './database/config.js';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

async function createTestUser() {
  try {
    const publicId = nanoid();
    const hashedPassword = bcrypt.hashSync('123456', 10);
    
    const result = await pool.query(`
      INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING usuario_id, nombre, email, telefono
    `, [publicId, 'Juan Pérez', 'juan@test.com', '+56987654321', hashedPassword]);
    
    console.log('Usuario de prueba creado:');
    console.table(result.rows);
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

createTestUser();