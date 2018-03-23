import { Component, Input } from '@angular/core';

@Component({
  selector: 'cut-alert',
  templateUrl: './alert.component.html',
  styleUrls: [
    './alert.component.scss'
  ]
})
export class AlertComponent {

  public static readonly TYPE_WARNING = 'warning';
  public static readonly TYPE_CONFIRMATION = 'confirmation';
  public static readonly TYPE_SUCCESS = 'success';

  @Input()
  public type: 'warning' | 'confirmation' | 'success' = AlertComponent.TYPE_WARNING;

  @Input()
  public showIcon: boolean = true;
}
