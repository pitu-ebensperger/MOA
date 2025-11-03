import HeroSection from "../../../components/layout/HeroSection.jsx";
import ProductsSection from "../components/ProductsSection.jsx";
import CategoriesMenu from "../components/CategoriesMenu.jsx";
import ContactSection from "../components/ContactSection.jsx";
import { CATEGORIES, PRODUCTS } from "../../../utils/mockdata.js";

export const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <CategoriesMenu categories={CATEGORIES} />
      <ProductsSection categories={CATEGORIES} products={PRODUCTS} />
      <ContactSection />
    </div>
  );
};
