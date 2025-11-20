import { useState, useEffect, useCallback } from 'react';
import { createStrictContext } from '@/context/createStrictContext'
import { useAuth } from '@/context/auth-context'
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from '@/services/payment.api';

const [PaymentContext, usePaymentMethodsStrict] = createStrictContext('Payment', {
  displayName: 'PaymentContext',
  errorMessage: 'usePaymentMethods debe usarse dentro de PaymentProvider',
});

/**
 * Hook para usar el contexto de métodos de pago
 */
export const usePaymentMethods = usePaymentMethodsStrict;

export const PaymentProvider = ({ children }) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultPaymentMethod, setDefaultPaymentMethodState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar métodos de pago desde el backend
   */
  const loadPaymentMethods = useCallback(async () => {
    if (!user) {
      setPaymentMethods([]);
      setDefaultPaymentMethodState(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPaymentMethods();
      setPaymentMethods(data);
      
      // Encontrar método predeterminado
      const defaultMethod = data.find(method => method.predeterminado);
      setDefaultPaymentMethodState(defaultMethod || null);
    } catch (err) {
      console.error('Error cargando métodos de pago:', err);
      setError(err.response?.data?.message || 'Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Agregar nuevo método de pago
   */
  const addPaymentMethod = async (paymentData) => {
    setError(null);

    try {
      const newMethod = await createPaymentMethod(paymentData);
      
      // Si es el primer método o está marcado como predeterminado
      if (paymentMethods.length === 0 || paymentData.predeterminado) {
        setDefaultPaymentMethodState(newMethod);
        setPaymentMethods(prev => [
          ...prev.map(method => ({ ...method, predeterminado: false })),
          newMethod
        ]);
      } else {
        setPaymentMethods(prev => [...prev, newMethod]);
      }

      return newMethod;
    } catch (err) {
      console.error('Error agregando método de pago:', err);
      setError(err.response?.data?.message || 'Error al agregar método de pago');
      throw err;
    }
  };

  /**
   * Actualizar método de pago existente
   */
  const updateExistingPaymentMethod = async (metodoPagoId, paymentData) => {
    setError(null);

    try {
      const updatedMethod = await updatePaymentMethod(metodoPagoId, paymentData);
      
      setPaymentMethods(prev => 
        prev.map(method => 
          method.metodo_pago_id === metodoPagoId ? updatedMethod : method
        )
      );

      // Si este era el método predeterminado, actualizarlo
      if (defaultPaymentMethod?.metodo_pago_id === metodoPagoId) {
        setDefaultPaymentMethodState(updatedMethod);
      }

      return updatedMethod;
    } catch (err) {
      console.error('Error actualizando método de pago:', err);
      setError(err.response?.data?.message || 'Error al actualizar método de pago');
      throw err;
    }
  };

  /**
   * Marcar método de pago como predeterminado
   */
  const setDefault = async (metodoPagoId) => {
    setError(null);

    try {
      await setDefaultPaymentMethod(metodoPagoId);
      
      // Actualizar estado local
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          predeterminado: method.metodo_pago_id === metodoPagoId
        }))
      );

      const newDefault = paymentMethods.find(method => method.metodo_pago_id === metodoPagoId);
      setDefaultPaymentMethodState(newDefault || null);

      return newDefault;
    } catch (err) {
      console.error('Error estableciendo método de pago predeterminado:', err);
      setError(err.response?.data?.message || 'Error al establecer método de pago predeterminado');
      throw err;
    }
  };

  /**
   * Eliminar método de pago
   */
  const removePaymentMethod = async (metodoPagoId) => {
    setError(null);

    try {
      await deletePaymentMethod(metodoPagoId);
      
      // Si eliminamos el método predeterminado, el backend asignará otro automáticamente
      // Recargar todos los métodos para obtener el nuevo estado
      await loadPaymentMethods();
    } catch (err) {
      console.error('Error eliminando método de pago:', err);
      setError(err.response?.data?.message || 'Error al eliminar método de pago');
      throw err;
    }
  };

  /**
   * Formatear método de pago para mostrar
   */
  const formatPaymentMethod = (method) => {
    if (!method) return '';
    
    const tipo = method.tipo_metodo === 'credito' ? 'Crédito' : 'Débito';
    return `${tipo} •••• ${method.ultimos_digitos}`;
  };

  /**
   * Obtener icono según tipo de tarjeta
   */
  const getCardIcon = (tipoMetodo) => {
    return tipoMetodo === 'credito' ? 'CreditCard' : 'CreditCard';
  };

  // Cargar métodos de pago cuando el usuario se autentica
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  const value = {
    // Estado
    paymentMethods,
    defaultPaymentMethod,
    loading,
    error,

    // Métodos
    loadPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod: updateExistingPaymentMethod,
    setDefault,
    removePaymentMethod,
    formatPaymentMethod,
    getCardIcon,

    // Helpers
    hasPaymentMethods: paymentMethods.length > 0,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
