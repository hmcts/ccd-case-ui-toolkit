import { Injectable } from '@angular/core';
import { ConditionalShowFormDirective } from '../conditional-show-form.directive';

@Injectable()
export class ConditionalShowRegistrarService {
  public registeredDirectives: ConditionalShowFormDirective[] = [];

  public register(newDirective: ConditionalShowFormDirective): void {
      this.registeredDirectives.push(newDirective);
  }

  public reset(): void {
    this.registeredDirectives = [];
  }
}
