import { Orderable } from '../order';
import { WizardPageField } from '../../components/case-editor/domain/wizard-page-field.model';
import { Expose, Type } from 'class-transformer';
import { AccessControlList } from './access-control-list.model';
import { _ } from 'underscore';
import { FieldTypeEnum } from './field-type-enum.model';
import { FixedListItem } from './fixed-list-item.model';

// @dynamic
export class CaseField implements Orderable {
  id: string;
  hidden: boolean;
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
  formatted_value?: any;

  @Type(() => WizardPageField)
  wizardProps?: WizardPageField;

  private _value: any;
  private _list_items: any = [];

  @Expose()
  get value(): any {
    if (this.isDynamic()) {
      const hasValue = (this._value && this._value.value);

      if (hasValue && Array.isArray(this._value.value)) {
        return this._value.value;
      }

      return hasValue ? this._value.value.code : this._value;
    } else {
      return this._value;
    }
  }

  set value(value: any) {
    if (this.isDynamic()) {
      if (value && value instanceof Object && value.list_items) {
        this._list_items = value.list_items;
      } else if (!this._list_items || this._list_items.length === 0) {
        // Extract the list items from the current value if that's the only place they exist.
        this._list_items = this.list_items;
        if (!value || !value.value) {
          value = null;
        }
      }
    }
    this._value = value;
  }

  @Expose()
  get list_items(): any {
    if (this.isDynamic()) {
      return this._value && this._value.list_items ? this._value.list_items : this._list_items;
    } else {
      return this.field_type.fixed_list_items;
    }
  }

  set list_items(items: any) {
    this._list_items = items;
  }

  @Expose()
  get dateTimeEntryFormat(): string {
    // TODO not yet implemented
    return null;
  }
  @Expose()
  get dateTimeDisplayFormat(): string {
    if (this.display_context_parameter) {
      return this.extractBracketValue(this.display_context_parameter, '#DATETIMEDISPLAY')
    }
    return null;
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
  isDynamic(): boolean {
    if (!this.field_type) return false;

    const dynamicFieldTypes: FieldTypeEnum[] = ['DynamicList', 'DynamicMultiSelectList'];

    return dynamicFieldTypes.indexOf(this.field_type.type) !== -1;
  }

  @Expose()
  isCaseLink(): boolean {
    return this.isComplex()
      && this.field_type.id === 'CaseLink'
      && this.field_type.complex_fields.some(cf => cf.id === 'CaseReference');
  }
  private extractBracketValue(fmt: string, paramName: string, leftBracket= '(', rightBracket= ')' ): string {
      fmt.split(',')
        .find(a => a.trim().startsWith(paramName));
      if (fmt) {
        let s = fmt.indexOf(leftBracket) + 1;
        let e = fmt.indexOf(rightBracket, s);
        if (e > s && s >= 0) {
          return fmt.substr(s, (e - s));
        }
      }
      return null;
  }
}

// @dynamic
export class FieldType {
  id: string;
  type: FieldTypeEnum;
  min?: number;
  max?: number;
  regular_expression?: string;

  @Type(() => FixedListItem)
  fixed_list_items?: FixedListItem[];

  @Type(() => CaseField)
  complex_fields?: CaseField[];

  @Type(() => FieldType)
  collection_field_type?: FieldType;
}
