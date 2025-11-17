import { AddressesSection } from '@/modules/profile/components/AddressesSection.jsx';

export const AddressesTab = () => {
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
          Mis Direcciones de Envío
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Gestiona las direcciones donde quieres recibir tus pedidos
        </p>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-6">
        <AddressesSection />
      </div>
    </div>
  );
};
