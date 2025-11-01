//import { motion } from "motion/react";
import { HeroSection } from "../components/HeroSection";
import { ProductsSection } from "../components/ProductsSection";
import { CategoriesMenu } from "../components/CategoriesMenu";
import { ContactSection } from  "../components/ContactSection";

export const HomePage = () => {
  return (
    <div>
    <HeroSection /> 
    <CategoriesMenu /> 

    <ProductsSection />

    <ContactSection />
    </div>
  )
}
