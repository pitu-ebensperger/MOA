import React from "react";
import { Modal } from "../../../components/ui/Modal.jsx";
import { Price } from "../../../components/data-display/Price.jsx";
import { StatusPill } from "../../../components/ui/StatusPill.jsx";
import { formatDate_ddMMyyyy } from "../../../utils/date.js";

// Helpers pequeños para no ensuciar el JSX
const safeDate = (value) => (value ? formatDate_ddMMyyyy(value) : "-");

export default function OrdersDrawer({ open, order, onClose }) {
  // Si no hay orden seleccionada, no mostramos nada
  if (!open || !order) return null;

  const {
    number,
    status,
    createdAt,
    items = [],
    payment,
    shipment,
    userName,
    userEmail,
    userPhone,
    subtotal,
    shipping,
    total,
  } = order;

  // Fallbacks simples para evitar undefined
  const paymentMethod = payment?.provider ?? payment?.method ?? "—";
  const deliveryService = shipment?.carrier ?? "—";
  const shippingStatus = shipment?.status ?? "—";

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="drawer"          // usamos modo drawer
      placement="right"         // anclado a la derecha
      ariaLabel="Detalle de orden"
      className="w-full max-w-2xl" // ancho similar al ejemplo
    >
      <div className="flex h-full flex-col bg-[var(--color-neutral2)] text-[color:var(--color-text)]">
        {/* Header */}
        <header className="flex items-start justify-between border-b border-[color:var(--color-border)] px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
              Detalle de orden
            </p>
            <h2 className="mt-1 font-mono text-lg font-semibold tracking-tight">
              {number ?? "Orden"}
            </h2>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs text-[color:var(--color-text-muted)]">Estado</span>
            <StatusPill status={status} />
          </div>
        </header>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Items + meta principal */}
          <section className="grid gap-6 md:grid-cols-2">
            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[color:var(--color-text)]">
                Ítems
              </h3>

              <div className="divide-y divide-[color:var(--color-border)] rounded-xl border border-[color:var(--color-border)] bg-[var(--color-neutral4)]">
                {items.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
                    Esta orden no tiene ítems registrados.
                  </div>
                )}

                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 px-4 py-3">
                    {/* Mini “thumbnail” cuadrado */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-neutral3)] text-xs text-[color:var(--color-text-muted)]">
                      {item.name?.[0] ?? "?"}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {item.name ?? "Producto"}
                      </span>
                      <span className="text-xs text-[color:var(--color-text-muted)]">
                        {item.quantity ?? 1} pcs
                      </span>
                    </div>

                    <div className="text-right text-sm font-medium tabular-nums">
                      <Price value={item.unitPrice ?? 0} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta de la orden */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[color:var(--color-text)]">
                Información de la orden
              </h3>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Creada
                  </p>
                  <p>{safeDate(createdAt)}</p>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Entrega
                  </p>
                  <p>{deliveryService}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">Estado: {shippingStatus}</p>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Método de pago
                  </p>
                  <p>{paymentMethod}</p>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Monto pagado
                  </p>
                  <p className="tabular-nums">
                    <Price value={payment?.amount ?? total ?? 0} />
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cliente + Timeline + Resumen de pago */}
          <section className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Cliente */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[color:var(--color-text)]">
                Cliente
              </h3>

              <div className="space-y-2 rounded-xl border border-[color:var(--color-border)] bg-[var(--color-neutral4)] px-4 py-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Nombre
                  </p>
                  <p>{userName ?? "—"}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Email
                  </p>
                  <p className="break-all text-[color:var(--color-primary1)]">
                    {userEmail ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    Teléfono
                  </p>
                  <p>{userPhone ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* Timeline + resumen pago */}
            <div className="space-y-4">
              {/* Timeline simple */}
              <div>
              <h3 className="mb-2 text-sm font-semibold text-[color:var(--color-text)]">
                Timeline
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                    <span className="mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-primary1)]" />
                    <div>
                      <p className="font-medium">Orden procesada</p>
                      <p className="text-xs text-[color:var(--color-text-muted)]">
                        La orden está siendo preparada.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3 opacity-70">
                    <span className="mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full border border-[color:var(--color-border)]" />
                    <div>
                      <p className="font-medium">Pago confirmado</p>
                      <p className="text-xs text-[color:var(--color-text-muted)]">
                        El pago fue procesado y verificado.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3 opacity-70">
                    <span className="mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full border border-[color:var(--color-border)]" />
                    <div>
                      <p className="font-medium">Orden creada</p>
                      <p className="text-xs text-[color:var(--color-text-muted)]">
                        El cliente completó el checkout.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Resumen de pago */}
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[var(--color-neutral4)] px-4 py-3 text-sm">
                <h3 className="mb-2 text-sm font-semibold text-[color:var(--color-text)]">
                  Pago
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--color-text-muted)]">Subtotal</span>
                    <span className="tabular-nums">
                      <Price value={subtotal ?? 0} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--color-text-muted)]">Envío</span>
                    <span className="tabular-nums">
                      <Price value={shipping ?? 0} />
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[color:var(--color-border)] pt-2 font-medium">
                    <span>Total</span>
                    <span className="tabular-nums">
                      <Price value={total ?? payment?.amount ?? 0} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer con botón cerrar (por si el modal no tiene X propia) */}
        <footer className="flex items-center justify-end border-t border-[color:var(--color-border)] px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--color-border)] px-4 py-1.5 text-sm text-[color:var(--color-text)] hover:bg-[var(--color-neutral4)]"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </Modal>
  );
}
