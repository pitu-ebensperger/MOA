import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Info, ShoppingCart, Star } from "lucide-react";
import { Button, IconButton, AnimatedCTAButton } from "../../../components/ui/Button.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import { Accordion } from "../../../components/ui/Accordion.jsx";
import { Pagination } from "../../../components/ui/Pagination.jsx";
import { Pill } from "../../../components/ui/Pill.jsx";
import { SearchBar } from "../../../components/ui/SearchBar.jsx";
import CategoriesCard from "../../categories/components/CategoriesCard.jsx";
import ProductCard from "../../products/components/ProductCard.jsx";
import { TanstackDataTable } from "../../../components/data-display/DataTable.jsx";
import { Price } from "../../../components/data-display/Price.jsx";
import { Breadcrumbs } from "../../../components/layout/Breadcrumbs.jsx";
import { API_PATHS } from "../../../config/api-paths.js";

const colorTokens = [
  {
    label: "Primario 1",
    cssVar: "--color-primary1",
    fallback: "#6B5444",
    hint: "Titulos / CTA / botones con fondo oscuro",
  },
  { label: "Primario 2", cssVar: "--color-primary2", fallback: "#52443A", hint: "Texto principal" },
  { label: "Primario 3", cssVar: "--color-primary3", fallback: "#A67B5B", hint: "Fondos de cards" },
  { label: "Primario 4", cssVar: "--color-primary4", fallback: "#C9A88A", hint: "Surfaces suaves" },
  { label: "Secundario 1", cssVar: "--color-secondary1", fallback: "#9B8F82", hint: "Texto secundario / dividers" },
  { label: "Secundario 2", cssVar: "--color-secondary2", fallback: "#6B5D52", hint: "Texto terciario / overlays" },
  { label: "Neutral 1", cssVar: "--color-neutral1", fallback: "#FAF8F5", hint: "Fondo principal" },
  { label: "Neutral 2", cssVar: "--color-neutral2", fallback: "#FEFCFA", hint: "Cards elevadas" },
  { label: "Neutral 3", cssVar: "--color-neutral3", fallback: "#E5DDD1", hint: "Dividers / bordes" },
  { label: "Light Beige", cssVar: "--color-light-beige", fallback: "#f6efe7", hint: "Áreas suaves y gradientes" },
  { label: "Beige", cssVar: "--color-beige", fallback: "#e9dccb", hint: "Background alternativo" },
  { label: "Light", cssVar: "--color-light", fallback: "#ede7e0", hint: "Base general" },
  { label: "Lightest", cssVar: "--color-lightest", fallback: "rgba(248,247,245,1)", hint: "fondo ultra claro o glow" },
  { label: "Dark", cssVar: "--color-dark", fallback: "#3A3632", hint: "Texto en fondos claros" },
  { label: "Black", cssVar: "--color-black", fallback: "#100E08", hint: "Texto/íconos oscuros" },
  { label: "Success", cssVar: "--color-success", fallback: "#7A8B6F", hint: "Estados positivos" },
  { label: "Warning", cssVar: "--color-warning", fallback: "#B8956A", hint: "Avisos / alertas" },
  { label: "Error", cssVar: "--color-error", fallback: "#B8836B", hint: "Errores o alertas fuertes" },
  { label: "Hover", cssVar: "--color-hover", fallback: "#524422", hint: "Estados hover" },
  { label: "Active", cssVar: "--color-active", fallback: "#362811", hint: "Estados activos" },
  { label: "Disabled", cssVar: "--color-disabled", fallback: "rgba(68,49,20,0.3)", hint: "Estados deshabilitados" },
  { label: "Text", cssVar: "--color-text", fallback: "#52443A", hint: "Texto principal" },
  { label: "Text secondary", cssVar: "--color-text-secondary", fallback: "#9B8F82", hint: "Texto menos relevante" },
  { label: "Text tertiary", cssVar: "--color-text-tertiary", fallback: "#6B5D52", hint: "Texto de apoyo" },
  { label: "Text muted", cssVar: "--color-text-muted", fallback: "#A69F91", hint: "Dividers y notas" },
  { label: "Text on dark", cssVar: "--color-text-on-dark", fallback: "#ccc7be", hint: "Texto sobre fondos oscuros" },
  { label: "Color border", cssVar: "--color-border", fallback: "#E5DDD1", hint: "Bordes y dividers" },
  { label: "Overlay dark", cssVar: "--overlay-dark", fallback: "rgba(16,14,8,0.65)", hint: "Modales y overlays" },
  { label: "Overlay soft", cssVar: "--overlay-soft", fallback: "rgba(68,49,20,0.45)", hint: "Overlays ligeros" },
  { label: "Overlay light", cssVar: "--overlay-light", fallback: "rgba(255,255,255,0.85)", hint: "Overlays claros" },
];

const spacingTokens = [
  { label: "XS | padding", cssVar: "--spacing-xs", fallback: "0.25rem" },
  { label: "SM | padding", cssVar: "--spacing-sm", fallback: "0.5rem" },
  { label: "MD | padding", cssVar: "--spacing-md", fallback: "1rem" },
  { label: "LG | padding", cssVar: "--spacing-lg", fallback: "1.5rem" },
  { label: "XL | padding", cssVar: "--spacing-xl", fallback: "2rem" },
];

const typographySamples = [
  {
    label: "Display / Títulos grandes",
    className: "font-display text-4xl tracking-tight text-[var(--color-primary1)]",
    sample: "MOA · Guía viviente",
  },
  {
    label: "Sans / Texto base",
    className: "font-sans text-base leading-relaxed text-[var(--color-text)]",
    sample: "Plus Jakarta Sans para mantener legibilidad en listados largos.",
  },
  {
    label: "Serif / Textos destacados",
    className: "font-serif text-2xl leading-snug text-[var(--color-secondary2)]",
    sample: "Frases de impacto con toque editorial.",
  },
];

const buttonVariants = [
  { label: "Sólido primario", appearance: "solid", intent: "primary" },
  { label: "Sólido secundario", appearance: "solid", intent: "secondary" },
  { label: "Ghost neutro", appearance: "ghost", intent: "neutral" },
  { label: "Soft acento", appearance: "soft", intent: "accent" },
  { label: "Outline primario", appearance: "outline", intent: "primary" },
  { label: "Link destacado", appearance: "link", intent: "primary" },
  { label: "Tinted inverse", appearance: "tinted", intent: "inverse", shape: "pill" },
];

const badgeVariants = ["primary", "secondary", "neutral", "destacado", "nuevo"];
const pillVariants = ["neutral", "success", "warning", "danger", "outline"];
const TAB_ITEMS = [
  { id: "tokens", label: "Tokens" },
  { id: "componentes", label: "Componentes" },
  { id: "utilidades", label: "Utilidades" },
];
const TAB_IDS = TAB_ITEMS.map((tab) => tab.id);
const DEFAULT_TAB = TAB_ITEMS[0].id;

const getTabFromPath = (pathname = "") => {
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const candidate = segments[1];
  return TAB_IDS.includes(candidate) ? candidate : "";
};

const normalizePath = (path = "") => path.replace(/\/$/, "") || "/";

const SECTION_THEME_STYLES = {
  light: { bg: "bg-white/90", border: "border-[var(--color-border-light)]" },
  dark: { bg: "bg-[#1a120d]/95", border: "border-white/20" },
};

const SAMPLE_PRODUCT = {
  id: "sample-card",
  name: "Centro de mesa artesanal",
  slug: "centro-mesa-artesanal",
  price: 42000,
  imgUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop",
};

const SAMPLE_CATEGORIES = [
  {
    id: "living",
    name: "Living",
    slug: "living",
    coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "coleccion-verde",
    name: "Colección Verde",
    slug: "coleccion-verde",
    coverImage: "https://images.unsplash.com/photo-1465804570320-27f4b51b41bc?q=80&w=1000&auto=format&fit=crop",
  },
];

const USAGE_REFERENCES = {
  "tokens.colors": [
    "Titulares e ítems destacados usan --color-primary1",
    "Textos secundarios y enlaces hacen uso de --color-secondary1 / --color-secondary2",
    "Fondo general y tarjetas elevadas usan --color-neutral1 / --color-neutral2",
  ],
  "tokens.typography": [
    "Display: títulos principales + hero y secciones de bienvenida",
    "Sans: contenido de listas, descripciones de productos y formularios",
    "Serif: frases de impacto en Home y sección de soporte",
  ],
  "tokens.spacing": [
    "Los spacing tokens aplican padding general en cards y hero (XS a LG)",
    "También se usan como gap en layout y grids comunes",
  ],
  buttons: [
    "Botón primario: Navbar (login), carrito y checkout",
    "Botón secundario: formularios, filtros, modales y panel admin",
    "Ghost / outline: acciones secundarias en listados y cards",
    "Icon / icon-bg: botones de acciones rápidas (carrito, filtros, cerrar)",
    "Animated: CTA de hero o secciones destacadas",
  ],
  badges: [
    "Badges primary/destacado: etiquetas en cards y detail",
    "Badge nuevo: nuevos lanzamientos en listados de productos",
    "Neutral: estados informativos y headers de tarjetas",
  ],
  pills: [
    "Pill neutral: filtros y estados suaves en listados",
    "Pill success/warning/danger: indicadores de stock o alertas",
    "Pill outline: chips combinados en tablas y status badges",
  ],
  components: [
    "Accordion: FAQs y bloques de ayuda en `HomePage` y soporte",
    "Pagination: listados de productos y panel admin",
    "SearchBar: botón lupa del Navbar abre el overlay",
  ],
  pageComponents: [
    "CategoriesCard: hero y tarjetas destacadas en `/categorias` y home",
    "ProductCard: listados de productos en home, catálogo y búsquedas",
  ],
};

const STYLE_GUIDELINE_SUMMARY = [
  {
    title: "Paleta terrosa",
    description: "La gama principal y los neutros crean una atmósfera cálida y equilibrada.",
    highlights: USAGE_REFERENCES["tokens.colors"],
  },
  {
    title: "Tipografías en jerarquía",
    description: "Display, Sans y Serif se asignan según la importancia del mensaje.",
    highlights: USAGE_REFERENCES["tokens.typography"],
  },
  {
    title: "Componentes y estados",
    description: "Botones, badges y utilidades sincronizan acciones y estados importantes.",
    highlights: [
      USAGE_REFERENCES.buttons[0],
      USAGE_REFERENCES.badges[0],
      USAGE_REFERENCES.pills[0],
      USAGE_REFERENCES.components[0],
    ],
  },
];

const OVERLAY_SAMPLES = [
  { name: "Overlay dark", className: "overlay-dark", hint: "Modal o hero oscuro" },
  { name: "Overlay soft", className: "overlay-soft", hint: "Hover suave sobre cards" },
  { name: "Overlay light", className: "overlay-light", hint: "Overlays claros" },
];

const GRADIENT_SAMPLES = [
  { label: "Gradient auth", className: "bg-gradient-auth", description: "Fondo de login / register" },
  { label: "Hero gradient", className: "hero-gradient-overlay", description: "Gradient sobre hero (utilizar blend)" },
  { label: "Card gradient overlay", className: "card-gradient-overlay", description: "Gradiente de card sobre imagen" },
];

const HOVER_PREVIEWS = [
  {
    name: "Botón hover",
    className:
      "bg-[var(--color-primary1)] text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
    hint: "Escala y brillo ligero",
  },
  {
    name: "Card hover",
    className:
      "rounded-3xl border border-[var(--color-border)] px-4 py-6 text-[var(--color-text)] transition hover:border-[var(--color-primary1)] hover:shadow-[0_10px_30px_rgba(68,49,20,0.2)]",
    hint: "Border + sombra más fuerte",
  },
  {
    name: "Icon button hover",
    className:
      "icon-button rounded-full border border-[var(--color-border)] p-3 transition hover:bg-[var(--color-primary1)] hover:text-white",
    hint: "Fondo iluminado para iconos",
  },
];

const SAMPLE_BREADCRUMBS = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: API_PATHS.products.products },
  { label: "Guía de estilos", isCurrent: true },
];

const SAMPLE_TABLE_DATA = [
  { id: "P-001", sku: "P-001", name: "Butaca artesanal", price: 85000, stock: "En stock", status: "Disponible" },
  { id: "P-002", sku: "P-002", name: "Mesa redonda", price: 156000, stock: "Últimas 3 unidades", status: "Limitado" },
  { id: "P-003", sku: "P-003", name: "Lámpara de mimbre", price: 62000, stock: "Sin stock", status: "Agotado" },
];

const SAMPLE_TABLE_COLUMNS = [
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "name", header: "Producto" },
  {
    id: "price",
    header: "Precio",
    accessorFn: (row) => <Price value={row.price} />,
    meta: { align: "right" },
  },
  { accessorKey: "stock", header: "Stock" },
  { accessorKey: "status", header: "Estado" },
];

const UTILITY_GROUPS = [
  {
    title: "Tipografías",
    items: [
      {
        name: ".title-display / .text-display / .font-display / .display",
        description: "Tipografía de display para titulares heroicos.",
        previewClasses: "title-display text-[var(--color-primary1)]",
        sample: "MOA Display",
      },
      {
        name: ".title-serif / .text-serif / .font-serif / .serif",
        description: "Uso editorial o frases de impacto.",
        previewClasses: "text-serif text-[var(--color-secondary2)]",
        sample: "Serif elegante",
      },
      {
        name: ".title-sans / .font-sans / .sans",
        description: "Sans neutral para bloque de contenido.",
        previewClasses: "font-sans text-[var(--color-text)]",
        sample: "Plus Jakarta Sans",
      },
    ],
  },
  {
    title: "Colores de texto",
    items: [
      {
        name: ".text-primary / .color-primary1",
        description: "Color principal para CTA y títulos.",
        previewClasses: "text-primary",
        sample: "Texto primario",
      },
      {
        name: ".text-secondary / .color-secondary1",
        description: "Texto secundario y links secundarios.",
        previewClasses: "text-secondary",
        sample: "Texto secundario",
      },
      {
        name: ".text-secondary2 / .text-tertiary / .color-secondary2",
        description: "Subtítulos y tonalidades suaves.",
        previewClasses: "text-secondary2",
        sample: "Texto terciario",
      },
      {
        name: ".text-muted / .text-body / .text",
        description: "Textos de apoyo y párrafos estándar.",
        previewClasses: "text-muted",
        sample: "Texto muted",
      },
      {
        name: ".text-on-dark",
        description: "Texto sobre fondos oscuros o overlays.",
        previewClasses: "text-on-dark",
        sample: "Texto sobre dark",
      },
      {
        name: ".text-dark / .color-dark",
        description: "Oscuro intenso para legibilidad sobre blanco.",
        previewClasses: "text-dark",
        sample: "Texto oscuro",
      },
      {
        name: ".text-accent1 / .color-primary3",
        description: "Color intermedio en gradientes.",
        previewClasses: "text-accent1",
        sample: "Accent 1",
      },
      {
        name: ".text-accent2 / .color-primary4",
        description: "Tonalidad más clara para badgets ligeros.",
        previewClasses: "text-accent2",
        sample: "Accent 2",
      },
      {
        name: ".success / .color-success",
        description: "Estados positivos o confirmaciones.",
        previewClasses: "success",
        sample: "Success",
      },
      {
        name: ".warning / .color-warning",
        description: "Alertas o cambios pendientes.",
        previewClasses: "warning",
        sample: "Warning",
      },
      {
        name: ".error / .color-error / .text-error",
        description: "Errores o estados críticos.",
        previewClasses: "text-error",
        sample: "Error",
      },
      {
        name: ".border-error",
        description: "Borde para estados erróneos en formularios.",
        previewClasses: "border border-error px-3 py-1",
        sample: "Borde error",
      },
    ],
  },
  {
    title: "Fondos y overlays",
    items: [
      {
        name: ".bg-primary1 / .bg-primary2 / .bg-primary3 / .bg-primary4",
        description: "Colores principales usados en fondos y botones.",
        previewType: "block",
        previewClasses: "bg-primary1 text-white",
        sample: "bg-primary1",
      },
      {
        name: ".bg-secondary1 / .bg-secondary2",
        description: "Fondos secundarios oscuros o terrosos.",
        previewType: "block",
        previewClasses: "bg-secondary2 text-white",
        sample: "bg-secondary2",
      },
      {
        name: ".bg-neutral / .bg-neutral1 / .bg-neutral2 / .bg-neutral3 / .bg-neutral4",
        description: "Superficies elevadas y backgrounds suaves.",
        previewType: "block",
        previewClasses: "bg-neutral2",
        sample: "bg-neutral2",
      },
      {
        name: ".bg-light / .bg-dark",
        description: "Bases claras y oscuras para secciones.",
        previewType: "block",
        previewClasses: "bg-dark text-white",
        sample: "bg-dark",
      },
      {
        name: ".bg-gradient-auth",
        description: "Gradient usado en páginas de auth.",
        previewType: "block",
        previewClasses: "bg-gradient-auth",
        sample: "",
      },
      {
        name: ".hero-gradient-overlay",
        description: "Overlay en hero para contrastar imagen.",
        previewType: "block",
        previewClasses: "hero-gradient-overlay",
        sample: "",
      },
      {
        name: ".bg-cover / .section-bg-image",
        description: "Helpers para imágenes de sección.",
        previewType: "block",
        previewClasses: "bg-cover",
        sample: "",
      },
      {
        name: ".overlay-dark",
        description: "Overlay semitransparente oscuro.",
        previewType: "block",
        previewClasses: "overlay-dark",
        sample: "",
      },
      {
        name: ".overlay-soft",
        description: "Overlay suave para hover y cards.",
        previewType: "block",
        previewClasses: "overlay-soft",
        sample: "",
      },
      {
        name: ".overlay-light",
        description: "Overlay claro para secciones limpias.",
        previewType: "block",
        previewClasses: "overlay-light",
        sample: "",
      },
      {
        name: ".card-gradient-overlay",
        description: "Gradiente adicional en cards sobre imágenes.",
        previewType: "block",
        previewClasses: "card-gradient-overlay",
        sample: "",
      },
      {
        name: ".border-surface",
        description: "Border color para superficies elevadas.",
        previewClasses: "border border-surface px-3 py-1",
        sample: "border-surface",
      },
    ],
  },
  {
    title: "Helpers e interacciones",
    items: [
      {
        name: ".hero-navbar-offset",
        description: "Compensa el height del navbar en hero.",
        previewClasses: "hero-navbar-offset bg-white/80 px-3 py-1",
        sample: "Hero offset",
      },
      {
        name: ".focus-ring-primary",
        description: "Focus visual en elementos clave.",
        previewType: "button",
        previewClasses: "focus:ring-0 focus-visible:outline-none focus-ring-primary",
        sample: "Focus primary",
      },
      {
        name: ".focus-ring-secondary",
        description: "Focus más sutil para acciones secundarias.",
        previewType: "button",
        previewClasses: "focus:ring-0 focus-visible:outline-none focus-ring-secondary",
        sample: "Focus secondary",
      },
      {
        name: ".icon-button",
        description: "Base para botones circulares con iconos.",
        previewClasses: "icon-button rounded-full border px-3 py-1",
        sample: "Icon button",
      },
      {
        name: ".icon-button:disabled",
        description: "Estado deshabilitado con opacidad.",
        previewClasses: "icon-button cursor-not-allowed opacity-40 rounded-full border px-3 py-1",
        sample: "Icon disabled",
      },
    ],
  },
];

function UsagePanel({ items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-3 text-sm text-[var(--color-text)] shadow-sm">
      <ul className="list-disc space-y-1 pl-4">
        {items.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

export function StyleGuidePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [computedValues, setComputedValues] = useState({ colors: {}, spacings: {} });
  const activeTab = getTabFromPath(location.pathname) || DEFAULT_TAB;
  const [paginationPage, setPaginationPage] = useState(2);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [usagePanel, setUsagePanel] = useState(null);

  const handleTabChange = (tabId) => {
    const basePath = tabId === DEFAULT_TAB ? "/style-guide" : `/style-guide/${tabId}`;
    if (normalizePath(location.pathname) === normalizePath(basePath)) {
      return;
    }
    navigate(basePath);
  };

  useEffect(() => {
    const root = typeof document !== "undefined" ? document.documentElement : null;
    if (!root) return;

    const colors = {};
    const spacings = {};

    colorTokens.forEach(({ cssVar }) => {
      const value = getComputedStyle(root).getPropertyValue(cssVar);
      if (value) colors[cssVar] = value.trim();
    });

    spacingTokens.forEach(({ cssVar }) => {
      const value = getComputedStyle(root).getPropertyValue(cssVar);
      if (value) spacings[cssVar] = value.trim();
    });

    setComputedValues({ colors, spacings });
  }, []);

  const handleUsageToggle = (key) => {
    setUsagePanel((prev) => (prev === key ? null : key));
  };

  const [sectionTheme, setSectionTheme] = useState("light");
  const sectionBgClass = SECTION_THEME_STYLES[sectionTheme] ?? SECTION_THEME_STYLES.light;
  const sectionClass = (extra = "") =>
    `grid gap-6 rounded-3xl border p-6 shadow-md ${sectionBgClass.bg} ${sectionBgClass.border} ${extra}`.trim();
  const tableColumns = useMemo(() => SAMPLE_TABLE_COLUMNS, []);
  const tableData = useMemo(() => SAMPLE_TABLE_DATA, []);

  const tabContent = useMemo(() => {
    if (activeTab === "tokens") {
      return (
        <div className="space-y-6">
          <section className={sectionClass()}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Paleta de colores</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Los tokens que ya están en uso.</p>
              </div>
              <button
                type="button"
                onClick={() => handleUsageToggle("tokens.colors")}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                aria-label="Mostrar usos de colores"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {usagePanel === "tokens.colors" && <UsagePanel items={USAGE_REFERENCES["tokens.colors"]} />}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {colorTokens.map(({ label, cssVar, fallback, hint }) => (
                <article
                  key={cssVar}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] p-4 shadow-sm"
                >
                  <div
                    className="h-20 rounded-2xl border border-[var(--color-border-light)]"
                    style={{ backgroundColor: `var(${cssVar})` }}
                    aria-label={label}
                  />
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{label}</p>
                    <p className="text-xs uppercase tracking-[0.3rem] text-[var(--color-secondary2)]">{cssVar}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {computedValues.colors[cssVar] ?? fallback}
                    </p>
                    <p className="text-xs text-[var(--color-secondary2)]">{hint}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={sectionClass()}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Tipografías</h2>
                <p className="text-sm text-[var(--color-secondary2)]">Display, sans y serif.</p>
              </div>
              <button
                type="button"
                onClick={() => handleUsageToggle("tokens.typography")}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                aria-label="Mostrar usos de tipografía"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {usagePanel === "tokens.typography" && <UsagePanel items={USAGE_REFERENCES["tokens.typography"]} />}
            <div className="flex flex-col gap-4">
              {typographySamples.map(({ label, className, sample }) => (
                <div key={label} className="space-y-1 rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-neutral2)] p-4">
                  <p className="text-xs uppercase tracking-[0.4rem] text-[var(--color-secondary2)]">{label}</p>
                  <p className={className}>{sample}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={sectionClass()}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Espaciado</h2>
                <p className="text-sm text-[var(--color-secondary2)]">Valores para padding, margin y gap.</p>
              </div>
              <button
                type="button"
                onClick={() => handleUsageToggle("tokens.spacing")}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                aria-label="Mostrar usos de espaciado"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {usagePanel === "tokens.spacing" && <UsagePanel items={USAGE_REFERENCES["tokens.spacing"]} />}
            <div className="grid gap-3">
              {spacingTokens.map(({ label, cssVar, fallback }) => (
                <div
                  key={cssVar}
                  className="grid gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-neutral1)] p-4 shadow-sm sm:grid-cols-[1fr,auto]"
                >
                  <div
                    className="rounded-2xl border border-[var(--color-border-light)] bg-white/60 text-sm text-[var(--color-text)]"
                    style={{ padding: `var(${cssVar})` }}
                  >
                    <p className="text-xs uppercase tracking-[0.3rem] text-[var(--color-secondary2)]">{label}</p>
                    <p className="text-sm font-medium text-[var(--color-primary2)]">Padding aplicado con {cssVar}</p>
                  </div>
                  <div className="text-right text-xs text-[var(--color-secondary2)]">
                    {computedValues.spacings[cssVar] ?? fallback}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "componentes") {
      return (
        <div className="space-y-6">
          <section className={sectionClass("gap-4")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Botones</h2>
                <p className="text-sm text-[var(--color-secondary2)]">Todas las variantes del componente Button.</p>
              </div>
              <button
                type="button"
                onClick={() => handleUsageToggle("buttons")}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                aria-label="Mostrar usos de botones"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {usagePanel === "buttons" && <UsagePanel items={USAGE_REFERENCES.buttons} />}
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map(({ label, appearance, intent, shape }) => (
                <Button
                  key={`${label}-${appearance}-${intent}-${shape ?? "default"}`}
                  appearance={appearance}
                  intent={intent}
                  shape={shape}
                  motion="lift"
                >
                  {label}
                </Button>
              ))}
              <IconButton
                icon={<ShoppingCart />}
                aria-label="Icono"
                intent="primary"
              />
              <AnimatedCTAButton icon={<Star />} label="Descubrir" className="mt-2">
                CTA animado
              </AnimatedCTAButton>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className="text-sm font-semibold uppercase tracking-[0.4rem] text-[var(--color-secondary2)]">Tamaños</div>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          <section className={sectionClass("gap-4")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Badges y Pills</h2>
                <p className="text-sm text-[var(--color-secondary2)]">Etiquetas para estados y filtros rápidos.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUsageToggle("badges")}
                  className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                  aria-label="Mostrar usos de badges"
                >
                  <Info className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleUsageToggle("pills")}
                  className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                  aria-label="Mostrar usos de pills"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>
            {usagePanel === "badges" && <UsagePanel items={USAGE_REFERENCES.badges} />}
            <div className="flex flex-wrap gap-3">
              {badgeVariants.map((variant) => (
                <Badge key={variant} variant={variant}>
                  {variant}
                </Badge>
              ))}
            </div>
            {usagePanel === "pills" && <UsagePanel items={USAGE_REFERENCES.pills} />}
            <div className="flex flex-wrap gap-3 pt-3">
              {pillVariants.map((variant) => (
                <Pill key={variant} variant={variant}>
                  {variant}
                </Pill>
              ))}
            </div>
          </section>

          <section className={sectionClass("gap-4")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Componentes interactivos</h2>
                <p className="text-sm text-[var(--color-secondary2)]">Accordion, paginación y buscador.</p>
              </div>
              <button
                type="button"
                onClick={() => handleUsageToggle("components")}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                aria-label="Mostrar usos de componentes interactivos"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {usagePanel === "components" && <UsagePanel items={USAGE_REFERENCES.components} />}
            <Accordion
              sections={[
                { title: "Accordion activo", content: "Este acordeón puede expandirse y colapsarse para mostrar contenido adicional." },
                { title: "Accordion cerrado", content: "Útil para FAQs o ayudas rápidas en la guía." },
              ]}
            />
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-neutral1)] p-4">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm font-semibold text-[var(--color-secondary2)]">Paginación</p>
                <Pagination
                  page={paginationPage}
                  totalPages={6}
                  totalItems={60}
                  onPageChange={(page) => setPaginationPage(page)}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--color-secondary2)]">Página actual: {paginationPage}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-primary1)]">SearchBar</p>
                  <p className="text-xs text-[var(--color-secondary2)]">Se abre con un overlay y centra el formulario de búsqueda.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm font-medium text-[var(--color-primary1)] transition hover:border-[var(--color-primary1)]"
                >
                  Abrir buscador
                </button>
              </div>
              <SearchBar
                isOpen={isSearchOpen}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onSubmit={(event) => {
                  event.preventDefault();
                  setIsSearchOpen(false);
                }}
                onClose={() => setIsSearchOpen(false)}
              />
              <p className="mt-3 text-xs text-[var(--color-secondary2)]">
                Valor actual: <strong>{searchValue || "vacío"}</strong>
              </p>
            </div>
          </section>
          
          <section className={sectionClass("gap-4")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Data display</h2>
                <p className="text-sm text-[var(--color-secondary2)]">Breadcrumbs, precios y tablas que se usan en páginas clave.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-4">
                <p className="text-xs text-[var(--color-secondary2)]">Breadcrumbs</p>
                <Breadcrumbs items={SAMPLE_BREADCRUMBS} />
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-4">
                <p className="text-xs text-[var(--color-secondary2)]">Price</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Price value={42000} className="text-[var(--color-primary1)] text-2xl font-semibold" />
                  <Price value={128000} currency="USD" className="text-lg text-[var(--color-secondary2)]" />
                  <span className="text-xs text-[var(--color-secondary2)]">compatible con CLP y divisas.</span>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 p-4">
                <p className="text-xs text-[var(--color-secondary2)] mb-3">TanstackDataTable</p>
                <TanstackDataTable columns={tableColumns} data={tableData} loading={false} />
              </div>
            </div>
          </section>
          <section className={sectionClass("gap-4")}>
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Overlays y gradientes</h2>
              <p className="text-sm text-[var(--color-secondary2)]">Prueba los overlays sobre una imagen y ve los gradients usados en la app.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                {OVERLAY_SAMPLES.map((overlay) => (
                  <div
                    key={overlay.name}
                    className="relative overflow-hidden rounded-3xl border border-[var(--color-border)]"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1505691723518-36a5d3c3f70d?q=80&w=800&auto=format&fit=crop"
                      alt={`${overlay.name} demo`}
                      className="h-48 w-full object-cover"
                    />
                    <div className={`absolute inset-0 ${overlay.className}`} aria-hidden />
                    <div className="relative z-10 p-4 text-sm font-semibold text-white">
                      {overlay.name} — {overlay.hint}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {GRADIENT_SAMPLES.map((gradient) => (
                  <article
                    key={gradient.label}
                    className="flex min-h-[80px] items-center justify-between rounded-2xl border border-[var(--color-border)] p-4 text-sm"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.4rem] text-[var(--color-secondary2)]">{gradient.label}</p>
                      <p className="text-[var(--color-text-muted)]">{gradient.description}</p>
                    </div>
                    <div className={`h-12 w-20 rounded-2xl border ${gradient.className}`} aria-hidden />
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className={sectionClass("gap-4")}>
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Hover y focus</h2>
              <p className="text-sm text-[var(--color-secondary2)]">Interactúa para ver cómo cambian botones, tarjetas e iconos.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {HOVER_PREVIEWS.map((preview) => (
                <article
                  key={preview.name}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-white/95 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3rem] text-[var(--color-secondary2)]">{preview.name}</p>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${preview.className}`} aria-hidden>
                      {preview.hint}
                    </span>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-xs">{preview.hint}</p>
                </article>
              ))}
            </div>
          </section>
          <section className={sectionClass("gap-4")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Componentes de página</h2>
                <p className="text-sm text-[var(--color-secondary2)]">Cards de categorías y productos que aparecen en múltiples pantallas.</p>
              </div>
              <button
                type="button"
                onClick={() => handleUsageToggle("pageComponents")}
                className="rounded-full border border-[var(--color-border)] p-2 text-[var(--color-secondary2)] transition hover:border-[var(--color-primary1)] hover:text-[var(--color-primary1)]"
                aria-label="Mostrar usos de componentes de página"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            {usagePanel === "pageComponents" && <UsagePanel items={USAGE_REFERENCES.pageComponents} />}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-neutral1)] p-4">
                <p className="text-sm font-semibold text-[var(--color-secondary2)]">CategoriesCard · hero & featured</p>
                <CategoriesCard category={SAMPLE_CATEGORIES[0]} variant="hero" />
                <CategoriesCard category={SAMPLE_CATEGORIES[1]} variant="featured" />
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-neutral1)] p-4">
                <p className="text-sm font-semibold text-[var(--color-secondary2)]">ProductCard · listados</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <ProductCard product={SAMPLE_PRODUCT} showBadge badgeText="NUEVO" />
                  <ProductCard product={SAMPLE_PRODUCT} showBadge badgeText="DESTACADO" />
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <section className={sectionClass()}>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-[var(--color-primary1)]">Utilidades CSS</h2>
            <p className="text-sm text-[var(--color-secondary2)]">Clases utilitarias definidas en `global.css` organizadas por tipo.</p>
          </div>
          <Accordion
            sections={UTILITY_GROUPS.map((group) => ({
              title: group.title,
              render: () => (
                <div className="grid gap-4 md:grid-cols-2">
                  {group.items.map((item) => (
                    <article
                      key={item.name}
                      className="flex min-w-0 flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-white/95 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.4rem] text-[var(--color-secondary2)]">{item.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{item.description}</p>
                      {item.previewType === "block" ? (
                        <div className={`mt-2 h-10 w-full rounded ${item.previewClasses ?? ""}`} aria-hidden />
                      ) : item.previewType === "button" ? (
                        <button
                          type="button"
                          className={`mt-2 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold ${item.previewClasses ?? ""}`}
                        >
                          {item.sample}
                        </button>
                      ) : (
                        <span
                          className={`mt-2 inline-flex w-fit rounded-full bg-[var(--color-primary1)/10] px-3 py-1 text-xs font-semibold ${item.previewClasses ?? ""}`}
                        >
                          {item.sample}
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              ),
            }))}
          />
        </section>
      </div>
    );
  }, [
    activeTab,
    computedValues.colors,
    computedValues.spacings,
    isSearchOpen,
    paginationPage,
    searchValue,
    usagePanel,
    sectionClass,
    tableColumns,
    tableData,
  ]);

  return (
    <div className="page px-6 pb-20 pt-[110px]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-3 rounded-3xl border border-[var(--color-border)] bg-white/80 p-6 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.4rem] text-[var(--color-secondary2)]">
            Guía de estilos
          </p>
          <h1 className="font-display text-3xl text-[var(--color-primary1)]">Vista previa de tokens y componentes</h1>
          <p className="max-w-3xl text-[var(--color-secondary1)]">
            Los estilos se mapean directamente desde los tokens globales y los componentes reales para que puedas
            verificar sus variantes en vivo.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {STYLE_GUIDELINE_SUMMARY.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-[var(--color-border)] bg-white/80 p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--color-secondary2)]">
                Guía actualizada
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[var(--color-primary1)]">{card.title}</h3>
              <p className="text-sm text-[var(--color-secondary1)]">{card.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-secondary2)] list-disc list-inside">
                {card.highlights.map((highlight, index) => (
                  <li key={`${card.title}-${index}`}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--color-border-light)] bg-white/90 px-4 py-3 shadow-md">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[var(--color-primary1)] text-white shadow-[0_10px_30px_rgba(68,49,20,0.25)]"
                  : "text-[var(--color-secondary2)] hover:text-[var(--color-primary1)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--color-secondary2)] shadow-inner">
            <span>Fondo</span>
            {Object.keys(SECTION_THEME_STYLES).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setSectionTheme(theme)}
                className={`rounded-full px-3 py-1 text-[.65rem] transition ${
                  sectionTheme === theme
                    ? "bg-[var(--color-primary1)] text-white shadow-[0_6px_12px_rgba(68,49,20,0.35)]"
                    : "text-[var(--color-secondary2)] hover:text-[var(--color-primary1)]"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {tabContent}
      </div>
    </div>
  );
}
