import pool from '../../database/config.js'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export const createUserModel = async (nombre, email, telefono, password) => {
    const publicId = nanoid()
    const hashedPassword = bcrypt.hashSync(password, 10)

    const sqlQuery = {
        text: `
        INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING usuario_id, public_id, nombre, email, telefono, creado_en
        `,
        values: [publicId, nombre, email, telefono, hashedPassword]
    }

    const response = await pool.query(sqlQuery)
    return response.rows[0]
}