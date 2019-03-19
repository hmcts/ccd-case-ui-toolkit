import { SearchResultViewItem } from '@hmcts/ccd-case-ui-toolkit';

export interface SearchResultViewItemComparator {
  compare(a: SearchResultViewItem, b: SearchResultViewItem): number;
}
