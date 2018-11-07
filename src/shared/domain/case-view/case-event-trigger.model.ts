import { CaseField } from '../definition/case-field.model';
import { WizardPage } from '../../components/case-editor/domain/wizard-page.model';
import { Type } from 'class-transformer';

// @dynamic
export class CaseEventTrigger {

  id: string;
  name: string;
  description?: string;
  case_id?: string;

  @Type(() => CaseField)
  case_fields: CaseField[];

  event_token: string;

  @Type(() => WizardPage)
  wizard_pages: WizardPage[];

  show_summary?: boolean;
  show_event_notes?: boolean;
  end_button_label?: string;
  can_save_draft?: boolean;

  hasFields(): boolean {
    return this.case_fields && this.case_fields.length !== 0;
  }

  hasPages(): boolean {
    return this.wizard_pages && this.wizard_pages.length !== 0;
  }
}
