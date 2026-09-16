import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { LabelSubstitutorDirective } from './label-substitutor.directive';
import { PlaceholderService } from './services/placeholder.service';

@NgModule({
  declarations: [
    LabelSubstitutorDirective
  ],
  exports: [
    LabelSubstitutorDirective
  ],
  providers: [
    FieldsUtils,
    CurrencyPipe,
    PlaceholderService
  ]
})
export class LabelSubstitutorModule {}
