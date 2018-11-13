import { Orderable } from '../order/orderable.model';
import { FieldType } from './field-type.model';
import { AccessControlList } from './access-control-list';
import { WizardPageField } from '../../components/case-editor/domain';
import { Type } from 'class-transformer';

// @dynamic
export class CaseField implements Orderable {
  id: string;
  label: string;
  order?: number;

  @Type(() => FieldType)
  field_type: FieldType;
  value?: any;

  hint_text?: string;
  security_label?: string;
  display_context: string;
  show_condition?: string;
  show_summary_change_option?: boolean;
  show_summary_content_option?: number;
  acls: AccessControlList[];

  @Type(() => WizardPageField)
  wizardProps?: WizardPageField;
}
