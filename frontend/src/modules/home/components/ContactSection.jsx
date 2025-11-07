const FALLBACK_CONTACT = {
  showroomAddress: "Av. Italia 1439, Providencia, Santiago",
  openingHours: "Lunes a sábado · 10:00 – 19:00",
  phone: "+56 2 2791 6543",
  whatsapp: "+56 9 5678 1234",
  email: "hola@moa-studio.cl",
  formIntroduction: "Coordina una visita al showroom o escríbenos para agendar asesoría remota.",
};

export default function ContactSection({ contact = FALLBACK_CONTACT }) {
  return (
    <section id="contact" className="bg-light px-6 py-20 scroll-mt-24">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6 text-left">
          <h2 className="font-italiana text-4xl text-dark">Coordinemos una visita</h2>
          <p className="font-garamond text-secondary1">{contact.formIntroduction ?? FALLBACK_CONTACT.formIntroduction}</p>

          <ul className="space-y-3 text-sm text-neutral-700">
            {contact.showroomAddress && (
              <li>
                <span className="font-semibold text-dark">Showroom:</span> {contact.showroomAddress}
              </li>
            )}
            {contact.openingHours && (
              <li>
                <span className="font-semibold text-dark">Horarios:</span> {contact.openingHours}
              </li>
            )}
            {contact.phone && (
              <li>
                <span className="font-semibold text-dark">Teléfono:</span> {contact.phone}
              </li>
            )}
            {contact.whatsapp && (
              <li>
                <span className="font-semibold text-dark">WhatsApp:</span>{" "}
                <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} className="underline">
                  {contact.whatsapp}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <span className="font-semibold text-dark">Email:</span>{" "}
                <a href={`mailto:${contact.email}`} className="underline">
                  {contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <form className="grid grid-cols-1 gap-5 rounded-3xl border border-neutral-200 bg-white/70 p-8 shadow-sm backdrop-blur">
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
      </div>
    </section>
  );
}
