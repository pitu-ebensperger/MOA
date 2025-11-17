import { useState, useEffect } from 'react';
import { User, Package, Heart, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/ui/tabs.jsx';
import { UserInfoTab } from '@/modules/profile/components/tabs/UserInfoTab.jsx';
import { OrdersTab } from '@/modules/profile/components/tabs/OrdersTab.jsx';
import { WishlistTab } from '@/modules/profile/components/tabs/WishlistTab.jsx';
import { AddressesTab } from '@/modules/profile/components/tabs/AddressesTab.jsx';
import { useAuth } from '@/context/auth-context.js';
import '../styles/ProfilePage.css';
import { useLocation } from 'react-router-dom';

export const ProfilePage = ({ initialTab = 'profile' }) => {
  const location = useLocation();
  const locationInitialTab = location.state?.initialTab;
  const [activeTab, setActiveTab] = useState(locationInitialTab ?? initialTab);
  const { user } = useAuth();

  useEffect(() => {
    setActiveTab(locationInitialTab ?? initialTab);
  }, [locationInitialTab, initialTab]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral1)' }}>
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, var(--color-light-beige) 0%, var(--color-beige) 100%)`,
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Avatar + Info */}
            <div className="flex items-center gap-6">
              <div 
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-semibold"
                style={{ 
                  backgroundColor: 'var(--color-primary1)',
                  color: 'var(--color-white)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 
                  className="text-2xl lg:text-4xl font-bold mb-1"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-primary2)'
                  }}
                >
                  {user?.nombre ? `${user.nombre} ${user.apellido || ''}` : 'Mi Cuenta'}
                </h1>
                <p 
                  className="text-sm lg:text-base"
                  style={{ color: 'var(--color-secondary1)' }}
                >
                  {user?.email || 'Gestiona tu información personal y pedidos'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tabs Navigation - Horizontal Pills */}
          <div 
            className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--color-border) transparent'
            }}
          >
            <TabsList 
              className="inline-flex p-1 rounded-full w-auto min-w-full sm:min-w-0"
              style={{ 
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-full transition-all data-[state=active]:shadow-sm whitespace-nowrap"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-full transition-all data-[state=active]:shadow-sm whitespace-nowrap"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                <Package className="h-4 w-4" />
                <span>Mis Pedidos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="wishlist" 
                className="flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-full transition-all data-[state=active]:shadow-sm whitespace-nowrap"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                <Heart className="h-4 w-4" />
                <span>Lista de Deseos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="addresses" 
                className="flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-full transition-all data-[state=active]:shadow-sm whitespace-nowrap"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 'var(--weight-medium)',
                }}
              >
                <MapPin className="h-4 w-4" />
                <span>Direcciones</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="profile" className="mt-0">
            <UserInfoTab />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="wishlist" className="mt-0">
            <WishlistTab />
          </TabsContent>

          <TabsContent value="addresses" className="mt-0">
            <AddressesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
