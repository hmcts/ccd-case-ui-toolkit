import { FeeValue } from './fee-value.model';

export class OrderSummary {
    PaymentReference: string;
    Fees: FeeValue[];
    PaymentTotal: string;
}
