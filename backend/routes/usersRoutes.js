import { Router } from 'express'
import { registerUser } from '../src/controllers/usersController.js'
import { checkRegisterCredentials } from '../src/middleware/verifyCredentials.middleware.js'

const router = Router()

router.post('/register', checkRegisterCredentials, registerUser)

export default router