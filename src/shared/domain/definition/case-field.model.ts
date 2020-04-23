import { Orderable } from '../order';
import { FieldType } from './field-type.model';
import { WizardPageField } from '../../components/case-editor/domain';
import { Expose, Type } from 'class-transformer';
import { AccessControlList } from './access-control-list.model';
import * as _ from 'underscore';

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
  metadata?: boolean;

  @Type(() => WizardPageField)
  wizardProps?: WizardPageField;

  private _value: any;
  private _list_items: any = [];

  @Expose()
  get value(): any {
    if (this.field_type && this.field_type.type === 'DynamicList') {
      return this._value && this._value.value ? this._value.value.code : this._value;
    } else {
      return this._value;
    }
  }

  set value(value: any) {
    this._value = value;
  }

  @Expose()
  get list_items(): any {
    if (this.field_type && this.field_type.type === 'DynamicList') {
      return this._value && this._value.list_items ? this._value.list_items : this._list_items;
    } else {
      return this.field_type.fixed_list_items;
    }
  }

  set list_items(items: any) {
    this._list_items = items;
  }

  @Expose()
  public isReadonly() {
    return !_.isEmpty(this.display_context)
      && this.display_context.toUpperCase() === 'READONLY';
  }

  @Expose()
  isCollection(): boolean {
    return this.field_type && this.field_type.type === 'Collection';
  }

  @Expose()
  isComplex(): boolean {
    return this.field_type && this.field_type.type === 'Complex';
  }

  @Expose()
  isCaseLink(): boolean {
    return this.isComplex()
      && this.field_type.id === 'CaseLink'
      && this.field_type.complex_fields.some(cf => cf.id === 'CaseReference');
  }
}
