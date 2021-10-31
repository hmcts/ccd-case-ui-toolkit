import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseReferencePipe } from './case-reference';
import { SortSearchResultPipe } from './search-result/sorting/sort-search-result.pipe';
import { CcdCaseTitlePipe } from './case-title';

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
