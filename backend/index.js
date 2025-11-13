import express from 'express'
import cors from 'cors'

import userRoutes from './routes/usersRoutes.js'

const PORT = process.env.PORT || 3000
const app = express()
app.use(express.json())
app.use(cors())

app.use(userRoutes)

app.listen(PORT, console.log(`🔥 Server on http://localhost:${PORT}`))
