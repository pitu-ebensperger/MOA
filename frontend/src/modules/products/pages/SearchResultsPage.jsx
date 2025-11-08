import { Breadcrumbs } from "../../../components/layout/Breadcrumbs.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardA from "../components/ProductCardA.jsx";

const SAMPLE_PRODUCT = {
  id: "sample-1",
  title: "Butaca artesanal en lino",
  price: 85000,
  image:
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop",
};

const SearchResultsPage = () => (
  <main className="page container-px mx-auto max-w-5xl py-10">
    <Breadcrumbs
      className="mb-6"
      items={[
        { label: "Inicio", href: "/" },
        { label: "Productos", href: "/products" },
        { label: "Búsqueda" },
      ]}
    />
    <h1 className="title-serif text-3xl">Resultados de búsqueda</h1>
    <section className="mt-8 space-y-4">
      <p className="text-sm text-neutral-600">
        Vista rápida para comparar el componente actual y la nueva variante <code>ProductCardA</code>.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <ProductCard product={SAMPLE_PRODUCT} />
        <ProductCardA
          id={SAMPLE_PRODUCT.id}
          productName={SAMPLE_PRODUCT.title}
          price={SAMPLE_PRODUCT.price}
          imageUrl={SAMPLE_PRODUCT.image}
          showBadge
          badgeText="NUEVA TEMPORADA"
        />
      </div>
    </section>
  </main>
);

export default SearchResultsPage;
