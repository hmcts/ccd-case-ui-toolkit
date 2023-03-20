import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CaseReferencePipe } from './case-reference';
import { CcdCaseTitlePipe } from './case-title';
import { CcdCollectionTableCaseFieldsFilterPipe, CcdCYAPageLabelFilterPipe, CcdPageFieldsPipe, CcdTabFieldsPipe, LinkCasesReasonValuePipe, ReadFieldsFilterPipe } from './complex';
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
  LinkCasesReasonValuePipe
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
