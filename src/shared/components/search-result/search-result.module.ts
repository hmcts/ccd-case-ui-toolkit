import { NgModule } from '@angular/core';
import { SearchResultComponent } from './search-result.component';
import { SearchResultViewItemComparatorFactory } from '../../services';
import { SortSearchResultPipe } from '../../pipes';

@NgModule({
  imports: [
  ],
  declarations: [
    SearchResultComponent
  ],
  exports: [
    SearchResultComponent,
    SearchResultViewItemComparatorFactory,
    SortSearchResultPipe
  ]
})
export class SearchResultModule {}
