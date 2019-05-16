import { Orderable } from '../order';
import { FieldType } from './field-type.model';
import { WizardPageField } from '../../components/case-editor/domain';
import { Expose, Type } from 'class-transformer';
import { AccessControlList } from './access-control-list.model';

// @dynamic
export class CaseField implements Orderable {
  id: string;
  hidden?: boolean;
  label: string;
  order?: number;

  @Type(() => FieldType)
  field_type: FieldType;

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

  private _value: any;
  private _items: any = [];

  @Expose()
  get value(): any {
    if (this.field_type && this.field_type.type === 'DynamicList') {
      return this._value && this._value.value ? this._value.value.code : this._value;
    } else {
      return this._value;
    }
  }

  set value(newValue: any) {
    this._value = newValue;
  }

  @Expose()
  get items(): any {
    if (this.field_type && this.field_type.type === 'DynamicList') {
      return this._value.list_items ? this._value.list_items : this._items;
    } else {
      return this.field_type.fixed_list_items;
    }
  }

  set items(newItems: any) {
    this._items = newItems;
  }

}
