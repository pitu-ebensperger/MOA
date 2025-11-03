import React from "react";

export default function HeroSection() {
  return (
    <section className="container-px mx-auto grid gap-6 pb-8 pt-6 sm:pb-12 sm:pt-10">
      <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
        <div>
          <h1 className="title-serif text-3xl leading-tight sm:text-4xl">Lorem Ipsum Neque porro qui dolorem</h1>
          <p className="ui-sans mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-weak)]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <div className="mt-6 flex gap-3">
            <button className="rounded-md bg-[var(--btn)] px-5 py-2 text-sm text-white hover:bg-[var(--btn-hover)]">Ver más</button>
            <button className="rounded-md border border-[var(--line)] bg-white px-5 py-2 text-sm hover:bg-[var(--paper)]">Saber más</button>
          </div>
        </div>
        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl">
          <img
            src="https://images.unsplash.com/photo-1505691723518-36a5ac3b2d52?q=80&w=1600&auto=format&fit=crop"
            alt="Sofa hero"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}