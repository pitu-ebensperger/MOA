import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav>
      <h2> Moa </h2>

      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/products">Productos</Link></li>
        <li><Link to="/cart">Carrito</Link></li>
        <li><Link to="/profile">Perfil</Link></li>
      </ul>
    </nav>
  )
}