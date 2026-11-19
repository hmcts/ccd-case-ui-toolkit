import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'exui-routerlink',
  template: '<a [routerLink]="link"><ng-content></ng-content></a>',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})

export class RouterLinkComponent {
  public link: string;
}
