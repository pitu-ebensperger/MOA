import { useState, useEffect } from "react";
import UserInfoSection from '@/modules/profile/components/UserInfoSection.jsx'
import WishlistSection from '@/modules/profile/components/WishlistSection.jsx'
import OrderSection from '@/modules/profile/components/MyOrdersSection.jsx'
import { AddressesSection } from '@/modules/profile/components/AddressesSection.jsx'
import { useProducts } from '@/modules/products/hooks/useProducts.js'
import { useAuth } from "@/context/auth-context.js"

const PROFILE_PRODUCT_FILTERS = Object.freeze({ limit: 12 });

export const ProfilePage = () => {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/wishlist", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Wishlist cargada:", data);
        setWishlistItems(data.items || []);
      })
      .catch(err => console.error("Error cargando wishlist:", err));
  }, [token]);

  const {
    products = [],
    isLoading,
    error,
  } = useProducts(PROFILE_PRODUCT_FILTERS);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <UserInfoSection />

      <AddressesSection />

      <WishlistSection 
        products={wishlistItems} 
        isLoading={isLoading} 
        error={error} 
      />

      <OrderSection 
        products={products} 
        isLoading={isLoading} 
        error={error} 
      />
    </div>
  );
};

