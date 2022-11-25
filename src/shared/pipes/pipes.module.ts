import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseReferencePipe } from './case-reference';
import { SortSearchResultPipe } from './search-result/sorting/sort-search-result.pipe';
import { CcdCaseTitlePipe } from './case-title';
import { LinkCasesReasonValuePipe } from './link-cases-reason-code';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CaseReferencePipe,
    SortSearchResultPipe,
    CcdCaseTitlePipe,
    LinkCasesReasonValuePipe
  ],
  exports: [
    CaseReferencePipe,
    SortSearchResultPipe,
    CcdCaseTitlePipe,
    LinkCasesReasonValuePipe
  ]
})
export class PipesModule {}
