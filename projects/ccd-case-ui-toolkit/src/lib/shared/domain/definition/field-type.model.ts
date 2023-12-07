// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { CaseField } from './case-field.model';
import { FieldTypeEnum } from './field-type-enum.model';
import { FixedListItem } from './fixed-list-item.model';

// @dynamic
export class FieldType {
  public id: string;
  public type: FieldTypeEnum;
  public min?: number | Date;
  public max?: number | Date;
  public regular_expression?: string;

  @Type(() => FixedListItem)
  public fixed_list_items?: FixedListItem[];

  @Type(() => CaseField)
  public complex_fields?: CaseField[];

  @Type(() => FieldType)
  public collection_field_type?: FieldType;
}
