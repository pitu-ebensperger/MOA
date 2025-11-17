import { useState, useEffect } from "react";
import UserInfoSection from '../components/UserInfoSection.jsx';
import WishlistSection from '../components/WishlistSection.jsx';
import OrderSection from '../components/MyOrdersSection.jsx';
import { useProducts } from '../../products/hooks/useProducts.js';
import { useAuth } from "../../../context/auth-context.js";

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
    <div>
      <UserInfoSection />

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

