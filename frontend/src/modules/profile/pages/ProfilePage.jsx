import UserInfoSection from '../components/UserInfoSection.jsx';
import WishlistSection from '../components/WishlistSection.jsx';
import OrderSection from '../components/MyOrdersSection.jsx';
import { useProducts } from '../../products/hooks/useProducts.js';

export const ProfilePage = () => {
  const {
    products = [],
    isLoading,
    error,
  } = useProducts({ limit: 12 });

  return (
    <div>
      <UserInfoSection />
      <WishlistSection products={products} isLoading={isLoading} error={error} />
      <OrderSection products={products} isLoading={isLoading} error={error} />
    </div>
  );
};
