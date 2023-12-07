// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { CaseField } from '../definition';

// @dynamic
export class SearchResultViewItem {
  public case_id: string;
  public case_fields: object;
  @Type(() => CaseField)
  public hydrated_case_fields?: CaseField[];
  public columns?: object;
  public supplementary_data?: any;
  public display_context_parameter?: any;
}
