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

    wishlistApi.getWishlist()
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
    <div>
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
  );
};

