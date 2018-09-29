import { NgModule } from '@angular/core';
import { ConditionalShowDirective } from './conditional-show.directive';
import { FieldsUtils } from '../utils/fields.utils';
import { ConditionalShowRegistrarService } from './conditional-show-registrar.service';

@NgModule({
  declarations: [
    ConditionalShowDirective
  ],
  exports: [
    ConditionalShowDirective
  ],
  providers: [
    FieldsUtils,
    ConditionalShowRegistrarService
  ]
})
export class ConditionalShowModule {}
