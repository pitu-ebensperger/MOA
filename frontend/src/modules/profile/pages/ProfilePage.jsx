import UserInfoSection from '../components/UserInfoSection.jsx'
import WishlistSection from '../components/WishlistSection.jsx'
import OrderSection from '../components/MyOrdersSection.jsx'

export const ProfilePage = () => {
  return (
    <div>
      <UserInfoSection />
      <WishlistSection />
      <OrderSection />
    </div>
  )
}