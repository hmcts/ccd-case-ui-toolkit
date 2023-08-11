// tslint:disable:variable-name
import { FieldType } from '../definition';

export class SearchResultViewColumn {
  public case_field_id: string;
  public case_field_type: FieldType;
  public display_context?: string;
  public display_context_parameter?: string;
  public label: string;
  public order: number;
}
