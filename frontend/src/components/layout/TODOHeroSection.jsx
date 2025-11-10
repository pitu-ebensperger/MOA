export default function HeroSection() {
  return (
    <section className="bg-[#d2cbc1] text-[var(--text-strong)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-6 py-50 sm:px-10 lg:px-20">
        
        {/* Texto */}
        <div>
          <p className="text-sm text-[var(--text-weak)] mb-2 uppercase tracking-wide">
            Diseño · Calidad · Comodidad
          </p>
          <h1 className="title-serif text-4xl sm:text-5xl leading-tight font-semibold mb-4">
            Dale vida a tu hogar con el estilo MOA
          </h1>
          <p className="ui-sans text-base leading-relaxed text-[var(--text-weak)] mb-6 max-w-lg">
            Descubre muebles únicos que combinan elegancia, confort y funcionalidad.  
            En <strong>MOA</strong> creemos que cada espacio merece un toque especial.
          </p>
          <div className="flex gap-4">
            <button className="rounded-md bg-[var(--btn)] px-6 py-2.5 text-sm text-white hover:bg-[var(--btn-hover)] transition-colors">
              Ver más
            </button>
            <button className="rounded-md border border-[var(--line)] bg-white px-6 py-2.5 text-sm hover:bg-[var(--paper)] transition-colors">
              Saber más
            </button>
          </div>
        </div>

        {/* Imagen */}
        <div className="w-full flex justify-center md:justify-end">
          <div className="aspect-[4/3] w-full md:w-full lg:w-full overflow-hidden rounded-2xl shadow-md bg-[#44311417]">
            <img
              src="https://plus.unsplash.com/premium_photo-1676321688606-2f3b026710a5?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1470"
              alt="Muebles MOA"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
