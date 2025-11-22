import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar desde  backend
dotenv.config({ path: join(__dirname, '..', '.env') })

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env

const pool = new pg.Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT || 5432,
    max: 20, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // 30 segundos antes de cerrar conexión inactiva
    connectionTimeoutMillis: 2000, // 2 segundos para establecer conexión
})

// Test de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar la base de datos', err)
  } else {
    // Conexión exitosa
  }
})

export default pool
export { pool }
