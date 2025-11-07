import { Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#d2cbc1] text-gray-800 py-10 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo y descripción */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Logo</h2>
          <p className="text-sm mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </p>
          <div className="flex gap-3 mb-6">
            <a href="#" className="p-2 bg-white rounded-full hover:bg-gray-200">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-white rounded-full hover:bg-gray-200">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-white rounded-full hover:bg-gray-200">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-gray-700">
            ©2025 MOA. All rights reserved
          </p>
        </div>

        {/* Servicio al cliente */}
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
};
