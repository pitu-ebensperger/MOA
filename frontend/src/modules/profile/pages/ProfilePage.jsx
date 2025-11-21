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

  // Limpieza de seguridad: remover overlays trabados al montar
  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
      document.body.style.removeProperty('overflow');
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    wishlistApi.get()
      .then(data => {
        setWishlistItems(data.items || []);
      })
      .catch(err => console.error("Error cargando wishlist:", err));
  }, [token]);

  const handleRemoveFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => 
      String(item.id) !== String(productId) && 
      String(item.producto_id) !== String(productId)
    ));
  };

  const {
    orders = [],
    isLoading,
    error,
  } = useUserOrders({ limit: 4 });

  return (
    <div className="min-h-screen bg-(--color-light) pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
        <UserInfoSection />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <WishlistSection 
            products={wishlistItems} 
            isLoading={isLoading} 
            error={error}
            onRemove={handleRemoveFromWishlist}
          />

          <OrderSection 
            orders={orders} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
};

