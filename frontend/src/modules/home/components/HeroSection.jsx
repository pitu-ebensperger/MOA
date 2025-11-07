const NAVBAR_HEIGHT = 80; // px
const HERO_BACKGROUND =
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWluaW1hbGlzdCUyMGxpdmluZyUyMHJvb218ZW58MHx8MHx8fDA%3D&ixlib=rb-4.1.0&q=60&w=3000";

export default function HeroSection({ hero }) {
  if (!hero) return null;

  const { title, subtitle, ctaPrimary, ctaSecondary, textColor } = hero;

  const headingClass = `title-serif text-4xl leading-tight sm:text-5xl ${textColor ? "" : "text-white"}`;
  const subtitleClass = `font-garamond text-lg sm:text-xl ${textColor ? "" : "text-white/80"}`;
  const secondaryTextClass = textColor ? "" : "text-white/70";

  return (
    <section
      className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ paddingTop: `${NAVBAR_HEIGHT}px`, marginTop: `-${NAVBAR_HEIGHT}px` }}
    >
      <img
        src={HERO_BACKGROUND}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/40" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="flex flex-col gap-6">
          {title && (
            <h1 className={headingClass} style={textColor ? { color: textColor } : undefined}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`${subtitleClass} leading-relaxed`} style={textColor ? { color: textColor } : undefined}>
              {subtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            {ctaPrimary?.label && ctaPrimary?.href && (
              <a
                href={ctaPrimary.href}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 font-garamond text-base tracking-wide text-neutral-900 transition hover:bg-neutral-100"
              >
                {ctaPrimary.label}
              </a>
            )}
            {ctaSecondary?.label && ctaSecondary?.href && (
              <a
                href={ctaSecondary.href}
                className={`inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-2.5 font-garamond text-base tracking-wide transition hover:border-white/80 ${secondaryTextClass}`}
                style={textColor ? { color: textColor } : undefined}
              >
                {ctaSecondary.label}
              </a>
            )}
          </div>
        </div>

        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
