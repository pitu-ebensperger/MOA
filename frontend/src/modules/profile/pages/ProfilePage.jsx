import UserInfoSection from '../components/UserInfoSection.jsx';
import WishlistSection from '../components/WishlistSection.jsx';
import OrderSection from '../components/MyOrdersSection.jsx';
import { useProducts } from '../../products/hooks/useProducts.js';

const PROFILE_PRODUCT_FILTERS = Object.freeze({ limit: 12 });

export const ProfilePage = () => {
  const {
    products = [],
    isLoading,
    error,
  } = useProducts(PROFILE_PRODUCT_FILTERS);

  return (
    <div>
      <UserInfoSection />
      <WishlistSection products={products} isLoading={isLoading} error={error} />
      <OrderSection products={products} isLoading={isLoading} error={error} />
    </div>
  );
};
