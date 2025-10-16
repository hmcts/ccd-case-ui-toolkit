import { Component } from '@angular/core';

@Component({
  selector: 'exui-routerlink',
  template: '<a [routerLink]="link"><ng-content></ng-content></a>',
  standalone: false
})

export class RouterLinkComponent {
  public link: string;
}
