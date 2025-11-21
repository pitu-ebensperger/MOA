import { useState, useEffect } from "react";
import UserInfoSection from '../components/UserInfoSection.jsx';
import WishlistSection from '../components/WishlistSection.jsx';
import OrderSection from '../components/MyOrdersSection.jsx';
import { useUserOrders } from '../../../hooks/useUserOrders.js';
import { useAuth } from "../../../context/auth-context.js";
import { wishlistApi } from '../../../services/wishlist.api.js';

export const ProfilePage = () => {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!token) return;

    wishlistApi.get()
      .then(data => {
        console.log("Wishlist cargada:", data);
        setWishlistItems(data.items || []);
      })
      .catch(err => console.error("Error cargando wishlist:", err));
  }, [token]);

  const {
    orders = [],
    isLoading,
    error,
  } = useUserOrders({ limit: 4 });

  return (
    <div className="page min-h-screen bg-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <UserInfoSection />

        <WishlistSection 
          products={wishlistItems} 
          isLoading={isLoading} 
          error={error} 
        />

        <OrderSection 
          orders={orders} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
  );
};

