import HeroSection from "../components/HeroSection.jsx";
import ProductsSection from "../components/ProductsSection.jsx";
import CategoriesMenu from "../components/CategoriesMenu.jsx";
import ContactSection from "../components/ContactSection.jsx";
import { CATEGORIES, PRODUCTS } from "../../../utils/mockdata.js";

export const HomePage = () => {
  return (
    <div className="page p-0">
      <CategoriesMenu categories={CATEGORIES} />
      <HeroSection />
      <ProductsSection categories={CATEGORIES} products={PRODUCTS} />
      <ContactSection />
    </div>
  );
};
