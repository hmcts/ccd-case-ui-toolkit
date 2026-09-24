export const paymentApiResponses: Record<string, unknown> = {
  '/cases/1111222233334444/paymentgroups': { payment_groups: [] },
  '/case-payment-orders?case_ids=1111222233334444': { content: [] },
  '/cases/1111222233334444': { payments: [] },
  '/?ccdCaseNumber=1111222233334444': { refund_list: [] }
};

export const paymentUser = { roles: ['caseworker'] };
