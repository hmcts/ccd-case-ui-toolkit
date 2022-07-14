import { NgModule } from '@angular/core';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { ConditionalShowFormDirective } from './conditional-show-form.directive';
import { ConditionalShowRegistrarService } from './services/conditional-show-registrar.service';
import { GreyBarService } from './services/grey-bar.service';

@NgModule({
  declarations: [
    ConditionalShowFormDirective
  ],
  exports: [
    ConditionalShowFormDirective
  ],
  providers: [
    FieldsUtils,
    ConditionalShowRegistrarService,
    GreyBarService
  ]
})
export class ConditionalShowModule {}
