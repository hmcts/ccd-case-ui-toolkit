import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { PipesModule } from '../../../pipes';
import { MarkdownComponent } from '../markdown';
import { QueryCaseDetailsHeaderComponent } from './components/query-case-details-header/query-case-details-header.component';
import { QueryCreateComponent } from './components/query-create/query-create.component';
import { QueryDetailsTableComponent } from './components/query-details-table/query-details-table.component';
import { QueryDetailsComponent } from './components/query-details/query-details.component';
import { QueryListComponent } from './components/query-list/query-list.component';
import { QueryWriteRaiseQueryComponent } from './components/query-write/query-write-raise-query/query-write-raise-query.component';
import {
  QueryWriteRespondToQueryComponent
} from './components/query-write/query-write-respond-to-query/query-write-respond-to-query.component';
import { ReadQueryManagementFieldComponent } from './read-query-management-field.component';
import { WriteQueryManagementFieldComponent } from './write-query-management-field.component';
import { MarkdownComponentModule } from '../markdown/markdown-component.module';

@NgModule({
  declarations: [
    ReadQueryManagementFieldComponent,
    WriteQueryManagementFieldComponent,
    QueryDetailsComponent,
    QueryCreateComponent,
    QueryListComponent,
    QueryDetailsTableComponent,
    QueryWriteRespondToQueryComponent,
    QueryWriteRaiseQueryComponent,
    QueryCaseDetailsHeaderComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RpxTranslationModule.forChild(),
    PipesModule,
    MarkdownComponentModule
  ],
  exports: [
    ReadQueryManagementFieldComponent,
    WriteQueryManagementFieldComponent
  ],
})
export class QueryManagementModule {}
