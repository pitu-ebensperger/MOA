import React from "react";

const ContactPage = () => {
  return (
    <main className="bg-[#E6E0D8] min-h-screen px-6 py-16 text-[#453F34]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Informacion de Contacto de MOA*/}
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-[#443114] mb-4">
            Contáctanos
          </h1>
          <div>
            <h3 className="text-lg font-semibold text-[#443114] mb-1">
              Dirección postal
            </h3>
            <p className="text-[#5C5245]">
              MOA<br />
              Calle del Olmo 42, Barrio de Las Letras<br />
              Madrid, España 28012
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#443114] mb-1">
              Correo electrónico
            </h3>
            <p className="text-[#5C5245]">
              soporte@moa.com
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#443114] mb-1">
              Teléfono
            </h3>
            <p className="text-[#5C5245]">
              +5600 939 801<br />
              <span className="text-sm text-[#A69F91]">Horario: Lunes a Viernes, 9am - 6pm</span>
            </p>
          </div>
        </div>

        {/*Formulario para Contactar*/}
        <section className="bg-[#E6E0D8] py-10 px-6 rounded-xl shadow-md">
          <div className="text-center">
            <h2 className="font-italiana text-4xl text-[#100E08] mb-10">
              Contáctanos
            </h2>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Dirección */}
              <div>
                <label className="block font-garamond text-[#100E08] mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  className="w-full border border-[#453F34] rounded px-4 py-2 focus:outline-none"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block font-garamond text-[#100E08] mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full border border-[#453F34] rounded px-4 py-2 focus:outline-none"
                />
              </div>

              {/* Número de teléfono */}
              <div>
                <label className="block font-garamond text-[#100E08] mb-2">
                  Número de teléfono
                </label>
                <input
                  type="tel"
                  placeholder="Ingresa tu número"
                  className="w-full border border-[#453F34] rounded px-4 py-2 focus:outline-none"
                />
              </div>

              {/* Cita */}
              <div>
                <label className="block font-garamond text-[#100E08] mb-2">
                  Cita
                </label>
                <input
                  type="date"
                  className="w-full border border-[#453F34] rounded px-4 py-2 focus:outline-none"
                />
              </div>

              {/* Mensaje */}
              <div className="md:col-span-2">
                <label className="block font-garamond text-[#100E08] mb-2">
                  Mensaje
                </label>
                <textarea
                  rows="4"
                  placeholder="Ingresa tu mensaje"
                  className="w-full border border-[#453F34] rounded px-4 py-2 focus:outline-none"
                ></textarea>
              </div>

              {/* Botón */}
              <div className="md:col-span-2 text-center mt-4">
                <button
                  type="submit"
                  className="bg-[#443114] text-[#E6E0D8] px-8 py-2 rounded font-garamond hover:bg-[#453F34] transition"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ContactPage;
