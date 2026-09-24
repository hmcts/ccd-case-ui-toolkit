import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

export const orderSummaryField = Object.assign(new CaseField(), {
  id: 'order-summary', label: 'Order summary', display_context: 'READONLY',
  field_type: { id: 'OrderSummary', type: 'OrderSummary' },
  value: { Fees: [{ value: { code: 'FEE1', description: 'Application fee', amount: '100.00' } }], PaymentTotal: '100.00' }
});

export const paymentHistoryField = Object.assign(new CaseField(), {
  id: 'payment-history', label: 'Payment history', display_context: 'READONLY',
  field_type: { id: 'PaymentHistory', type: 'PaymentHistory' }, value: null
});
