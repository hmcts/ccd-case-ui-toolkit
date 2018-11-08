import { Orderable } from '../../../domain/order/orderable.model';

export class WizardPageField implements Orderable {
  case_field_id: string;
  order?: number;
  page_column_no?: number;
}
