import Stripe from "stripe";
import orderModel from "../models/orderModel.js";

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-11-15' })
  : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const describeCardFromIntent = (paymentIntent) => {
  const charge = paymentIntent?.charges?.data?.[0];
  const card = charge?.payment_method_details?.card;
  if (!card) return 'Tarjeta Stripe';
  const brand = card.brand ? `${card.brand[0].toUpperCase()}${card.brand.slice(1)}` : 'Tarjeta';
  const last4 = card.last4 || 'XXXX';
  return `${brand} terminada en ${last4}`;
};

const handleStripeWebhook = async (req, res) => {
  if (!stripeClient || !webhookSecret) {
    return res.status(500).json({
      success: false,
      message: 'Stripe no está configurado para procesar webhooks',
    });
  }

  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.warn('Error validando webhook Stripe:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const paymentIntent = event.data.object;
  const orderId = paymentIntent?.metadata?.orden_id;

  if (!orderId) {
    return res.status(200).json({ received: true });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await orderModel.updatePaymentStatus(
          orderId,
          'pagado',
          paymentIntent.id,
          describeCardFromIntent(paymentIntent)
        );
        break;
      case 'payment_intent.payment_failed':
        await orderModel.updatePaymentStatus(
          orderId,
          'fallido',
          paymentIntent.id,
          describeCardFromIntent(paymentIntent)
        );
        break;
      case 'payment_intent.canceled':
        await orderModel.updatePaymentStatus(
          orderId,
          'cancelado',
          paymentIntent.id,
          describeCardFromIntent(paymentIntent)
        );
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Webhook Stripe: Error actualizando orden', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de la orden',
    });
  }

  res.json({ received: true });
};

const webhookController = {
  handleStripeWebhook,
};

export default webhookController;
