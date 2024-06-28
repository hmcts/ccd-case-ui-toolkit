import { Component } from '@angular/core';

@Component({
  selector: 'exui-routerlink',
  template: '<a [routerLink]="link"><ng-content></ng-content></a>'
})

export class RouterLinkComponent {
  public link: string;
}
