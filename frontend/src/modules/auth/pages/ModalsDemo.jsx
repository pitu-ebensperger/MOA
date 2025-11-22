import { useState } from 'react';
import { PartyPopper, AlarmClock } from "lucide-react";
import { Button } from '@/components/ui/Button.jsx';

export default function ModalsDemo() {
  // Agregar estilos de animación
  const styles = `
    @keyframes icon-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes circle-pulse {
      0%, 100% { transform: scale(1);}
      50% { transform: scale(0.8); }
    }
    
    .animate-icon-bounce,
    .animate-circle-pulse {
      transition: all 0.5s ease;
    }
    
    .modal-header-group:hover .animate-icon-bounce,
    .modal-content:has(.modal-button-wrapper:hover) .animate-icon-bounce {
      animation: icon-bounce 2s ease-in-out infinite;
      animation-delay: 0.1s;
    }
    
    .modal-header-group:hover .animate-circle-pulse,
    .modal-content:has(.modal-button-wrapper:hover) .animate-circle-pulse {
      animation: circle-pulse 2s ease-in-out infinite;
      animation-delay: 0.1s;
    }
  `;

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  return (
    <>
      <style>{styles}</style>
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
            <div className="text-[#D4704B] mb-3"><PartyPopper className="h-10 w-10 mx-auto" /></div>
            <h3 className="font-semibold text-xl mb-2">Modal de Bienvenida</h3>
            <p className="text-sm text-neutral-600">Después de registro exitoso</p>
          </button>

          <button
            onClick={() => setShowExpiredModal(true)}
            className="p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-amber-500 transition-all"
          >
            <div className="text-amber-600 mb-3"><AlarmClock className="h-10 w-10 mx-auto" /></div>
            <h3 className="font-semibold text-lg mb-2">Modal Sesión Expirada</h3>
            <p className="text-sm text-neutral-600">Cuando el token JWT expira</p>
          </button>
        </div>

        {showWelcomeModal && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
            onClick={() => setShowWelcomeModal(false)}
          >
            <div 
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in modal-content"
              onClick={(e) => e.stopPropagation()}
            >
    
              <div className="bg-gradient-to-br from-[var(--color-primary3)] via-[var(--color-primary1)] to-[var(--color-primary2)] px-8 pt-8 pb-6 text-center modal-header-group group cursor-pointer">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md animate-circle-pulse hover:backdrop-opacity-10" />
                  <PartyPopper className="h-20 w-20 text-white relative z-10 animate-icon-bounce" strokeWidth={1} />
                </div>
                <div className="text-2xl font-serif font-regular text-white mb-0">
                  ¡Bienvenido a MOA, María!
                </div>
                <p className="text-white/90 text-regular text-md">
                  Tu cuenta ha sido creada exitosamente
                </p>
              </div>
              
              {/* Contenido */}
              <div className="px-8 py-6">
                <p className="text-center text-(--color-text-secondary) text-sm leading-relaxed mb-6">
                  Ahora puedes iniciar sesión para comenzar a explorar nuestra colección de muebles artesanales y decoración única.
                </p>
                
                <div className="flex flex-col gap-3 items-center modal-button-wrapper group">
                  <Button
                    onClick={() => setShowWelcomeModal(false)}
                    shape="pill"
                    width="fit"
                    className="px-8 hover:bg-color-primary2 hover:shadow-lg transition-all duration-200"
                    size="sm"
                  >
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}


         {showExpiredModal && (
             <div 
               className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
               onClick={() => setShowExpiredModal(false)}
             >
               <div 
                 className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 animate-scale-in"
                 onClick={(e) => e.stopPropagation()}
               >
                 <div className="flex items-start gap-3 mb-4">
                   <div className="shrink-0 w-10 h-10 rounded-full bg-warning/100 flex items-center justify-center">
                     <Clock className="h-5 w-5 text-warm" />
                   </div>
                   <div className="flex-1">
                     <h3 id="session-expired-title" className="text-lg font-display font-semibold text-(--color-warning) mb-1">
                       Tu sesión expiró
                     </h3>
                     <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                       Por tu seguridad, necesitas volver a iniciar sesión{expiredFromPath ? ` para acceder a ${expiredFromPath}` : ''}.
                     </p>
                   </div>
                   <button
                     onClick={() => setShowExpiredModal(false)}
                     className="shrink-0 p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                     aria-label="Cerrar"
                   >
                     <X className="h-5 w-5" />
                   </button>
                 </div>
                 <div className="flex justify-end">
                   <Button
                     onClick={() => setShowExpiredModal(false)}
                     shape="pill"
                     size="sm"
                     className="px-6"
                   >
                     Entendido
                   </Button>
                 </div>
               </div>
             </div>
           )}
       
      </div>
      </div>
    </>
  );
}
