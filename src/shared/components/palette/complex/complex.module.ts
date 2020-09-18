import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadComplexFieldTableComponent } from './read-complex-field-table.component';
import { ReadComplexFieldCollectionTableComponent } from './read-complex-field-collection-table.component';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { BaseFieldModule } from '../base-field/base-field.module';
import { WriteComplexFieldComponent } from './write-complex-field.component';
import { PaletteUtilsModule } from '../utils/utils.module';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { MarkdownModule } from '../../markdown/markdown.module';
import { ReadComplexFieldRawComponent } from './read-complex-field-raw.component';
import { ReadComplexFieldComponent } from './read-complex-field.component';
import { CaseLinkModule } from '../case-link/case-link.module';

@NgModule({
  imports: [
    CommonModule,
    BaseFieldModule,
    PaletteUtilsModule,
    ConditionalShowModule,
    MarkdownModule,
    CaseLinkModule
  ],
  providers: [
    IsCompoundPipe,
  ],
  declarations: [
    ReadComplexFieldComponent,
    ReadComplexFieldTableComponent,
    ReadComplexFieldCollectionTableComponent,
    ReadComplexFieldRawComponent,
    WriteComplexFieldComponent,
    FieldsFilterPipe,
  ],
  entryComponents: [
    ReadComplexFieldComponent,
    WriteComplexFieldComponent,
  ],
  exports: [
    WriteComplexFieldComponent,
    FieldsFilterPipe
  ]
})
export class ComplexModule {}
