import { NgModule } from '@angular/core';
import { FocusElementDirective } from './focus-element.directive';

@NgModule({
  declarations: [
    FocusElementDirective
  ],
  exports: [
    FocusElementDirective
  ]
})
export class FocusElementModule {
}
