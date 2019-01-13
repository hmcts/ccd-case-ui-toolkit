import { Orderable } from '../../../domain/order/orderable.model';

export class ComplexFieldMask implements Orderable {
  complex_field_id: string;
  order?: number;
  display_context?: string;
  label?: string;
  hint_text?: string;
  show_condition?: string;
}
