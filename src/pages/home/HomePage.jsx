import { HeroSection } from "../components/HeroSection.jsx";
import { FeaturedCategories } from "../components/FeaturedCategories.jsx";
import { FeaturedProducts } from "../components/FeaturedProducts.jsx";

const HomePage = () => (
  <main>
    <HeroSection />
    <FeaturedCategories />
    <FeaturedProducts />
  </main>
);

export default HomePage;
