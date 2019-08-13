import { NgModule } from '@angular/core';
import { WriteAddressFieldComponent } from './write-address-field.component';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { ComplexModule } from '../complex/complex.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { FocusElementModule } from '../../../directives/focus-element';

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
