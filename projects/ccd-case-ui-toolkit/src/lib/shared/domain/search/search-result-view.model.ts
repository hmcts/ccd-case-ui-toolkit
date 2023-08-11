// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { Draft } from '../draft.model';
import { SearchResultViewColumn } from './search-result-view-column.model';
import { SearchResultViewItem } from './search-result-view-item.model';

// @dynamic
export class SearchResultView {
  @Type(() => SearchResultViewColumn)
  public columns: SearchResultViewColumn[];

  @Type(() => SearchResultViewItem)
  public results: SearchResultViewItem[];
  public result_error?: string;

  public hasDrafts() {
    return this.results[0]
    && this.results[0].case_id
    && Draft.isDraft(this.results[0].case_id);
  }
}
