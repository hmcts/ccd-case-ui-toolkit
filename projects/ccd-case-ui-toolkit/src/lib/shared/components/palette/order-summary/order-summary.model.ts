import { FeeValue } from './fee-value.model';

export class OrderSummary {
    public PaymentReference: string;
    public Fees: FeeValue[];
    public PaymentTotal: string;
}
