import React from 'react';
import { toast, confirm, useToast, useConfirm, Alert, AlertSuccess, AlertError, AlertWarning, AlertInfo, Modal, Button } from '@/components/ui';

/**
 * MessagingSystemDemo
 * 
 * Página de demostración del sistema unificado de mensajería MOA
 * 
 * Agrega esta ruta temporalmente para probar:
 * <Route path="/demo/messaging" element={<MessagingSystemDemo />} />
 */
export function MessagingSystemDemo() {
  const [showModal, setShowModal] = React.useState(false);
  const { success, error, warning, info } = useToast();
  const { confirmDelete, confirmWarning, confirmInfo } = useConfirm();

  const demoToasts = () => {
    toast.success('Operación exitosa');
    setTimeout(() => toast.error('Ocurrió un error'), 500);
    setTimeout(() => toast.warning('Ten cuidado'), 1000);
    setTimeout(() => toast.info('Información útil'), 1500);
  };

  const demoToastWithTitle = () => {
    toast.success('Los cambios fueron guardados correctamente', {
      title: '¡Guardado!',
      duration: 5000
    });
  };

  const demoConfirmDelete = async () => {
    const confirmed = await confirmDelete(
      '¿Eliminar este producto?',
      'Esta acción no se puede deshacer'
    );
    if (confirmed) {
      success('Producto eliminado correctamente');
    }
  };

  const demoConfirmWarning = async () => {
    const confirmed = await confirmWarning(
      'Cambios sin guardar',
      '¿Deseas salir sin guardar los cambios?',
      {
        confirmText: 'Sí, salir',
        cancelText: 'Seguir editando'
      }
    );
    if (confirmed) {
      info('Cambios descartados');
    }
  };

  const demoConfirmInfo = async () => {
    await confirmInfo(
      'Pedido confirmado',
      'Tu pedido #12345 ha sido procesado exitosamente'
    );
  };

  const demoLongToast = () => {
    toast.success('Este toast permanece hasta que lo cierres', {
      title: 'Persistente',
      duration: Infinity
    });
  };

  return (
    <div className="min-h-screen bg-(--color-neutral1) py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-semibold text-(--color-primary2) mb-4">
            Sistema Unificado de Mensajería
          </h1>
          <p className="text-(--color-text-secondary) text-lg">
            Demo de todos los componentes del sistema de alertas y modales MOA
          </p>
        </div>

        {/* Sección: Alerts Inline */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-(--color-primary2) mb-6">
            Alerts (Inline)
          </h2>
          <div className="space-y-4">
            <AlertSuccess title="Operación exitosa" dismissible>
              Tu pedido ha sido procesado correctamente
            </AlertSuccess>

            <AlertError title="Error al procesar" dismissible>
              No se pudo completar la operación. Por favor intenta nuevamente.
            </AlertError>

            <AlertWarning title="Advertencia importante">
              Stock limitado disponible para este producto
            </AlertWarning>

            <AlertInfo dismissible>
              Nueva versión disponible. Actualiza para obtener nuevas características.
            </AlertInfo>

            <Alert variant="success">
              Alert simple sin título
            </Alert>
          </div>
        </section>

        {/* Sección: Toasts */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-(--color-primary2) mb-6">
            Toasts (Notificaciones Flotantes)
          </h2>
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={demoToasts}>
                🎉 Demo Toasts Secuenciales
              </Button>

              <Button onClick={demoToastWithTitle}>
                📝 Toast con Título
              </Button>

              <Button 
                onClick={() => success('¡Éxito!')}
                intent="success"
              >
                ✅ Success Toast
              </Button>

              <Button 
                onClick={() => error('Error detectado')}
                intent="danger"
              >
                ❌ Error Toast
              </Button>

              <Button 
                onClick={() => warning('Ten cuidado')}
                intent="warning"
              >
                ⚠️ Warning Toast
              </Button>

              <Button 
                onClick={() => info('Información útil')}
                intent="info"
              >
                ℹ️ Info Toast
              </Button>

              <Button onClick={demoLongToast} variant="outline">
                ⏱️ Toast Persistente
              </Button>

              <Button 
                onClick={() => toast.dismissAll()}
                variant="ghost"
              >
                🗑️ Cerrar Todos
              </Button>
            </div>

            <div className="mt-4 p-4 bg-(--color-neutral3)/30 rounded-lg">
              <p className="text-sm text-(--color-text-secondary)">
                💡 <strong>Tip:</strong> Los toasts aparecen en la esquina superior derecha
                y desaparecen automáticamente después de 3-4 segundos.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: Confirm Dialogs */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-(--color-primary2) mb-6">
            Confirm Dialogs (Diálogos de Confirmación)
          </h2>
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                onClick={demoConfirmDelete}
                intent="danger"
              >
                🗑️ Confirmación Eliminar
              </Button>

              <Button 
                onClick={demoConfirmWarning}
                intent="warning"
              >
                ⚠️ Confirmación Advertencia
              </Button>

              <Button 
                onClick={demoConfirmInfo}
                intent="info"
              >
                ℹ️ Diálogo Informativo
              </Button>

              <Button 
                onClick={async () => {
                  const ok = await confirm.custom({
                    title: 'Confirmación Personalizada',
                    description: 'Puedes personalizar completamente el diálogo',
                    confirmText: 'Sí, continuar',
                    cancelText: 'No, gracias',
                    variant: 'info'
                  });
                  if (ok) success('Confirmado!');
                }}
                variant="outline"
              >
                🎨 Confirmación Custom
              </Button>
            </div>

            <div className="mt-4 p-4 bg-(--color-neutral3)/30 rounded-lg">
              <p className="text-sm text-(--color-text-secondary)">
                💡 <strong>Tip:</strong> Los confirm dialogs son basados en promesas.
                Usa <code className="bg-(--color-primary4)/30 px-1 rounded">await</code> para
                esperar la respuesta del usuario.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: Modal */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-(--color-primary2) mb-6">
            Modal (Diálogos Complejos)
          </h2>
          <div className="bg-white rounded-xl p-6">
            <Button onClick={() => setShowModal(true)}>
              📋 Abrir Modal
            </Button>

            <Modal
              open={showModal}
              onClose={() => setShowModal(false)}
              title="Ejemplo de Modal"
              size="md"
              footer={
                <>
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowModal(false);
                      success('Guardado correctamente');
                    }}
                  >
                    Guardar
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <p className="text-(--color-text-secondary)">
                  Este es un modal de ejemplo con contenido personalizado.
                </p>
                
                <div className="space-y-2">
                  <label htmlFor="modal-example-input" className="block text-sm font-medium text-(--color-text)">
                    Campo de ejemplo
                  </label>
                  <input
                    id="modal-example-input"
                    type="text"
                    className="w-full px-3 py-2 border border-(--color-border) rounded-lg"
                    placeholder="Escribe algo..."
                  />
                </div>

                <AlertInfo title="Información">
                  Los modales pueden contener cualquier contenido, incluidos otros componentes.
                </AlertInfo>
              </div>
            </Modal>

            <div className="mt-4 p-4 bg-(--color-neutral3)/30 rounded-lg">
              <p className="text-sm text-(--color-text-secondary)">
                💡 <strong>Tip:</strong> Los modales son ideales para formularios complejos
                o contenido que requiere la atención completa del usuario.
              </p>
            </div>
          </div>
        </section>

        {/* Sección: Comparativa */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-(--color-primary2) mb-6">
            ¿Cuándo usar cada componente?
          </h2>
          <div className="bg-white rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-(--color-border)">
                    <th className="text-left py-3 px-4 font-semibold">Componente</th>
                    <th className="text-left py-3 px-4 font-semibold">Uso Ideal</th>
                    <th className="text-left py-3 px-4 font-semibold">Duración</th>
                    <th className="text-left py-3 px-4 font-semibold">Interrupción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)">
                  <tr>
                    <td className="py-3 px-4 font-medium">Alert</td>
                    <td className="py-3 px-4">Información contextual persistente</td>
                    <td className="py-3 px-4">Hasta cerrar</td>
                    <td className="py-3 px-4">Baja</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Toast</td>
                    <td className="py-3 px-4">Feedback rápido de acciones</td>
                    <td className="py-3 px-4">3-4 segundos</td>
                    <td className="py-3 px-4">Mínima</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Confirm</td>
                    <td className="py-3 px-4">Acciones destructivas o importantes</td>
                    <td className="py-3 px-4">Usuario decide</td>
                    <td className="py-3 px-4">Alta</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Modal</td>
                    <td className="py-3 px-4">Formularios, contenido complejo</td>
                    <td className="py-3 px-4">Hasta cerrar</td>
                    <td className="py-3 px-4">Alta</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Sección: Código de Ejemplo */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-(--color-primary2) mb-6">
            Código de Ejemplo
          </h2>
          <div className="bg-(--color-primary2) text-(--color-neutral1) rounded-xl p-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`import { toast, confirm } from '@/components/ui'

// Toast simple
toast.success('Guardado correctamente')

// Toast con opciones
toast.error('Error al procesar', {
  title: 'Error',
  duration: 5000
})

// Confirmación
const ok = await confirm.delete(
  '¿Eliminar este elemento?',
  'Esta acción no se puede deshacer'
)

if (ok) {
  deleteItem()
  toast.success('Eliminado')
}

// Con hooks
const { success, error } = useToast()
const { confirmDelete } = useConfirm()

success('Operación exitosa')
const confirmed = await confirmDelete('¿Eliminar?')
`}</code>
            </pre>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-(--color-text-secondary)">
          <p>
            Sistema Unificado de Mensajería MOA · Ver{' '}
            <a 
              href="/docs/misDOCS/SISTEMA_MENSAJERIA.md"
              className="text-(--color-primary1) hover:underline"
            >
              documentación completa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
