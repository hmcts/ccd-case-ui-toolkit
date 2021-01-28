import { Component, Input } from '@angular/core';

enum AlertMessageType {
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error'
}

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
  public static readonly TYPE_ERROR = 'error';

  @Input()
  public type: AlertMessageType;
  alertMessageType = AlertMessageType;

  @Input()
  public showIcon = true;
}
