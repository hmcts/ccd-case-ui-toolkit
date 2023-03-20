import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CaseReferencePipe } from './case-reference';
import { CcdCaseTitlePipe } from './case-title';
import { CcdCollectionTableCaseFieldsFilterPipe, CcdCYAPageLabelFilterPipe, CcdPageFieldsPipe, CcdTabFieldsPipe, ReadFieldsFilterPipe } from './complex';
import { LinkCasesFromReasonValuePipe } from './link-cases-from-reason-code/ccd-link-cases-from-reason-code.pipe';
import { LinkCasesReasonValuePipe } from './link-cases-reason-code/ccd-link-cases-reason-code.pipe';
import { SortSearchResultPipe } from './search-result/sorting/sort-search-result.pipe';

const pipeDeclarations = [
  CaseReferencePipe,
  SortSearchResultPipe,
  CcdCaseTitlePipe,
  CcdCollectionTableCaseFieldsFilterPipe,
  CcdCYAPageLabelFilterPipe,
  ReadFieldsFilterPipe,
  CcdTabFieldsPipe,
  CcdPageFieldsPipe,
  LinkCasesReasonValuePipe,
  LinkCasesFromReasonValuePipe
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ...pipeDeclarations
  ],
  exports: [
    ...pipeDeclarations
  ]
})
export class PipesModule {}
