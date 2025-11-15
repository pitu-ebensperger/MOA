import pg from 'pg'
import 'dotenv/config'

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env

const pool = new pg.Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    allowExitOnIdle: true
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Error al conectar la base de datos', err)
  } else {
    console.log('Base de datos conectada con éxito', res.rows[0])
  }
})

export default pool