import { Orderable } from './order/orderable.model';
import { WizardPageField } from './wizard-page-field.model';
import { CaseField } from './definition/case-field.model';
import { ShowCondition } from '../conditional-show/conditional-show.model';
import { Type } from 'class-transformer';

export class WizardPage implements Orderable {

  id: string;
  label: string;
  order?: number;

  @Type(() => WizardPageField)
  wizard_page_fields: WizardPageField[];

  @Type(() => CaseField)
  case_fields: CaseField[];

  show_condition?: string;

  parsedShowCondition: ShowCondition;

  getCol1Fields(): CaseField[] {
    return this.case_fields.filter(f =>
      !f.wizardProps.page_column_no || f.wizardProps.page_column_no === 1);
  }
  getCol2Fields(): CaseField[] {
    return this.case_fields.filter(f => f.wizardProps.page_column_no === 2);
  }

  isMultiColumn(): Boolean {
    return this.getCol2Fields().length > 0;
  }
}
