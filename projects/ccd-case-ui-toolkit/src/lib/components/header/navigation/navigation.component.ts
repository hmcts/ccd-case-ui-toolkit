import { Component, Input } from '@angular/core';

@Component({
  selector: 'cut-nav-bar',
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.scss'],
  standalone: false
})
export class NavigationComponent {

  @Input()
  public isSolicitor: boolean;

}
