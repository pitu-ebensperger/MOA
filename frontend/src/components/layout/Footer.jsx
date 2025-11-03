import { Mail, Phone } from "lucide-react";


export default function Footer() {
return (
<footer className="border-t border-[var(--line)] bg-[var(--paper)]">
<div className="container-px mx-auto grid gap-10 py-10 sm:grid-cols-2">
<div>
<div className="title-serif text-lg">Logo</div>
<p className="ui-sans mt-2 text-sm text-[var(--text-weak)] max-w-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
<div className="mt-3 flex gap-3 text-[var(--text-weak)]">
<a className="rounded-full p-2 ring-1 ring-[var(--line)] hover:bg-white"><Mail className="size-4" /></a>
<a className="rounded-full p-2 ring-1 ring-[var(--line)] hover:bg-white"><Phone className="size-4" /></a>
</div>
</div>
<div className="flex flex-row gap-20">
<div>
<h4 className="ui-sans text-sm font-medium">Servicio al cliente</h4>
<ul className="ui-sans mt-3 space-y-2 text-sm text-[var(--text-weak)]">
<li>Centro de ayuda</li>
<li>Cómo comprar</li>
<li>Preguntas frecuentes</li>
</ul>
</div>
<div>
<h4 className="ui-sans text-sm font-medium">Nosotros</h4>
<ul className="ui-sans mt-3 space-y-2 text-sm text-[var(--text-weak)]">
<li>Nuestra empresa</li>
<li>Contacto</li>
<li>Novedades</li>
</ul>
</div>
</div>
</div>
<div className="ui-sans border-t border-[var(--line)] py-4 text-center text-xs text-[var(--text-weak)]">
©2025 MOA · Privacy & Policy · Terms & Conditions
</div>
</footer>
);
}