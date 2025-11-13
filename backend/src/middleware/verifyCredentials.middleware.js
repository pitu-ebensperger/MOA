export const checkRegisterCredentials = (req, res, next) => {
  const { name, email, password } = req.body
  if (!name || !email || !password ) {
    return res.status(400).json({ menssage: 'Se deben enviar todos los campos' })
  }
  next()
}