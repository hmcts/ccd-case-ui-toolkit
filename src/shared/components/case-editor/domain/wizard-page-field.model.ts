import { Orderable } from '../../../domain/order/orderable.model';
import { ComplexFieldMask } from './wizard-page-field-complex-mask.model';

export class WizardPageField implements Orderable {
  case_field_id: string;
  order?: number;
  page_column_no?: number;
  display_context?: string;
  complex_field_mask_list?: ComplexFieldMask[];
}
