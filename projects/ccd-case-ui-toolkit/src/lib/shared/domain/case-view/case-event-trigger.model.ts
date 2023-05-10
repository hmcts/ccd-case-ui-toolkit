// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { WizardPage } from '../../components/case-editor/domain/wizard-page.model';
import { CaseField } from '../definition/case-field.model';

// @dynamic
export class CaseEventTrigger {
  public id: string;
  public name: string;
  public description?: string;
  public case_id?: string;

  @Type(() => CaseField)
  public case_fields: CaseField[];

  public event_token: string;

  @Type(() => WizardPage)
  public wizard_pages: WizardPage[];

  public show_summary?: boolean;
  public show_event_notes?: boolean;
  public end_button_label?: string;
  public can_save_draft?: boolean;

  public hasFields(): boolean {
    return this.case_fields && this.case_fields.length !== 0;
  }

  public hasPages(): boolean {
    return this.wizard_pages && this.wizard_pages.length !== 0;
  }
}
