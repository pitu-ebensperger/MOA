import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const CUSTOMER_SERVICE_LINKS = [
  { label: "Centro de ayuda" },
  { label: "Cómo comprar" },
  { label: "Preguntas frecuentes", href: "/faq" },
];

const ABOUT_LINKS = [
  { label: "Contacto", href: "/contact" },
  { label: "Showroom", href: "/home#contact" },
  { label: "Proyectos especiales", href: "/products" },
];

const POLICY_LINKS = [
  { label: "Cambios y devoluciones", href: "/privacy" },
  { label: "Política de privacidad", href: "/privacy" },
  { label: "Términos y condiciones", href: "/terms" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white/75 text-sm text-neutral-600 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <section>
            <Link to="/home" aria-label="Ir al inicio" className="inline-flex">
              <span className="text-3xl font-italiana tracking-tight text-primary1">MOA</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-neutral-500">
              Diseño de autor con foco en materiales nobles, fabricación responsable y objetos que
              elevan cada espacio de tu hogar.
            </p>

            <div className="mt-6 space-y-1 text-sm">
              <p className="font-semibold text-neutral-700">Showroom</p>
              <p>Av. Italia 1439, Providencia</p>
              <p>Lunes a sábado · 10:00 – 19:00</p>
              <a href="tel:+56227916543" className="block text-primary1 hover:underline">
                +56 2 2791 6543
              </a>
              <a href="mailto:hola@moa-studio.cl" className="block text-primary1 hover:underline">
                hola@moa-studio.cl
              </a>
            </div>

            <div className="mt-6 flex gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon }) => {
                const IconComponent = icon;
                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="group rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:border-primary1 hover:text-primary1"
                  >
                    <IconComponent className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </section>

          <FooterColumn title="Servicio al cliente" links={CUSTOMER_SERVICE_LINKS} />
          <FooterColumn title="Nosotros" links={ABOUT_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {POLICY_LINKS.map(({ label, href }) => (
              <Link key={label} to={href} className="hover:text-primary1 hover:underline">
                {label}
              </Link>
            ))}
          </div>
          <p>© {currentYear} MOA Studio · Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, links = [] }) => (
  <section>
    <h3 className="text-base font-semibold text-neutral-800">{title}</h3>
    <ul className="mt-4 space-y-2 text-sm">
      {links.map(({ label, href, external }) => (
        <li key={label}>
          {href ? (
            external ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-500 transition hover:text-primary1 hover:underline"
              >
                {label}
              </a>
            ) : (
              <Link to={href} className="text-neutral-500 transition hover:text-primary1 hover:underline">
                {label}
              </Link>
            )
          ) : (
            <span className="text-neutral-400">{label}</span>
          )}
        </li>
      ))}
    </ul>
  </section>
);
