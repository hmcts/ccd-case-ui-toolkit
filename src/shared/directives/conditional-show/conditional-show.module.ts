import { NgModule } from '@angular/core';
import { ConditionalShowDirective } from './conditional-show.directive';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { ConditionalShowRegistrarService } from './services/conditional-show-registrar.service';
import { GreyBarService } from './services/grey-bar.service';

@NgModule({
  declarations: [
    ConditionalShowDirective
  ],
  exports: [
    ConditionalShowDirective
  ],
  providers: [
    FieldsUtils,
    ConditionalShowRegistrarService,
    GreyBarService
  ]
})
export class ConditionalShowModule {}
