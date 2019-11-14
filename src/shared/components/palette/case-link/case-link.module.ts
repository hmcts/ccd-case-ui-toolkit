import { NgModule } from '@angular/core';
import { ReadCaseLinkFieldComponent } from './read-case-link-field.component';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../../pipes';
import { PaletteUtilsModule } from '../utils/utils.module';

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
  ],
  exports: [
    ReadCaseLinkFieldComponent,
    WriteCaseLinkFieldComponent,
  ]
})
export class CaseLinkModule {}
