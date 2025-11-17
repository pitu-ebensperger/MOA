import { useState, useEffect } from 'react';
import { Package, Eye, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card.jsx';
import { Button } from '@/components/shadcn/ui/button.jsx';
import { Badge } from '@/components/shadcn/ui/badge.jsx';
import { useAuth } from '@/context/auth-context.js';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  'pendiente': { label: 'Pendiente', variant: 'secondary', color: 'bg-yellow-500' },
  'procesando': { label: 'Procesando', variant: 'default', color: 'bg-blue-500' },
  'enviado': { label: 'Enviado', variant: 'default', color: 'bg-purple-500' },
  'entregado': { label: 'Entregado', variant: 'default', color: 'bg-green-500' },
  'cancelado': { label: 'Cancelado', variant: 'destructive', color: 'bg-red-500' }
};

const OrderCard = ({ order, onClick }) => {
  const statusConfig = STATUS_CONFIG[order.estado_pedido] || STATUS_CONFIG.pendiente;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  return (
    <div 
      className="rounded-xl p-6 transition-all cursor-pointer hover:shadow-md"
      style={{ 
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onClick={() => onClick(order)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-light-beige)' }}
            >
              <Package className="h-5 w-5" style={{ color: 'var(--color-primary1)' }} />
            </div>
            <h3 
              className="font-semibold text-lg"
              style={{ color: 'var(--color-text)' }}
            >
              Pedido #{order.codigo_pedido}
            </h3>
          </div>
          <div 
            className="flex items-center gap-2 text-sm ml-13"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Calendar className="h-4 w-4" />
            {formatDate(order.fecha_pedido)}
          </div>
        </div>
        <Badge 
          variant={statusConfig.variant} 
          className="whitespace-nowrap rounded-full px-3"
          style={{
            backgroundColor: statusConfig.color === 'bg-green-500' ? 'rgba(122, 139, 111, 0.15)' :
                             statusConfig.color === 'bg-yellow-500' ? 'rgba(184, 149, 106, 0.15)' :
                             statusConfig.color === 'bg-blue-500' ? 'rgba(107, 84, 68, 0.15)' :
                             statusConfig.color === 'bg-purple-500' ? 'rgba(166, 123, 91, 0.15)' :
                             'rgba(184, 131, 107, 0.15)',
            color: statusConfig.color === 'bg-green-500' ? 'var(--color-success)' :
                   statusConfig.color === 'bg-yellow-500' ? 'var(--color-warning)' :
                   statusConfig.color === 'bg-blue-500' ? 'var(--color-primary1)' :
                   statusConfig.color === 'bg-purple-500' ? 'var(--color-primary3)' :
                   'var(--color-error)',
            border: 'none'
          }}
        >
          <div 
            className="w-2 h-2 rounded-full mr-2"
            style={{
              backgroundColor: statusConfig.color === 'bg-green-500' ? 'var(--color-success)' :
                              statusConfig.color === 'bg-yellow-500' ? 'var(--color-warning)' :
                              statusConfig.color === 'bg-blue-500' ? 'var(--color-primary1)' :
                              statusConfig.color === 'bg-purple-500' ? 'var(--color-primary3)' :
                              'var(--color-error)'
            }}
          />
          {statusConfig.label}
        </Badge>
      </div>

      <div 
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div 
          className="flex items-center gap-2 text-lg font-semibold"
          style={{ color: 'var(--color-primary1)' }}
        >
          <DollarSign className="h-5 w-5" />
          {formatPrice(order.total)}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-full"
          style={{ color: 'var(--color-primary1)' }}
        >
          Ver detalles
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export const OrdersTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user?.id_usuario) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3000/api/orders/user/${user.id_usuario}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar pedidos');

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    // Navegar a detalle del pedido (implementar ruta)
    console.log('Ver detalle de pedido:', order);
    // navigate(`/pedido/${order.pedido_id}`);
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
          Historial de Pedidos
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Revisa el estado de tus compras y accede a los detalles de cada pedido
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

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-light-beige)' }}
            >
              <Package className="h-10 w-10" style={{ color: 'var(--color-primary3)' }} />
            </div>
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              No tienes pedidos
            </h3>
            <p 
              className="mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Cuando realices una compra, aparecerá aquí
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
          <div className="grid gap-4">
            {orders.map(order => (
              <OrderCard 
                key={order.pedido_id} 
                order={order}
                onClick={handleOrderClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
