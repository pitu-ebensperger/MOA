import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/Button.jsx"
import { Spinner } from "@/components/ui/Spinner.jsx"
import { ordersApi } from "@/services/orders.api.js"
import { formatCurrencyCLP } from "@/utils/currency.js"
import { formatDate_ddMMyyyy } from "@/utils/date.js"

const DELIVERY_STATUS_DAYS = {
  delivered: 0,
  in_transit: 2,
  processing: 3,
  preparing: 4,
  empaquetado: 4,
  shipped: 2,
  cancelled: 0,
}

const DAY_MS = 24 * 60 * 60 * 1000
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return null
  if (typeof value === "number" && Number.isFinite(value)) return value

  const cleaned = typeof value === "string"
    ? value.replace(/[^0-9.-]+/g, "")
    : String(value)

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const toClpValue = (value, { fromCents = false } = {}) => {
  const parsed = parseNumber(value)
  if (parsed === null) return null
  return fromCents ? parsed / 100 : parsed
}

const pickAmount = (...entries) => {
  for (const entry of entries) {
    if (!entry) continue
    const amount = toClpValue(entry.value, { fromCents: entry.fromCents })
    if (amount !== null) return amount
  }
  return 0
}

const formatLongDate = (value) => {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : LONG_DATE_FORMATTER.format(date)
}

const getTrackingNumber = (order) => {
  return order?.shipment?.trackingNumero ?? order?.shipment?.trackingNumber ?? order?.numero_seguimiento ?? null
}

const getTrackingUrl = (trackingNumber) => {
  if (!trackingNumber) return null
  return `https://tracking.moa.cl/${trackingNumber}`
}

const getEstimatedDelivery = (order) => {
  if (!order) return null
  if (order.shipment?.deliveredAt) {
    const delivered = new Date(order.shipment.deliveredAt)
    if (!Number.isNaN(delivered.getTime())) return delivered
  }

  const base = order.shipment?.shippedAt ?? order.createdAt
  const reference = base ? new Date(base) : new Date()
  if (Number.isNaN(reference.getTime())) return null

  const statusKey = String(order.shipment?.status ?? "").toLowerCase()
  const offsetDays = DELIVERY_STATUS_DAYS[statusKey] ?? 5
  return new Date(reference.getTime() + offsetDays * DAY_MS)
}

const resolveItemUnit = (item) => {
  if (!item) return { value: 0, quantity: 1 }
  const quantity = parseNumber(item.quantity ?? item.cantidad ?? item.qty) ?? 1
  if (item.unitPrice !== undefined) {
    return { value: toClpValue(item.unitPrice) ?? 0, quantity }
  }
  if (item.precio_unit !== undefined) {
    return { value: toClpValue(item.precio_unit, { fromCents: true }) ?? 0, quantity }
  }
  if (item.precio_unit_cents !== undefined) {
    return { value: toClpValue(item.precio_unit_cents, { fromCents: true }) ?? 0, quantity }
  }
  if (item.precio !== undefined) {
    return { value: toClpValue(item.precio) ?? 0, quantity }
  }
  return { value: 0, quantity }
}

const getItemsSubtotal = (items = []) => {
  return items.reduce((acc, item) => {
    const { value, quantity } = resolveItemUnit(item)
    return acc + value * quantity
  }, 0)
}

export const OrderConfirmationPage = () => {
  const { orderCode } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderCode) return
    setLoading(true)
    setError("")

    ordersApi
      .getById(orderCode)
      .then((data) => setOrder(data))
      .catch((err) => setError(err?.message ?? "No fue posible recuperar la orden"))
      .finally(() => setLoading(false))
  }, [orderCode])

  const summary = useMemo(() => {
    if (!order) return null
    const itemsSubtotal = getItemsSubtotal(order.items)

    const subtotal = pickAmount(
      { value: order.subtotal },
      { value: order.subtotal_cents, fromCents: true },
      { value: itemsSubtotal }
    )

    const shipping = pickAmount(
      { value: order.shipping },
      { value: order.envio_cents, fromCents: true },
      { value: order.shipping_cost },
      { value: order.envio },
      { value: order.shippingFee }
    )

    const tax = pickAmount(
      { value: order.tax },
      { value: order.impuestos_cents, fromCents: true },
      { value: order.tax_cents, fromCents: true }
    )

    const total = pickAmount(
      { value: order.total },
      { value: order.total_cents, fromCents: true },
      { value: subtotal + shipping + tax }
    )

    return { subtotal, shipping, tax, total }
  }, [order])

  const items = order?.items ?? []
  const estimatedDelivery = useMemo(() => getEstimatedDelivery(order), [order])
  const formattedEstimatedDelivery = formatLongDate(estimatedDelivery)
  const trackingNumber = getTrackingNumber(order)
  const trackingUrl = getTrackingUrl(trackingNumber)

  const paymentLabel =
    order?.payment?.provider ?? "Pago por confirmar con nuestro equipo"

  const shippingMethod = order?.shipment?.carrier ?? order?.metodo_despacho ?? "Despacho estándar"
  return (
    <main className="page min-h-screen bg-(--color-light) py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-(--text-strong)">Tu compra está confirmada</h1>
          <p className="text-sm text-(--text-muted)">
            Se ha emitido un comprobante por tu compra. Revísalo con calma y guarda la clave de seguimiento.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-[color:var(--color-denial)] bg-[color:var(--overlay-soft)] p-4 text-sm text-[color:var(--color-denial)]">
            {error}
          </div>
        )}

        <section className="rounded-[32px] bg-white shadow-2xl ring-1 ring-neutral-100">
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 bg-[color:var(--color-primary1)] px-8 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Orden confirmada</p>
                <p className="text-2xl font-semibold">{order?.number ?? order?.id ?? "-"}</p>
                <p className="text-sm">{order?.status ? order.status.replace(/_/g, " ") : "Estado pendiente"}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-white/80">Fecha</p>
                <p className="text-lg font-semibold">{formatDate_ddMMyyyy(order?.createdAt ?? order?.created_at) || "-"}</p>
                {summary && (
                  <p className="text-sm">Total pagado: <span className="font-semibold">{formatCurrencyCLP(summary.total)}</span></p>
                )}
              </div>
            </div>

            {loading && !order && (
              <div className="flex items-center justify-center py-10">
                <Spinner size="lg" />
              </div>
            )}

            {!loading && order && (
              <div className="space-y-6 px-6 py-8 md:px-10">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Entrega estimada</p>
                    <p className="text-lg font-semibold text-(--text-strong)">
                      {formattedEstimatedDelivery || "Próximamente"}
                    </p>
                    <p className="text-sm text-neutral-600">{shippingMethod}</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Método de pago</p>
                    <p className="text-lg font-semibold text-(--text-strong)">{paymentLabel}</p>
                    {order?.payment?.status && (
                      <p className="text-sm text-neutral-600">{order.payment.status}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-(--text-strong)">Información de envío</h2>
                    <p className="text-sm text-neutral-600">{order?.userName ?? "Cliente"}</p>
                    <div className="mt-3 space-y-1 text-sm text-neutral-700">
                      {order?.address?.street && <p>{order.address.street}</p>}
                      {(order?.address?.commune || order?.address?.city) && (
                        <p>
                          {[order.address.commune, order.address.city]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {order?.address?.region && <p>{order.address.region}</p>}
                      {order?.address?.country && <p>{order.address.country}</p>}
                      {order?.userEmail && <p>Email: {order.userEmail}</p>}
                      {order?.address?.telefono_contacto && (
                        <p>Teléfono: {order.address.telefono_contacto}</p>
                      )}
                    </div>
                    {(order?.notas_cliente || order?.notes) && (
                      <p className="mt-2 text-sm italic text-neutral-500">
                        "{order.notas_cliente ?? order.notes}"
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-(--text-strong)">Seguimiento</h2>
                    <p className="text-sm text-neutral-600 truncate">{trackingNumber ?? "Próximo paso"}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[color:var(--color-primary1)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--color-primary1)]">
                        {order?.shipment?.status ? order.shipment.status.replace(/_/g, " ") : "Pendiente"}
                      </span>
                      {order?.shipment?.carrier && (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                          {order.shipment.carrier}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-(--text-strong)">
                      Resumen de productos ({items.length})
                    </h2>
                    <p className="text-sm font-semibold text-neutral-500">
                      {formatCurrencyCLP(summary?.subtotal ?? 0)} antes de envío
                    </p>
                  </div>
                  <div className="mt-6 space-y-4">
                    {items.map((item, index) => {
                      const { value, quantity } = resolveItemUnit(item)
                      const name =
                        item.producto_nombre ?? item.nombre ?? item.name ?? "Producto"
                      return (
                        <article
                          key={`${name}-${index}`}
                          className="flex items-start gap-4 rounded-2xl border border-neutral-100 p-4"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-neutral-800">{name}</p>
                            <p className="text-xs text-neutral-500">Cantidad: {quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-neutral-500">
                              {formatCurrencyCLP(value)} c/u
                            </p>
                            <p className="text-base font-semibold text-(--text-strong)">
                              {formatCurrencyCLP(value * quantity)}
                            </p>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Subtotal</span>
                      <span className="font-semibold text-(--text-strong)">{formatCurrencyCLP(summary?.subtotal ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Envío</span>
                      <span className="font-semibold text-(--text-strong)">{formatCurrencyCLP(summary?.shipping ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Impuestos</span>
                      <span className="font-semibold text-(--text-strong)">{formatCurrencyCLP(summary?.tax ?? 0)}</span>
                    </div>
                    <div className="border-t border-neutral-300 pt-3 text-base font-semibold text-(--text-strong)">
                      <div className="flex justify-between">
                        <span>Total pagado</span>
                        <span>{formatCurrencyCLP(summary?.total ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <Button
                    as={trackingUrl ? "a" : "button"}
                    href={trackingUrl ?? undefined}
                    target={trackingUrl ? "_blank" : undefined}
                    rel={trackingUrl ? "noreferrer" : undefined}
                    intent="primary"
                    appearance="solid"
                    className="w-full"
                    disabled={!trackingUrl}
                  >
                    Ver tracking
                  </Button>
                  <Button
                    appearance="outline"
                    intent="neutral"
                    className="w-full"
                    onClick={() => window.print()}
                  >
                    Descargar comprobante
                  </Button>
                  <Button
                    appearance="ghost"
                    intent="neutral"
                    className="w-full"
                    onClick={() => navigate("/", { replace: true })}
                  >
                    Volver a inicio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default OrderConfirmationPage
