import { Pipe, PipeTransform } from '@angular/core';
import { isUndefined } from 'util';
import { SearchResultViewItem, SortOrder, SortParameters } from '../../../domain';

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
