import { motion } from "motion/react";
import HeroSection from "../components/HeroSection";
import ProductsSection from "../components/ProductsSection";
import CategoriesFilters from "../components/CategoriesFilters";
import ContactSection from "../components/ContactSection";
import { Footer } from "../../../components/layout/Footer";

export const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Empieza invisible y ligeramente desplazado hacia abajo
      animate={{ opacity: 1, y: 0 }} // Luego aparece y sube a su posición normal
      transition={{ duration: 0.6 }}  // En 0.6 segundos
    >
      <HeroSection />
      <CategoriesFilters />
      <ProductsSection />
      <ContactSection />
      <Footer/>
    </motion.div>
  );
};
