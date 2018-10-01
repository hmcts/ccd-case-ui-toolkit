import { FixedListItem } from './fixed-list-item.model';
import { FieldTypeEnum } from './field-type-enum.model';
import { CaseField } from './case-field.model';
import { Type } from 'class-transformer';

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
