import { Orderable } from '../order';
import { FieldType } from './field-type.model';
import { WizardPageField } from '../../components/case-editor/domain';
import { Type } from 'class-transformer';
import { AccessControlList } from './access-control-list.model';

// @dynamic
export class CaseField implements Orderable {
  id: string;
  hidden?: boolean;
  label: string;
  order?: number;

  @Type(() => FieldType)
  field_type: FieldType;
  value?: any;
  hint_text?: string;
  security_label?: string;
  display_context: string;
  display_context_parameter?: string;
  show_condition?: string;
  show_summary_change_option?: boolean;
  show_summary_content_option?: number;
  acls?: AccessControlList[];

  @Type(() => WizardPageField)
  wizardProps?: WizardPageField;


  getValue?(): string {
    if (this.field_type.type === 'DynamicList') {
      return this.value ? this.value.value.code : '';
    } else {
      return this.value;
    }
  }

  getItems?(): any {
    if (this.field_type.type === 'DynamicList') {
      return this.value ? this.value.list_items : [];
    } else {
      return this.field_type.fixed_list_items;
    }
  }
}
