import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card.jsx';
import { Button } from '@/components/shadcn/ui/button.jsx';
import { useAuth } from '@/context/auth-context.js';
import { useNavigate } from 'react-router-dom';

const WishlistProductCard = ({ product, onRemove, onAddToCart, onView }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <div 
      className="group rounded-xl overflow-hidden transition-all hover:shadow-md"
      style={{ 
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: 'var(--color-light-beige)' }}>
        {product.imagen_url ? (
          <img 
            src={product.imagen_url} 
            alt={product.nombre}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Heart className="h-12 w-12" style={{ color: 'var(--color-neutral)' }} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/95 hover:bg-white rounded-full w-9 h-9"
          onClick={() => onRemove(product.producto_id)}
        >
          <Trash2 className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
        </Button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 
            className="font-semibold text-base line-clamp-1 mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {product.nombre}
          </h3>
          {product.categoria && (
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {product.categoria}
            </p>
          )}
        </div>
        
        <p 
          className="text-lg font-bold"
          style={{ color: 'var(--color-primary1)' }}
        >
          {formatPrice(product.precio)}
        </p>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 rounded-full"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary1)'
            }}
            onClick={() => onView(product.producto_id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button 
            size="sm" 
            className="flex-1 rounded-full"
            style={{
              backgroundColor: 'var(--color-primary1)',
              color: 'var(--color-white)'
            }}
            onClick={() => onAddToCart(product.producto_id)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};

export const WishlistTab = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, [token]);

  const loadWishlist = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3000/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al cargar wishlist');

      const data = await response.json();
      setWishlistItems(data.items || []);
    } catch (err) {
      console.error('Error al cargar wishlist:', err);
      setError('Error al cargar tu lista de deseos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setWishlistItems(prev => prev.filter(item => item.producto_id !== productId));
    } catch (err) {
      console.error('Error al eliminar de wishlist:', err);
      alert('Error al eliminar el producto');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:3000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ producto_id: productId, cantidad: 1 })
      });

      if (!response.ok) throw new Error('Error al agregar al carrito');

      // Opcional: remover de wishlist después de agregar al carrito
      // handleRemove(productId);
      
      alert('Producto agregado al carrito');
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      alert('Error al agregar al carrito');
    }
  };

  const handleView = (productId) => {
    navigate(`/producto/${productId}`);
  };

  if (loading) {
    return (
      <div 
        className="rounded-xl p-8"
        style={{ 
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex items-center justify-center py-12">
          <div 
            className="animate-spin rounded-full h-10 w-10 border-b-2"
            style={{ borderColor: 'var(--color-primary1)' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ 
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Header */}
      <div 
        className="px-6 lg:px-8 py-6 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2 
          className="text-xl lg:text-2xl font-semibold mb-1"
          style={{ 
            fontFamily: 'var(--font-display)',
            color: 'var(--color-primary2)'
          }}
        >
          Lista de Deseos
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {wishlistItems.length > 0 
            ? `Tienes ${wishlistItems.length} producto${wishlistItems.length > 1 ? 's' : ''} guardado${wishlistItems.length > 1 ? 's' : ''}`
            : 'Guarda tus productos favoritos para verlos más tarde'
          }
        </p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-6">
        {error && (
          <div 
            className="p-4 rounded-lg mb-6"
            style={{ 
              backgroundColor: 'rgba(184, 131, 107, 0.1)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)'
            }}
          >
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-light-beige)' }}
            >
              <Heart className="h-10 w-10" style={{ color: 'var(--color-primary3)' }} />
            </div>
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Tu lista está vacía
            </h3>
            <p 
              className="mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Agrega productos a tu lista de deseos para guardarlos
            </p>
            <Button 
              onClick={() => navigate('/productos')}
              className="rounded-full"
              style={{
                backgroundColor: 'var(--color-primary1)',
                color: 'var(--color-white)'
              }}
            >
              Explorar productos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map(product => (
              <WishlistProductCard
                key={product.producto_id}
                product={product}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
