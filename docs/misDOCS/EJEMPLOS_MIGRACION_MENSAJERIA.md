/**
 * Ejemplos de migración del sistema antiguo al nuevo sistema unificado
 * 
 * Este archivo muestra ejemplos prácticos de cómo migrar desde:
 * - window.confirm / window.alert
 * - SweetAlert2 (Swal.fire)
 * - Alerts personalizados
 * 
 * Al nuevo sistema unificado de mensajería MOA
 */

/* ============================================================================
   EJEMPLO 1: Migrar window.confirm a confirm.delete
   ============================================================================ */

// ❌ ANTES (WishlistPage.jsx línea 76)
const handleClearAll = async () => {
  const ok = window.confirm("¿Seguro que quieres limpiar todos tus favoritos?");
  if (!ok) return;
  
  try {
    await clearWishlist();
    alert("Favoritos limpiados");
  } catch (error) {
    alert("Error al limpiar favoritos");
  }
};

// ✅ DESPUÉS (con sistema unificado)
import { confirm, toast } from '@/components/ui';

const handleClearAll = async () => {
  const confirmed = await confirm.delete(
    "¿Limpiar todos los favoritos?",
    "Esta acción no se puede deshacer"
  );
  
  if (!confirmed) return;
  
  try {
    await clearWishlist();
    toast.success("Favoritos limpiados correctamente");
  } catch (error) {
    toast.error("Error al limpiar favoritos");
  }
};

/* ============================================================================
   EJEMPLO 2: Migrar SweetAlert2 a Toast
   ============================================================================ */

// ❌ ANTES (ForgotPasswordPage.jsx)
import Swal from 'sweetalert2';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!isValidEmail(email)) {
    Swal.fire({ 
      icon: 'error', 
      title: 'Correo inválido', 
      text: 'Ingresa un correo válido.' 
    });
    return;
  }
  
  try {
    await sendResetEmail(email);
    await Swal.fire({
      icon: 'success',
      title: 'Correo enviado',
      text: 'Revisa tu bandeja de entrada',
    });
  } catch (err) {
    Swal.fire({ 
      icon: 'error', 
      title: 'No se pudo enviar', 
      text: err.message || 'Intenta nuevamente.' 
    });
  }
};

// ✅ DESPUÉS (con sistema unificado)
import { toast, confirm } from '@/components/ui';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!isValidEmail(email)) {
    toast.error('Ingresa un correo válido', {
      title: 'Correo inválido'
    });
    return;
  }
  
  try {
    await sendResetEmail(email);
    await confirm.info(
      'Correo enviado',
      'Revisa tu bandeja de entrada'
    );
  } catch (err) {
    toast.error(err.message || 'Intenta nuevamente', {
      title: 'No se pudo enviar'
    });
  }
};

/* ============================================================================
   EJEMPLO 3: Migrar confirmación de eliminación con SweetAlert2
   ============================================================================ */

// ❌ ANTES (AdminCategoriesPage.jsx línea 197)
const handleDeleteCategory = async (categoryId) => {
  if (!confirm("¿Eliminar esta categoría?")) return;
  
  try {
    await deleteCategory(categoryId);
    showAlert("Categoría eliminada exitosamente");
  } catch (error) {
    showAlert(resolveErrorMessage(error), "error");
  }
};

// ✅ DESPUÉS (con sistema unificado)
import { confirm, toast } from '@/components/ui';

const handleDeleteCategory = async (categoryId) => {
  const confirmed = await confirm.delete(
    "¿Eliminar esta categoría?",
    "Esta acción no se puede deshacer"
  );
  
  if (!confirmed) return;
  
  try {
    await deleteCategory(categoryId);
    toast.success("Categoría eliminada exitosamente");
  } catch (error) {
    toast.error(resolveErrorMessage(error));
  }
};

/* ============================================================================
   EJEMPLO 4: Migrar alertas de estado en página
   ============================================================================ */

// ❌ ANTES (OrdersAdminPageV2.jsx - alert de estado local)
const [pageAlert, setPageAlert] = useState(null);

const showPageAlert = (message, type) => {
  setPageAlert({ message, type });
  const timeoutId = setTimeout(() => setPageAlert(null), 4000);
  return () => clearTimeout(timeoutId);
};

// En el render:
{pageAlert && (
  <div className={`alert alert-${pageAlert.type}`}>
    {pageAlert.message}
  </div>
)}

// ✅ DESPUÉS (con sistema unificado - más simple)
import { toast } from '@/components/ui';

// Ya no necesitas estado ni timeouts, simplemente:
const handleStatusUpdate = async (orderId, newStatus) => {
  try {
    await updateOrderStatus(orderId, newStatus);
    toast.success('Estado actualizado correctamente');
  } catch (error) {
    toast.error('Error al actualizar el estado');
  }
};

/* ============================================================================
   EJEMPLO 5: Migrar modal de confirmación con useConfirm hook
   ============================================================================ */

// ❌ ANTES (CustomersPage.jsx línea 405)
const handleToggleStatus = async (customer) => {
  if (!confirm(`¿Desactivar a ${customer.nombre}?`)) return;
  
  try {
    await updateCustomerStatus(customer.id, 'inactive');
    window.alert('Cliente desactivado exitosamente');
  } catch (error) {
    window.alert(error?.message ?? 'No se pudo actualizar el estado del cliente');
  }
};

// ✅ DESPUÉS (con hook useConfirm)
import { useConfirm } from '@/components/ui';
import { toast } from '@/components/ui';

function CustomersPage() {
  const { confirmWarning } = useConfirm();
  
  const handleToggleStatus = async (customer) => {
    const confirmed = await confirmWarning(
      `¿Desactivar a ${customer.nombre}?`,
      'El cliente no podrá realizar compras hasta ser reactivado'
    );
    
    if (!confirmed) return;
    
    try {
      await updateCustomerStatus(customer.id, 'inactive');
      toast.success('Cliente desactivado exitosamente');
    } catch (error) {
      toast.error(error?.message ?? 'No se pudo actualizar el estado del cliente');
    }
  };
  
  return (
    // ... componente
  );
}

/* ============================================================================
   EJEMPLO 6: Alert inline para información persistente
   ============================================================================ */

// ✅ Para información que debe permanecer visible (no temporal)
import { Alert, AlertWarning, AlertInfo } from '@/components/ui';

function CheckoutPage() {
  return (
    <div>
      <h1>Checkout</h1>
      
      {/* Información importante que debe ser visible */}
      <AlertInfo title="Envío gratis" dismissible>
        En compras superiores a $50.000
      </AlertInfo>
      
      {/* Advertencia que el usuario debe ver */}
      <AlertWarning title="Último paso">
        Verifica los datos antes de confirmar tu pedido
      </AlertWarning>
      
      {/* ... resto del formulario */}
    </div>
  );
}

/* ============================================================================
   EJEMPLO 7: Combinando Modal con confirm para acciones críticas
   ============================================================================ */

// ✅ Modal para formulario + confirm para acción destructiva
import { Modal, Button, confirm, toast } from '@/components/ui';

function EditProductModal({ product, open, onClose }) {
  const [formData, setFormData] = useState(product);
  
  const handleDelete = async () => {
    const confirmed = await confirm.delete(
      `¿Eliminar "${product.nombre}"?`,
      'Esta acción no se puede deshacer y el producto dejará de estar disponible'
    );
    
    if (!confirmed) return;
    
    try {
      await deleteProduct(product.id);
      toast.success('Producto eliminado');
      onClose();
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };
  
  const handleSave = async () => {
    try {
      await updateProduct(product.id, formData);
      toast.success('Producto actualizado');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar el producto');
    }
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Producto"
      size="lg"
      footer={
        <>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </>
      }
    >
      {/* Formulario del producto */}
    </Modal>
  );
}

/* ============================================================================
   EJEMPLO 8: useToast hook para componentes que hacen múltiples operaciones
   ============================================================================ */

// ✅ Hook para simplificar el código
import { useToast, useConfirm } from '@/components/ui';

function ProductManager() {
  const { success, error, info } = useToast();
  const { confirmDelete } = useConfirm();
  
  const handleBulkDelete = async (productIds) => {
    const confirmed = await confirmDelete(
      `¿Eliminar ${productIds.length} productos?`,
      'Esta acción no se puede deshacer'
    );
    
    if (!confirmed) return;
    
    info('Eliminando productos...');
    
    try {
      await Promise.all(productIds.map(id => deleteProduct(id)));
      success(`${productIds.length} productos eliminados correctamente`);
    } catch (err) {
      error('Error al eliminar algunos productos');
    }
  };
  
  return (
    // ... componente
  );
}

/* ============================================================================
   RESUMEN DE BENEFICIOS
   ============================================================================ */

/*
 * ✅ Consistencia visual total
 * ✅ Menos código boilerplate
 * ✅ Mejor UX (toasts menos intrusivos)
 * ✅ Código más limpio y legible
 * ✅ TypeScript friendly
 * ✅ Mejor accesibilidad (ARIA)
 * ✅ Animaciones suaves
 * ✅ Responsive automático
 * ✅ Hooks personalizados
 * ✅ Sin dependencia de librerías externas pesadas
 */
