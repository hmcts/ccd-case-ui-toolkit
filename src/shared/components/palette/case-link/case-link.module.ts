import { NgModule } from '@angular/core';
import { ReadCaseLinkFieldComponent } from './read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes';
import { PaletteUtilsModule } from '../utils/utils.module';
import { LinkedCasesTableComponent } from '../linked-cases/linked-cases-table.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PipesModule,
    PaletteUtilsModule,
  ],
  declarations: [
    ReadCaseLinkFieldComponent,
    WriteCaseLinkFieldComponent,
    LinkedCasesTableComponent
  ],
  exports: [
    ReadCaseLinkFieldComponent,
    WriteCaseLinkFieldComponent,
    LinkedCasesTableComponent
  ]
})
export class CaseLinkModule {}
