import Button from "../../../components/ui/Button.jsx";

export default function EntornoAdmin({ children }) {
  return (
    <div className="admin-shell min-h-screen bg-[var(--color-lightest2)] text-neutral-900">
      <header className="border-b border-neutral-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-400">
              Acceso privado
            </p>
            <h1 className="text-2xl font-semibold text-neutral-900">Panel administrativo</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" size="sm" to="/home" className="uppercase tracking-wide">
              Ver sitio
            </Button>
            <Button variant="secondary" size="sm" to="/admin/dashboard" className="uppercase tracking-wide">
              Dashboard
            </Button>
          </div>
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
