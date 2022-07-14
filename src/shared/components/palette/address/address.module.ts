import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { FocusElementModule } from '../../../directives/focus-element';
import { MarkdownModule } from '../../markdown/markdown.module';
import { ComplexModule } from '../complex/complex.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteAddressFieldComponent } from './write-address-field.component';

@NgModule({
  imports: [
    ConditionalShowModule,
    CommonModule,
    ComplexModule,
    ReactiveFormsModule,
    MarkdownModule,
    PaletteUtilsModule,
    FocusElementModule
  ],
  declarations: [
    WriteAddressFieldComponent
  ],
  entryComponents: [
    WriteAddressFieldComponent,
  ]
})
export class AddressModule {}
