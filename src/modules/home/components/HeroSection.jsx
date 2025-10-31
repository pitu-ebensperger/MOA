export const HeroSection = () => (
  <Hero
    eyebrow={HERO_COPY.eyebrow}
    title={HERO_COPY.title}
    description={HERO_COPY.subtitle}
    actions={
      <Button as={Link} to={HERO_COPY.ctaLink}>
        {HERO_COPY.ctaLabel}
      </Button>
    }
    media={<div className="home-hero__illustration" aria-hidden="true" />}
  />
);