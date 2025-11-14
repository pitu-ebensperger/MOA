export const checkRegisterCredentials = (req, res, next) => {
  const { name, email, password } = req.body
  if (!name || !email || !password ) {
    return res.status(400).json({ menssage: 'Se deben enviar todos los campos' })
  }
  next()
}

export const checkLoginCredentials = (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Se debe enviar el email y password' })
  }
  next()
}
