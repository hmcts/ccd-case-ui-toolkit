import { Orderable } from '../../../domain/order/orderable.model';
import { ComplexFieldOverride } from './wizard-page-field-complex-override.model';

export class WizardPageField implements Orderable {
  case_field_id: string;
  order?: number;
  page_column_no?: number;
  display_context?: string;
  complex_field_overrides?: ComplexFieldOverride[];
}
