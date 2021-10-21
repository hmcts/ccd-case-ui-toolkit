import { Injectable } from '@angular/core';
import { ConditionalShowFormDirective } from '../conditional-show-form.directive';

@Injectable()
export class ConditionalShowRegistrarService {
  registeredDirectives: ConditionalShowFormDirective[] = [];

  register(newDirective: ConditionalShowFormDirective): void {
      // console.log('[', this.registeredDirectives.length, ']adding new directive', newDirective.caseField.id);
      this.registeredDirectives.push(newDirective);
  }

  reset(): void {
    this.registeredDirectives = [];
  }
}
