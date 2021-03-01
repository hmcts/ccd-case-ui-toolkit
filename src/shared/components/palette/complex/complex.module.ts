import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadComplexFieldTableComponent } from './read-complex-field-table.component';
import { ReadComplexFieldCollectionTableComponent } from './read-complex-field-collection-table.component';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { BaseFieldModule } from '../base-field';
import { WriteComplexFieldComponent } from './write-complex-field.component';
import { PaletteUtilsModule } from '../utils';
import { IsCompoundPipe } from '../utils';
import { ConditionalShowModule } from '../../../directives/conditional-show';
import { MarkdownModule } from '../../markdown';
import { ReadComplexFieldRawComponent } from './read-complex-field-raw.component';
import { ReadComplexFieldComponent } from './read-complex-field.component';
import { CaseLinkModule } from '../case-link/case-link.module';
import { CcdTabFieldsPipe } from './ccd-tab-fields.pipe';
import { CcdPageFieldsPipe } from './cdd-page-fields.pipe';

@NgModule({
  imports: [
    CommonModule,
    MarkdownModule,
    CaseLinkModule,
    BaseFieldModule,
    PaletteUtilsModule,
    ConditionalShowModule
  ],
  providers: [
    IsCompoundPipe,
  ],
  declarations: [
    FieldsFilterPipe,
    CcdTabFieldsPipe,
    CcdPageFieldsPipe,
    ReadComplexFieldComponent,
    WriteComplexFieldComponent,
    ReadComplexFieldRawComponent,
    ReadComplexFieldTableComponent,
    ReadComplexFieldCollectionTableComponent,
  ],
  entryComponents: [
    ReadComplexFieldComponent,
    WriteComplexFieldComponent,
  ],
  exports: [
    CcdPageFieldsPipe,
    FieldsFilterPipe,
    CcdTabFieldsPipe,
    WriteComplexFieldComponent
  ]
})
export class ComplexModule {}
