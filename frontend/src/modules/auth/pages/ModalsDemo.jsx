import { useState } from 'react';
import { Clock } from "lucide-react";
import { Button } from '@/components/ui/Button.jsx';

export default function ModalsDemo() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  return (
    <div className="page min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-3xl font-serif font-bold text-(--color-primary1) mb-8 text-center">
          Vista Previa de Modales
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-[#D4704B] transition-all"
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-semibold text-lg mb-2">Modal de Bienvenida</h3>
            <p className="text-sm text-neutral-600">Después de registro exitoso</p>
          </button>

          <button
            onClick={() => setShowExpiredModal(true)}
            className="p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-amber-500 transition-all"
          >
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="font-semibold text-lg mb-2">Modal Sesión Expirada</h3>
            <p className="text-sm text-neutral-600">Cuando el token JWT expira</p>
          </button>
        </div>

        {/* Modal de bienvenida */}
        {showWelcomeModal && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
            onClick={() => setShowWelcomeModal(false)}
          >
            <div 
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header decorativo con gradiente MOA */}
              <div className="bg-gradient-to-br from-[#D4704B] via-[#B8653F] to-[#8B4513] px-8 pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mb-4">
                  <span className="text-4xl">🎉</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">
                  ¡Bienvenido a MOA, María!
                </h3>
                <p className="text-white/90 text-sm">
                  Tu cuenta ha sido creada exitosamente
                </p>
              </div>
              
              {/* Contenido */}
              <div className="px-8 py-6">
                <p className="text-center text-(--color-text-secondary) text-sm leading-relaxed mb-6">
                  Ahora puedes iniciar sesión para comenzar a explorar nuestra colección de muebles artesanales y decoración única.
                </p>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setShowWelcomeModal(false)}
                    shape="pill"
                    motion="lift"
                    className="w-full"
                  >
                    Iniciar sesión
                  </Button>
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="text-sm text-(--color-text-muted) hover:text-(--color-primary1) transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de sesión expirada */}
        {showExpiredModal && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
            onClick={() => setShowExpiredModal(false)}
          >
            <div 
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con tono amber para advertencia */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-8 pt-8 pb-6 border-b border-amber-100">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-(--color-primary1) mb-2">
                      Tu sesión ha expirado
                    </h3>
                    <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                      Por tu seguridad, necesitas volver a iniciar sesión para acceder a tu perfil.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Contenido */}
              <div className="px-8 py-6">
                <div className="bg-amber-50/50 rounded-xl p-4 mb-6 border border-amber-100">
                  <p className="text-xs text-(--color-text-muted) text-center">
                    Las sesiones expiran después de 24 horas de inactividad para proteger tu cuenta.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setShowExpiredModal(false)}
                    shape="pill"
                    motion="lift"
                    className="w-full"
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
