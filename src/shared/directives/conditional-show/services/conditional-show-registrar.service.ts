import { Injectable } from '@angular/core';
import { ConditionalShowFormDirective } from '../conditional-show-form.directive';

@Injectable()
export class ConditionalShowRegistrarService {
  registeredDirectives: ConditionalShowFormDirective[] = [];

  register(newDirective: ConditionalShowFormDirective): void {
      this.registeredDirectives.push(newDirective);
  }

  reset(): void {
    this.registeredDirectives = [];
  }
}
