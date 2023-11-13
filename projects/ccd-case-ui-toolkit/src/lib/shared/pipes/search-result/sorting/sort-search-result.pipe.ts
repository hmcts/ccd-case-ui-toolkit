import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from 'util';
import { SortOrder } from '../../../domain';
import { SearchResultViewItem } from '../../../domain/search/search-result-view-item.model';
import { SortParameters } from '../../../domain/search/sorting/sort-parameters';

@Pipe({
  name: 'ccdSortSearchResult'
})
export class SortSearchResultPipe implements PipeTransform {

  public transform(searchResults: SearchResultViewItem[], sortParameters: SortParameters) {

    if (isUndefined(searchResults) || isUndefined(sortParameters)) {
      return searchResults;
    }
    return searchResults.sort(
      (a, b) => {
        return sortParameters.comparator.compare(a, b)
                  * (sortParameters.sortOrder === SortOrder.DESCENDING ? 1 : -1);
      }
    );
  }

}
