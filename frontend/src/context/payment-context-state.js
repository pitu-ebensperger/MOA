import { createStrictContext } from '@/context/createStrictContext'

const [PaymentContext, usePaymentMethodsStrict] = createStrictContext('Payment', {
  displayName: 'PaymentContext',
  errorMessage: 'usePaymentMethods debe usarse dentro de PaymentProvider',
});

export { PaymentContext, usePaymentMethodsStrict };
