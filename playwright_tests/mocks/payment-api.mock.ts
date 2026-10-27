export const paymentApiResponses: Record<string, unknown> = {
  '/cases/1111222233334444/paymentgroups': { payment_groups: [] },
  '/case-payment-orders?case_ids=1111222233334444': { content: [] },
  '/cases/1111222233334444': { payments: [] },
  '/?ccdCaseNumber=1111222233334444': { refund_list: [] }
};

export const paymentUser = { roles: 'caseworker', sub: 'caseworker@example.invalid' };

export const populatedPaymentGroups = {
  payment_groups: [{ payment_group_reference: 'PG-001', fees: [], remissions: [], payments: [{
    reference: 'PAY-001', amount: 125.5, status: 'Success', method: 'card', channel: 'online',
    date_created: '2025-01-02T10:00:00.000Z', payment_allocation: []
  }] }]
};

export const unpaidServiceRequest = {
  payment_groups: [{
    payment_group_reference: 'SR-001', service_request_status: 'Not paid',
    date_created: '2025-01-02T10:00:00.000Z', payments: [], remissions: [],
    fees: [{ code: 'FEE0001', calculated_amount: 125.5, amount_due: 125.5, over_payment: 0 }]
  }]
};
