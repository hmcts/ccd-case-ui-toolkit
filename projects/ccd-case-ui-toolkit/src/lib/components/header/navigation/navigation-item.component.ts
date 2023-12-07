import { Component, Input } from '@angular/core';

@Component({
    selector: 'cut-nav-item',
    templateUrl: './navigation-item.html',
    styleUrls: ['./navigation-item.scss']
})
export class NavigationItemComponent {

  @Input()
  public label: string;

  @Input()
  public link: string;

  @Input()
  public imageLink: string;

}
