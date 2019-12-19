import { Component, Input } from '@angular/core';

@Component({
    selector: 'cut-nav-bar',
    templateUrl: './navigation.html',
    styleUrls: ['./navigation.scss']
})
export class NavigationComponent {

  @Input()
  public isSolicitor: boolean;

}
