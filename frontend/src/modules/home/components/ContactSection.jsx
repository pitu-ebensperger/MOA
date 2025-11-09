export default function ContactSection() {
  return (
    <section id="contact" className="bg-light px-6 py-20 scroll-mt-24">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1.1fr_1fr]">

        <form className="grid grid-cols-1 gap-5 rounded-3xl border border-neutral-200 bg-white/70 p-8 shadow-sm backdrop-blur">
                  <h2 className="font-italiana text-4xl text-dark">Contáctanos</h2>

          <label className="flex flex-col gap-2">
            <span className="font-garamond text-sm text-dark">Nombre</span>
            <input
              type="text"
              name="name"
              placeholder="¿Cómo te llamas?"
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm transition focus:border-primary1 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-garamond text-sm text-dark">Correo electrónico</span>
            <input
              type="email"
              name="email"
              placeholder="nombre@estudio.cl"
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm transition focus:border-primary1 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-garamond text-sm text-dark">Teléfono</span>
            <input
              type="tel"
              name="phone"
              placeholder="+56 9 1234 5678"
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm transition focus:border-primary1 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-garamond text-sm text-dark">Mensaje</span>
            <textarea
              name="message"
              rows={4}
              placeholder="Cuéntanos qué estás buscando o qué proyecto necesitas resolver."
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm transition focus:border-primary1 focus:outline-none"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-primary1 px-7 py-2 font-garamond text-base tracking-wide text-light transition hover:bg-primary2"
            >
              Enviar consulta
            </button>
          </div>
        </form>
        <div className="space-y-6 text-left">
       
        </div>

      </div>
    </section>
  );
}
