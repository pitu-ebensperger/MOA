- arreglar badge carrito (sacar numeros)



LoginPage -> useAuth.login() -> setUser & setToken -> localStorage
                              -> AuthContext.isAuthenticated = true
Navbar -> useAuth() -> muestra Perfil/Carrito/Salir si isAuthenticated
Logout -> useAuth.logout() -> limpia user/token -> Navbar cambia vista