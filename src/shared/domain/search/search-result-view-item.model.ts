import { CaseField } from '../definition';
import { Type } from 'class-transformer';

// @dynamic
export class SearchResultViewItem {
  case_id: string;
  case_fields: object;
  @Type(()=> CaseField)
  hydrated_case_fields?: CaseField[];
  columns?: object;
}
