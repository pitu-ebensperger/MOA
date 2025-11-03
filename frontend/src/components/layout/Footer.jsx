import { Facebook, Twitter, Instagram } from "lucide-react";

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
            <li>Centro de ayuda</li>
            <li>Cómo comprar</li>
            <li>Preguntas frecuentes</li>
          </ul>
        </div>

        {/* Mi cuenta */}
        <div>
          <h3 className="font-semibold mb-3">Mi cuenta</h3>
          <ul className="space-y-2 text-sm">
            <li>Carrito de compras</li>
            <li>Perfil</li>
            <li>Mis favoritos</li>
          </ul>
        </div>

        {/* Nosotros */}
        <div>
          <h3 className="font-semibold mb-3">Nosotros</h3>
          <ul className="space-y-2 text-sm">
            <li>Nuestra empresa</li>
            <li>Contacto</li>
            <li>Novedades</li>
          </ul>
        </div>
      </div>

      {/* Políticas */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row justify-end gap-6 text-sm text-gray-700">
        <span>Privacy & Policy</span>
        <span>Terms & Condition</span>
      </div>
    </footer>
  );
};
