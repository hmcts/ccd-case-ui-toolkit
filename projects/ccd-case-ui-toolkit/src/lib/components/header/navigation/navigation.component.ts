import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'cut-nav-bar',
    templateUrl: './navigation.html',
    styleUrls: ['./navigation.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NavigationComponent {

  @Input()
  public isSolicitor: boolean;

}
