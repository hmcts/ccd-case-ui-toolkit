import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ConditionalShowModule } from '../../../directives/conditional-show';
import { MarkdownModule } from '../../markdown';
import { BaseFieldModule } from '../base-field';
import { CaseLinkModule } from '../case-link/case-link.module';
import { IsCompoundPipe, PaletteUtilsModule } from '../utils';
import { ReadFieldsFilterPipe } from './ccd-read-fields-filter.pipe';
import { CcdTabFieldsPipe } from './ccd-tab-fields.pipe';
import { CcdPageFieldsPipe } from './cdd-page-fields.pipe';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { ReadComplexFieldCollectionTableComponent } from './read-complex-field-collection-table.component';
import { ReadComplexFieldRawComponent } from './read-complex-field-raw.component';
import { ReadComplexFieldTableComponent } from './read-complex-field-table.component';
import { ReadComplexFieldComponent } from './read-complex-field.component';
import { WriteComplexFieldComponent } from './write-complex-field.component';
import { CcdCYAPageLabelFilterPipe } from './ccd-cyapage-label-filter.pipe';

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
    ReadFieldsFilterPipe,
    ReadComplexFieldComponent,
    WriteComplexFieldComponent,
    ReadComplexFieldRawComponent,
    ReadComplexFieldTableComponent,
    ReadComplexFieldCollectionTableComponent,
    CcdCYAPageLabelFilterPipe,
  ],
  entryComponents: [
    ReadComplexFieldComponent,
    WriteComplexFieldComponent,
  ],
    exports: [
        CcdPageFieldsPipe,
        FieldsFilterPipe,
        CcdTabFieldsPipe,
        ReadFieldsFilterPipe,
        WriteComplexFieldComponent,
        CcdCYAPageLabelFilterPipe
    ]
})
export class ComplexModule {}
