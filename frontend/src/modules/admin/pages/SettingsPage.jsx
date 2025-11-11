const SETTINGS = [
  {
    label: "Notificaciones",
    description: "Alertas de pedido, inventario y promociones.",
    status: "Activadas",
  },
  {
    label: "Integraciones",
    description: "Webpay, ERP y herramientas de marketing.",
    status: "Pendiente",
  },
  {
    label: "Seguridad",
    description: "Roles, contraseñas y doble factor.",
    status: "Revisado",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(0,0,0,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Ajustes</p>
        <h1 className="text-2xl font-semibold text-neutral-900">Configuración del entorno</h1>
        <p className="text-sm text-neutral-500">Controla permisos, personas y opciones generales.</p>
      </section>

      <section className="space-y-4">
        {SETTINGS.map((setting) => (
          <article
            key={setting.label}
            className="flex flex-col gap-3 rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">{setting.label}</h2>
              <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs uppercase tracking-[0.3em] text-neutral-500">
                {setting.status}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{setting.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
