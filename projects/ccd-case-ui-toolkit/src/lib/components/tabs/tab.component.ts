import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'cut-tab',
  templateUrl: './tab.component.html',
  styleUrls: [
    './tabs.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TabComponent {

  @Input()
  public id: string;

  @Input()
  public title: string;

  @Input()
  public selected: boolean;

}
