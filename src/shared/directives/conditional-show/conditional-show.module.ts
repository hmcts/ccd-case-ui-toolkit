import { NgModule } from '@angular/core';
import { ConditionalShowDirective } from './conditional-show.directive';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { ConditionalShowRegistrarService } from './services/conditional-show-registrar.service';
import { GreyBarService } from './services/grey-bar.service';
import { ConditionalShowFormDirective } from './conditional-show-form.directive';

@NgModule({
  declarations: [
    ConditionalShowDirective,
    ConditionalShowFormDirective
  ],
  exports: [
    ConditionalShowDirective,
    ConditionalShowFormDirective
  ],
  providers: [
    FieldsUtils,
    ConditionalShowRegistrarService,
    GreyBarService
  ]
})
export class ConditionalShowModule {}
