import React from "react";

const ContactSection = () => {
  return (
    <section className="bg-light py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-italiana text-4xl text-dark mb-10">
          Contáctanos
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Dirección */}
          <div>
            <label className="block font-garamond text-dark mb-2">
              Dirección
            </label>
            <input
              type="text"
              className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block font-garamond text-dark mb-2">
              Nombre
            </label>
            <input
              type="text"
              className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Número de teléfono */}
          <div>
            <label className="block font-garamond text-dark mb-2">
              Número de teléfono
            </label>
            <input
              type="tel"
              placeholder="Ingresa tu número"
              className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Cita */}
          <div>
            <label className="block font-garamond text-dark mb-2">
              Cita
            </label>
            <input
              type="date"
              className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none"
            />
          </div>

          {/* Mensaje */}
          <div className="md:col-span-2">
            <label className="block font-garamond text-dark mb-2">
              Mensaje
            </label>
            <textarea
              rows="4"
              placeholder="Ingresa tu mensaje"
              className="w-full border border-primary2 rounded px-4 py-2 focus:outline-none"
            ></textarea>
          </div>

          {/* Botón */}
          <div className="md:col-span-2 text-center mt-4">
            <button
              type="submit"
              className="bg-primary1 text-light px-8 py-2 rounded font-garamond hover:bg-primary2 transition"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
