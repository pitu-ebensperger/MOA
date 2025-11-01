//import { motion } from "motion/react";
import { HeroSection } from "../components/HeroSection";
import { ProductsSection } from "../components/ProductsSection";
import { CategoriesFilter } from "../components/ModernCategories";
import {ContactSection} from  "../components/ContactSection";

export const Home = () => {
  return (
    <div>
    <HeroSection> </HeroSection>
    <CategoriesFilter> </CategoriesFilter>
    <ProductsSection> </ProductsSection>

    <ContactSection></ContactSection>
    </div>
  )
}
