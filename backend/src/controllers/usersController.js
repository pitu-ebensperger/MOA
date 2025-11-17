import { createUserModel } from '../models/usersModel.js'
import { ConflictError, ValidationError } from '../utils/error.utils.js'

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body

        const missingFields = []
        if (!name) missingFields.push({ field: 'name', message: 'El nombre es requerido' })
        if (!email) missingFields.push({ field: 'email', message: 'El email es requerido' })
        if (!password) missingFields.push({ field: 'password', message: 'La contraseña es requerida' })

        if (missingFields.length) {
            throw new ValidationError('Se deben enviar todos los campos', missingFields)
        }

        const user = await createUserModel(name, email, phone, password)
        res.status(201).json({
            message: 'Usuario creado con éxito',
            user
        })
        
    } catch (error) {
        if (error.code === '23505') {
            return next(new ConflictError('El correo ya está registrado'))
        }

        next(error)
    }
}
