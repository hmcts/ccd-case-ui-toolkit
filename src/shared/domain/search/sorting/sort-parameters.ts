import { SearchResultViewItemComparator } from './search-result-view-item-comparator';
import { SortOrder } from './sort-order';

export class SortParameters {

  comparator: SearchResultViewItemComparator;
  sortOrder: SortOrder;

  constructor(comparator: SearchResultViewItemComparator, sortOrder: SortOrder) {
    this.comparator = comparator;
    this.sortOrder = sortOrder;
  }

}
