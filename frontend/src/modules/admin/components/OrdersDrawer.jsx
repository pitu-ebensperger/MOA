import React from "react";
import { Modal } from "../../../components/ui/Modal.jsx";
import { Price } from "../../../components/data-display/Price.jsx";
import { StatusPill } from "../../../components/ui/StatusPill.jsx";
import { Pill } from "../../../components/ui/Pill.jsx";
import { formatDate_ddMMyyyy } from "../../../utils/date.js";
import { CalendarDays, PackageCheck, Truck } from "lucide-react";

// Helpers pequeños para no ensuciar el JSX
const safeDate = (value) => (value ? formatDate_ddMMyyyy(value) : "–");
const safeText = (v) => (v == null || v === "" ? "–" : v);

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
    address,
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
  const deliveredAt = shipment?.deliveredAt ?? null;
  const shippedAt = shipment?.shippedAt ?? null;
  const tracking = shipment?.trackingNumero ?? shipment?.trackingNumber ?? null;
  // Link de tracking se removió por solicitud; mantenemos sólo el número.
  const fullAddress = address
    ? [
        address.street,
        [address.commune, address.city].filter(Boolean).join(", "),
        [address.region, address.country].filter(Boolean).join(", "),
        address.postalCode,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  // Stepper helpers -----------------------------------------------------------------------------------------------
  const shippingCurrentStep = (() => {
    if (shipment?.status === "cancelled" || status === "cancelled") return 0;
    if (deliveredAt) return 2;
    if (shippedAt || shipment?.status === "in_transit" || shipment?.status === "processing" || shipment?.status === "preparing") return 1;
    return 0; // creada
  })();

  const steps = [
    { key: "created", label: "Creada", date: createdAt, icon: CalendarDays },
    { key: "shipped", label: "Enviada", date: shippedAt, icon: Truck },
    { key: "delivered", label: "Entregada", date: deliveredAt, icon: PackageCheck },
  ];

  // Micro description list rows (menos cajas, mejor legibilidad)
  const Dl = ({ children, className = "" }) => (
    <dl className={`divide-(--color-border) ${className}`}>{children}</dl>
  );
  const DlRow = ({ label, children }) => (
    <div className="grid grid-cols-3 gap-3 py-2">
      <dt className="col-span-1 text-[11px] uppercase tracking-wide text-(--color-text-muted)">{label}</dt>
      <dd className="col-span-2 text-sm leading-6">{children}</dd>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="drawer"          // usamos modo drawer
      placement="right"         // anclado a la derecha
      ariaLabel="Detalle de orden"
      className="w-full sm:max-w-[640px] md:max-w-[760px]" // ancho responsivo y un poco más amplio
    >
  <div className="flex h-full flex-col bg-(--color-neutral2) text-(--color-text)">
        {/* Header (sticky) */}
  <header className="sticky top-0 z-10 flex items-center justify-between border-b border-(--color-border) bg-white/90 px-7 py-5 backdrop-blur">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-(--color-text-muted)">
              Orden
            </p>
            <h2 className="mt-0.5 truncate font-mono text-lg font-semibold tracking-tight">
              {number ?? "Orden"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Delivery date quick glance */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-(--color-border) bg-(--surface-subtle) px-3 py-1.5 text-sm text-(--color-text)">
              <CalendarDays className="h-4 w-4 text-(--color-text-muted)" />
              <span className="whitespace-nowrap">
                {deliveredAt ? `Entrega: ${safeDate(deliveredAt)}` : shippedAt ? `Envío: ${safeDate(shippedAt)}` : "Sin fecha"}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-xs text-(--color-text-muted)">Estado</span>
              <StatusPill status={status} />
            </div>
          </div>
        </header>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Col izquierda: Items */}
            <section className="md:col-span-8">
              <h3 className="mb-3 text-sm font-semibold">Ítems</h3>
              <div className="rounded-2xl border border-(--color-border) bg-white shadow-sm">
                {items.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-(--color-text-muted)">Esta orden no tiene ítems.</div>
                ) : (
                  <ul className="divide-(--color-border)">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-4 px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-(--color-neutral3) text-xs text-(--color-text-muted)">
                          {item.name?.[0] ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{safeText(item.name)}</p>
                          <p className="text-xs text-(--color-text-muted)">{item.quantity ?? 1} uds</p>
                        </div>
                        <div className="text-right text-sm font-medium tabular-nums">
                          <Price value={item.unitPrice ?? 0} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Totales */}
                <div className="border-t border-(--color-border) px-5 py-4">
                  <Dl>
                    <DlRow label="Subtotal"><span className="tabular-nums"><Price value={subtotal ?? 0} /></span></DlRow>
                    {order.tax ? (
                      <DlRow label="Impuestos"><span className="tabular-nums"><Price value={order.tax} /></span></DlRow>
                    ) : null}
                    <DlRow label="Envío"><span className="tabular-nums"><Price value={shipping ?? 0} /></span></DlRow>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <dt className="col-span-1 text-[11px] uppercase tracking-wide text-(--color-text-muted)">Total</dt>
                      <dd className="col-span-2 text-sm font-medium tabular-nums"><Price value={total ?? payment?.amount ?? 0} /></dd>
                    </div>
                  </Dl>
                </div>
              </div>
            </section>

            {/* Col derecha: Meta (envío / cliente / pago) */}
            <aside className="md:col-span-4">
              {/* Envío y entrega */}
              <section className="mb-8">
                <h3 className="mb-3 text-sm font-semibold">Envío y entrega</h3>
                {/* Stepper */}
                <div className="relative">
                  <ol className="flex items-center justify-between gap-2">
                    {steps.map((s, idx) => {
                      const active = idx <= shippingCurrentStep;
                      const Icon = s.icon;
                      return (
                        <li key={s.key} className="flex min-w-0 flex-1 flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${active ? "bg-(--color-primary1) text-white border-(--color-primary1)" : "bg-white text-(--color-text-muted) border-(--color-border)"}`}>
                            <Icon className={`h-4 w-4 ${active ? "text-white" : "text-(--color-text-muted)"}`} />
                          </div>
                          <span className={`mt-1 text-[11px] ${active ? "text-(--color-primary1)" : "text-(--color-text-muted)"}`}>{s.label}</span>
                          <span className="mt-0.5 text-[10px] text-(--color-text-muted)">{safeDate(s.date)}</span>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="pointer-events-none absolute left-[calc(1.75rem)] right-[calc(1.75rem)] top-3 h-px bg-(--color-border)">
                    <div className="h-full bg-(--color-primary1) transition-all" style={{ width: `${(shippingCurrentStep / (steps.length - 1)) * 100}%` }} />
                  </div>
                </div>

                {/* Datos de envío (lista simple) */}
                <Dl className="mt-4">
                  <DlRow label="Carrier">
                    <span className="font-medium">{safeText(deliveryService)}</span>
                    <span className="ml-2 align-middle"><Pill variant={deliveredAt ? "success" : shippingStatus === "cancelled" ? "error" : "info"}>{safeText(shippingStatus)}</Pill></span>
                  </DlRow>
                  {tracking && (
                    <DlRow label="Tracking"><span className="font-mono text-[13px] text-(--color-text-muted)">{tracking}</span></DlRow>
                  )}
                  <DlRow label="Fecha de envío">{safeDate(shippedAt)}</DlRow>
                  <DlRow label="Fecha de entrega">{safeDate(deliveredAt)}</DlRow>
                  <DlRow label={`Dirección${address?.label ? ` (${address.label})` : ""}`}>
                    <span className="break-words">{fullAddress ?? "–"}</span>
                  </DlRow>
                </Dl>
              </section>

              {/* Cliente */}
              <section className="mb-8">
                <h3 className="mb-3 text-sm font-semibold">Cliente</h3>
                <Dl>
                  <DlRow label="Nombre">{safeText(userName)}</DlRow>
                  <DlRow label="Email"><span className="text-(--color-primary1)">{safeText(userEmail)}</span></DlRow>
                  <DlRow label="Teléfono">{safeText(userPhone)}</DlRow>
                </Dl>
              </section>

              {/* Pago */}
              <section>
                <h3 className="mb-3 text-sm font-semibold">Pago</h3>
                <Dl>
                  <DlRow label="Método">{safeText(paymentMethod)}</DlRow>
                  {payment?.status && (
                    <DlRow label="Estado">
                      <Pill variant={payment.status === "captured" ? "success" : payment.status === "failed" ? "error" : "info"}>{payment.status}</Pill>
                    </DlRow>
                  )}
                </Dl>
              </section>
            </aside>
          </div>
        </div>

        {/* Footer con botón cerrar (por si el modal no tiene X propia) */}
        <footer className="flex items-center justify-end border-t border-(--color-border) bg-white px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-(--color-border) bg-white px-4 py-1.5 text-sm text-(--color-text) hover:bg-(--surface-subtle)"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </Modal>
  );
}
