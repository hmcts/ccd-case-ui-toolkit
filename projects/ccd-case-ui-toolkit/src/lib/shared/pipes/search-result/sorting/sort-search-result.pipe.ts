import { Pipe, PipeTransform } from '@angular/core';
import { SortOrder } from '../../../domain';
import { SearchResultViewItem } from '../../../domain/search/search-result-view-item.model';
import { SortParameters } from '../../../domain/search/sorting/sort-parameters';

@Pipe({
  name: 'ccdSortSearchResult',
  standalone: false
})
export class SortSearchResultPipe implements PipeTransform {

  public transform(searchResults: SearchResultViewItem[], sortParameters: SortParameters) {

    if (searchResults === undefined || sortParameters === undefined) {
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
