import { Component, Input } from '@angular/core';

@Component({
  selector: 'cut-tab',
  templateUrl: './tab.component.html',
  styleUrls: [
    './tabs.component.scss'
  ],
})
export class TabComponent {

  @Input()
  public id: string;

  @Input()
  public title: string;

  @Input()
  public selected: boolean;

}
