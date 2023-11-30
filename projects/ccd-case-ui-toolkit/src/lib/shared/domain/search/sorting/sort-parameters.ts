import { SortOrder } from '../../sort-order.enum';
import { SearchResultViewItemComparator } from './search-result-view-item-comparator';

export class SortParameters {

  public comparator: SearchResultViewItemComparator;
  public sortOrder: SortOrder;

  constructor(comparator: SearchResultViewItemComparator, sortOrder: SortOrder) {
    this.comparator = comparator;
    this.sortOrder = sortOrder;
  }

}
