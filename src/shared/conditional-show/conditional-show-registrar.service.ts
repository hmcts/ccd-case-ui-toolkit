import { Injectable } from '@angular/core';
import { ConditionalShowDirective } from './conditional-show.directive';

@Injectable()
export class ConditionalShowRegistrarService {
  registeredDirectives = [];

  register(newDirective: ConditionalShowDirective) {
      // console.log('[', this.registeredDirectives.length, ']adding new directive', newDirective.caseField.id);
      this.registeredDirectives.push(newDirective);
  }

  refresh() {
    this.registeredDirectives.forEach(dir => {
      // console.log('refreshing ', dir.caseField.id);
      dir.refreshVisibility()
    });
  }

  reset() {
    this.registeredDirectives = [];
  }
}
