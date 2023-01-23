import { Orderable } from '../../../domain/order/orderable.model';
import { ComplexFieldOverride } from './wizard-page-field-complex-override.model';

export class WizardPageField implements Orderable {
  public case_field_id: string;
  public order?: number;
  public page_column_no?: number;
  public complex_field_overrides?: ComplexFieldOverride[];
}
