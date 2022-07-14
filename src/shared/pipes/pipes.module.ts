import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CaseReferencePipe } from './case-reference';
import { CcdCaseTitlePipe } from './case-title';
import { SortSearchResultPipe } from './search-result/sorting/sort-search-result.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CaseReferencePipe,
    SortSearchResultPipe,
    CcdCaseTitlePipe
  ],
  exports: [
    CaseReferencePipe,
    SortSearchResultPipe,
    CcdCaseTitlePipe
  ]
})
export class PipesModule {}
