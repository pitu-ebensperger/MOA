import { Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
        <div>
          <h3 className="font-semibold mb-3">Servicio al cliente</h3>
          <ul className="space-y-2 text-sm">
            <li>Centro de ayuda</li> {/* Estático */}
            <li>Cómo comprar</li> {/* Estático */}
            <li>
              <Link to="/faq" className="hover:underline">
                Preguntas frecuentes
              </Link>
            </li>
          </ul>
        </div>

        {/* Mi cuenta */}
        <div>
          <h3 className="font-semibold mb-3">Mi cuenta</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/cart" className="hover:underline">
                Carrito de compras
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:underline">
                Perfil
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:underline">
                Mis favoritos
              </Link>
            </li>
          </ul>
        </div>

        {/* Nosotros */}
        <div>
          <h3 className="font-semibold mb-3">Nosotros</h3>
          <ul className="space-y-2 text-sm">
            <li>Nuestra empresa</li> {/* Estático */}
            <li>
              <Link to="/contact" className="hover:underline">
                Contacto
              </Link>
            </li>
            <li>Novedades</li> {/* Estático */}
          </ul>
        </div>
      </div>

      {/* Políticas */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row justify-end gap-6 text-sm text-gray-700">
        <Link to="/privacy" className="hover:underline">
          Privacy & Policy
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms & Condition
        </Link>
      </div>
    </footer>
  );