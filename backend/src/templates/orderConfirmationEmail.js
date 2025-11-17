const CLP_FORMATTER = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
})

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const numberOrZero = (value) => {
  if (value === undefined || value === null || value === "") return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const toChileanAmount = (value, { assumeCents = true } = {}) => {
  const numeric = numberOrZero(value)
  return assumeCents ? numeric / 100 : numeric
}

const formatMoney = (value) => CLP_FORMATTER.format(Math.round(numberOrZero(value)))

const formatDate = (value) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return DATE_FORMATTER.format(date)
}

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const buildItemRow = (item = {}) => {
  const name = item.producto_nombre ?? item.nombre ?? item.name ?? "Producto"
  const quantity = numberOrZero(item.cantidad ?? item.quantity ?? 1)
  const unitTotal = toChileanAmount(item.precio_unit ?? item.unitPrice ?? 0)
  const lineTotal = unitTotal * quantity
  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2933;">
        <strong>${escapeHtml(name)}</strong><br />
        <small style="color:#6b7280;">Cantidad: ${quantity}</small>
      </td>
      <td style="text-align:right; border-bottom: 1px solid #e5e7eb; padding: 10px 0; font-size: 14px; color: #1f2933;">
        ${formatMoney(unitTotal)} c/u
      </td>
      <td style="text-align:right; border-bottom: 1px solid #e5e7eb; padding: 10px 0; font-size: 14px; color: #111827;">
        ${formatMoney(lineTotal)}
      </td>
    </tr>
  `
}

export function buildOrderConfirmationEmail({ order = {}, user = {}, address = {}, trackingUrl = "", appUrl = "" } = {}) {
  const orderCode =
    order.order_code ?? order.codigo ?? order.numero ?? order.orderCode ?? "MOA-0000"
  const customerName =
    user.nombre ?? user.name ?? order.usuario_nombre ?? order.nombre ?? "Cliente"
  const contactEmail =
    user.email ?? order.usuario_email ?? order.email ?? ""
  const contactPhone =
    address.telefono ?? order.telefono_contacto ?? user.telefono ?? ""
  const shippingAddress = [
    address.calle ?? order.calle,
    address.numero ?? order.numero,
    address.depto ?? order.depto_oficina,
    address.comuna ?? order.comuna,
    address.ciudad ?? order.ciudad,
    address.region ?? order.region,
    address.codigo_postal ?? order.codigo_postal,
    address.pais ?? order.pais,
  ]
    .filter(Boolean)
    .join(", ")
  const shippingMethod =
    order.metodo_despacho ?? order.shipping_method ?? "Despacho estándar"
  const paymentMethod =
    order.metodo_pago_marca ?? order.metodo_pago_tipo ?? order.metodo_pago_usado ?? "Método de pago"
  const paymentStatus = order.estado_pago ?? order.payment_status ?? "Pendiente"
  const deliveryStatus = order.estado_envio ?? order.shipment_status ?? "Procesando"
  const createdAt = order.created_at ?? order.createdAt ?? order.fecha_creacion ?? Date.now()
  const estimatedDelivery = order.fecha_entrega_real ?? order.estimated_delivery

  const subtotal = toChileanAmount(order.subtotal_cents ?? order.subtotal ?? 0)
  const shipping = toChileanAmount(order.envio_cents ?? order.shipping_cents ?? order.shipping ?? 0)
  const tax = toChileanAmount(order.impuestos_cents ?? order.tax_cents ?? order.tax ?? 0)
  const total = toChileanAmount(order.total_cents ?? order.total ?? subtotal + shipping + tax)

  const items = Array.isArray(order.items) ? order.items : []
  const itemsRows = items.length
    ? items.map(buildItemRow).join("")
    : `
        <tr>
          <td colspan="3" style="padding: 16px 0; font-size: 14px; color: #6b7280; text-align:center;">
            Los detalles de producto se actualizarán pronto.
          </td>
        </tr>
      `

  const customerOrderLink = appUrl
    ? `${appUrl.replace(/\/$/, "")}/orders/${orderCode}`
    : ""

  const formattedDate = formatDate(createdAt)
  const formattedDelivery = formatDate(estimatedDelivery) || "Próximamente"
  const subtotalFormatted = formatMoney(subtotal)
  const shippingFormatted = formatMoney(shipping)
  const taxFormatted = formatMoney(tax)
  const totalFormatted = formatMoney(total)

  const html = `
    <html>
      <body style="margin:0;background-color:#f4f4f7;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="580" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 24px 60px rgba(15, 23, 42, 0.15);">
                <tr>
                  <td style="background:#5c33ff; padding:32px; color:#ffffff; text-align:center;">
                    <p style="margin:0; font-size:14px; letter-spacing:0.3em; text-transform:uppercase; opacity:0.8;">Orden confirmada</p>
                    <h1 style="margin:8px 0 0; font-size:28px;">Gracias por tu compra, ${customerName.split(" ")[0] || "cliente"}!</h1>
                    <p style="margin:12px 0 0; font-size:16px;">Tu código ${orderCode} ya está listo.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px 24px;">
                    <p style="margin:0; font-size:14px; color:#6b7280;">Fecha de orden: <strong>${formattedDate}</strong></p>
                    <p style="margin:6px 0 0; font-size:14px; color:#6b7280;">Entrega estimada: <strong>${formattedDelivery}</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:18px; border:1px solid #e5e7eb; overflow:hidden;">
                      <tr>
                        <td style="padding:16px 24px; background:#f9fafb;">
                          <p style="margin:0; font-size:12px; letter-spacing:0.2em; color:#6b7280; text-transform:uppercase;">Resumen</p>
                          <p style="margin:6px 0 0; font-size:16px;"><strong>${subtotalFormatted}</strong> + envío</p>
                        </td>
                        <td style="padding:16px 24px; background:#f9fafb; text-align:right;">
                          <p style="margin:0; font-size:12px; letter-spacing:0.2em; color:#6b7280; text-transform:uppercase;">Estado</p>
                          <p style="margin:6px 0 0; font-size:16px; font-weight:600;">${deliveryStatus.replace(/_/g, " ")} / ${paymentStatus.replace(/_/g, " ")}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="vertical-align:top; padding-right:16px; width:50%; font-size:12px; color:#6b7280;">
                          <p style="margin:0; letter-spacing:0.2em; text-transform:uppercase;">Envío</p>
                          <p style="margin:6px 0 0; font-size:14px; color:#111827;">${shippingAddress || "Dirección registrada"}</p>
                          <p style="margin:4px 0 0; font-size:14px; color:#111827;">${shippingMethod}</p>
                          ${contactPhone ? `<p style="margin:4px 0 0; font-size:14px; color:#111827;">Tel: ${contactPhone}</p>` : ""}
                        </td>
                        <td style="vertical-align:top; font-size:12px; color:#6b7280;">
                          <p style="margin:0; letter-spacing:0.2em; text-transform:uppercase;">Pago</p>
                          <p style="margin:6px 0 0; font-size:14px; color:#111827;">${paymentMethod}</p>
                          ${contactEmail ? `<p style="margin:4px 0 0; font-size:14px; color:#111827;">Email: ${contactEmail}</p>` : ""}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:16px; border:1px solid #e5e7eb;">
                      <thead>
                        <tr style="background:#f3f4f6;">
                          <th align="left" style="padding:12px 16px; font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:#6b7280;">Producto</th>
                          <th align="right" style="padding:12px 16px; font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:#6b7280;">Precio</th>
                          <th align="right" style="padding:12px 16px; font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:#6b7280;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsRows}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px; color:#1f2933;">
                      <tr>
                        <td>Subtotal</td>
                        <td style="text-align:right;">${subtotalFormatted}</td>
                      </tr>
                      <tr>
                        <td>Envío</td>
                        <td style="text-align:right;">${shippingFormatted}</td>
                      </tr>
                      <tr>
                        <td>Impuestos</td>
                        <td style="text-align:right;">${taxFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px; font-weight:600;">Total</td>
                        <td style="padding-top:12px; text-align:right; font-weight:700;">${totalFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:16px 40px 40px;">
                    ${customerOrderLink ? `<a href="${customerOrderLink}" style="display:inline-block;padding:12px 28px;border-radius:999px;background:#5c33ff;color:#ffffff;text-decoration:none;font-weight:600;">Ver mi orden</a>` : ""}
                    ${trackingUrl ? `<p style="margin:12px 0 0; font-size:14px; color:#6b7280;"><strong>Tracking:</strong> <a href="${trackingUrl}" style="color:#5c33ff;">${trackingUrl}</a></p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return {
    subject: `Confirmación de tu orden ${orderCode}`,
    html,
  }
}

export default buildOrderConfirmationEmail
