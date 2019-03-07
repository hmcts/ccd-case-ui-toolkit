import { Orderable } from '../../../domain/order/orderable.model';

export class ComplexFieldOverride implements Orderable {
  complex_field_element_id: string;
  order?: number;
  display_context: string;
  label?: string;
  hint_text?: string;
  show_condition?: string;
}
