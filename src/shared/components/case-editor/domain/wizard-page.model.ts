import { Type } from 'class-transformer';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { Orderable } from '../../../domain/order/orderable.model';
import { WizardPageField } from './wizard-page-field.model';

// @dynamic
export class WizardPage implements Orderable {

  public id: string;
  public label: string;
  public order?: number;

  @Type(() => WizardPageField)
  public wizard_page_fields: WizardPageField[];

  @Type(() => CaseField)
  public case_fields: CaseField[];

  public show_condition?: string;

  public parsedShowCondition: ShowCondition;

  public getCol1Fields(): CaseField[] {
    return this.case_fields.filter(f =>
      !f.wizardProps.page_column_no || f.wizardProps.page_column_no === 1);
  }
  public getCol2Fields(): CaseField[] {
    return this.case_fields.filter(f => f.wizardProps.page_column_no === 2);
  }

  public isMultiColumn(): boolean {
    return this.getCol2Fields().length > 0;
  }
}
