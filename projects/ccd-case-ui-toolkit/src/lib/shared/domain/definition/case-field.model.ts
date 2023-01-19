import { Expose, Type } from 'class-transformer';
import * as _ from 'underscore';
import { WizardPageField } from '../../components/case-editor/domain/wizard-page-field.model';
import { Orderable } from '../order';
import { AccessControlList } from './access-control-list.model';
import { FieldTypeEnum } from './field-type-enum.model';
import { FieldType } from './field-type.model';

// @dynamic
export class CaseField implements Orderable {
  public id: string;
  public hidden: boolean;
  public hiddenCannotChange: boolean;
  public label: string;
  public order?: number;

  @Type(() => FieldType)
  public field_type: FieldType;

  public hint_text?: string;
  public security_label?: string;
  public display_context: string;
  public display_context_parameter?: string;
  public month_format?: string;
  public show_condition?: string;
  public show_summary_change_option?: boolean;
  public show_summary_content_option?: number;
  public acls?: AccessControlList[];
  public metadata?: boolean;
  public formatted_value?: any;
  public retain_hidden_value: boolean;
	
  @Type(() => WizardPageField)
  public wizardProps?: WizardPageField;

  public _value: any;
  public _list_items: any = [];

  @Expose()
  public get value(): any {
    if (this.isDynamic()) {
      return this._value && this._value.value ? this._value.value.code : this._value;
    } else {
      return this._value;
    }
  }

  public set value(value: any) {
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
  public get list_items(): any {
    if (this.isDynamic()) {
      return this._value && this._value.list_items ? this._value.list_items : this._list_items;
    } else {
      return this.field_type.fixed_list_items;
    }
  }

  public set list_items(items: any) {
    this._list_items = items;
  }

  @Expose()
  public get dateTimeEntryFormat(): string {
    if (this.isComplexDisplay()) {
      return null;
    }
    if (this.display_context_parameter) {
      return this.extractBracketValue(this.display_context_parameter, '#DATETIMEENTRY');
    }
    return null;
  }

  @Expose()
  public get dateTimeDisplayFormat(): string {
    if (this.isComplexEntry()) {
      return null;
    }
    if (this.display_context_parameter) {
      return this.extractBracketValue(this.display_context_parameter, '#DATETIMEDISPLAY');
    }
    return null;
  }

  @Expose()
  public isComplexDisplay() {
    return (this.isComplex() || this.isCollection()) && this.isReadonly();
  }

  @Expose()
  public isComplexEntry() {
    return (this.isComplex() || this.isCollection()) && (this.isOptional() || this.isMandatory());
  }

  @Expose()
  public isReadonly() {
    return !_.isEmpty(this.display_context)
      && this.display_context.toUpperCase() === 'READONLY';
  }

  @Expose()
  public isOptional() {
    return !_.isEmpty(this.display_context)
      && this.display_context.toUpperCase() === 'OPTIONAL';
  }

  @Expose()
  public isMandatory() {
    return !_.isEmpty(this.display_context)
      && this.display_context.toUpperCase() === 'MANDATORY';
  }

  @Expose()
  public isCollection(): boolean {
    return this.field_type && this.field_type.type === 'Collection';
  }

  @Expose()
  public isComplex(): boolean {
    return this.field_type && this.field_type.type === 'Complex';
  }

  @Expose()
  public isDynamic(): boolean {
    const dynamicFieldTypes: FieldTypeEnum[] = ['DynamicList', 'DynamicRadioList'];

    if (!this.field_type) {
      return false;
    }

    return dynamicFieldTypes.some(t => t === this.field_type.type);
  }

  @Expose()
  public isCaseLink(): boolean {
    return this.isComplex()
      && this.field_type.id === 'CaseLink'
      && this.field_type.complex_fields.some(cf => cf.id === 'CaseReference');
  }
  public extractBracketValue(fmt: string, paramName: string, leftBracket= '(', rightBracket= ')' ): string {
      fmt = fmt.split(',')
        .find(a => a.trim().startsWith(paramName));
      if (fmt) {
        const s = fmt.indexOf(leftBracket) + 1;
        const e = fmt.indexOf(rightBracket, s);
        if (e > s && s >= 0) {
          return fmt.substr(s, (e - s));
        }
      }
      return null;
  }
}
