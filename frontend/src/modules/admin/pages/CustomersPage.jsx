import { customersDb } from "../../../mocks/database/customers.js";
import { formatDate_ddMMyyyy } from "../../../utils/date.js";

export default function CustomersPage() {
  const customers = customersDb?.users ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(0,0,0,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Clientes</p>
        <h1 className="text-2xl font-semibold text-neutral-900">Comunidad</h1>
        <p className="text-sm text-neutral-500">{customers.length} usuarios registrados</p>
      </section>

      <section className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Últimos registros</p>
          <h2 className="text-xl font-semibold text-neutral-900">Perfil de usuarios</h2>
        </header>

        <div className="space-y-3">
          {customers.map((customer) => (
            <article
              key={customer.id}
              className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-xs text-neutral-500">{customer.email}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                  {customer.marketingOptIn ? "Opt-in" : "Sin permiso"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500">
                <span>Telefono: {customer.phone}</span>
                <span>Registrado {formatDate_ddMMyyyy(customer.createdAt, "-")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
