const ContactSection = () => {
  return (
    <section className="bg-[var(--paper)]">
      <div className="container-px mx-auto grid gap-6 py-12 sm:grid-cols-2 sm:items-center">
        <div>
          <h2 className="title-serif text-2xl sm:text-3xl">¿Necesitás ayuda para elegir?</h2>
          <p className="ui-sans mt-3 text-sm leading-relaxed text-[var(--text-weak)]">
            Nuestro equipo está listo para asesorarte sobre materiales, estilos y opciones de envío.
            Dejanos tu consulta y te contactamos dentro de las próximas 24 horas hábiles.
          </p>
        </div>

        <form className="ui-sans grid gap-4 rounded-lg bg-white p-6 shadow-sm">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--text)]">Nombre completo</span>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              className="rounded-md border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--text)]">Correo electrónico</span>
            <input
              type="email"
              name="email"
              placeholder="nombre@correo.com"
              className="rounded-md border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand)]"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--text)]">Consulta</span>
            <textarea
              name="message"
              rows="4"
              placeholder="Contanos qué estás buscando"
              className="resize-none rounded-md border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--brand)]"
            />
          </label>

          <button
            type="submit"
            className="rounded-md bg-[var(--btn)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--btn-hover)]"
          >
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
