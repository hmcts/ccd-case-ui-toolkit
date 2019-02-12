import { CaseField } from '../definition';

export class SearchResultViewItem {
  case_id: string;
  case_fields: object;
  hydrated_case_fields?: CaseField[];
  columns?: object;
}
