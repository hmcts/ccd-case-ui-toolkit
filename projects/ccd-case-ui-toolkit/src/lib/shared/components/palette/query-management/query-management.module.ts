import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { PipesModule } from '../../../pipes';
import { QueryCreateComponent } from './components/query-create/query-create.component';
import { QueryDetailsTableComponent } from './components/query-details-table/query-details-table.component';
import { QueryDetailsComponent } from './components/query-details/query-details.component';
import { QueryListComponent } from './components/query-list/query-list.component';
import { QueryManagementErrorMessagesComponent } from './components/query-management-error-messages/query-management-error-messages.component';
import { ReadQueryManagementFieldComponent } from './read-query-management-field.component';
import { WriteQueryManagementFieldComponent } from './write-query-management-field.component';

@NgModule({
  declarations: [
    ReadQueryManagementFieldComponent,
    WriteQueryManagementFieldComponent,
    QueryDetailsComponent,
    QueryCreateComponent,
    QueryListComponent,
    QueryDetailsTableComponent,
    QueryManagementErrorMessagesComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RpxTranslationModule.forChild(),
    PipesModule
  ],
  exports: [
    ReadQueryManagementFieldComponent,
    WriteQueryManagementFieldComponent
  ],
})
export class QueryManagementModule {}
