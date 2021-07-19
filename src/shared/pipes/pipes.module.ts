import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseReferencePipe } from './case-reference';
import { SortSearchResultPipe } from './search-result/sorting/sort-search-result.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CaseReferencePipe,
    SortSearchResultPipe
  ],
  exports: [
    CaseReferencePipe,
    SortSearchResultPipe
  ]
})
export class PipesModule {}
