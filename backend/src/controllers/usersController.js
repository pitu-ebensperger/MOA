import { createUserModel } from '../models/usersModel.js'

export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body
        const user = await createUserModel(name, email, phone, password)
        res.status(201).json({
            message: 'Usuario creado con éxito',
            user
        })
        
    } catch (error) {
        console.error('Error al registrar el usuario:', error)

    if (error.code === '23505') {
      return res.status(409).json({ message: 'El correo ya está registrado' })
    }

    res.status(500).json({ message: 'Error al crear usuario' })
    }
}