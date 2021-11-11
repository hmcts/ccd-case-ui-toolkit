import { Injectable } from '@angular/core';
import { ConditionalShowDirective } from '../conditional-show.directive';

@Injectable()
export class ConditionalShowRegistrarService {
  registeredDirectives = [];

  register(newDirective: ConditionalShowDirective) {
      this.registeredDirectives.push(newDirective);
  }

  refresh() {
    this.registeredDirectives.forEach(dir => {
      dir.refreshVisibility();
    });
  }

  reset() {
    this.registeredDirectives = [];
  }
}
