import { Pipe, PipeTransform } from '@angular/core';
import { AlertComponent } from './alert.component';

@Pipe({
  name: 'cutAlertIconClass'
})
export class AlertIconClassPipe implements PipeTransform {
  private static readonly CLASS_WARNING = 'icon-alert';
  private static readonly CLASS_SUCCESS = 'icon-tick';

  public transform(type: string): string {
    switch (type) {
      case AlertComponent.TYPE_SUCCESS:
        return AlertIconClassPipe.CLASS_SUCCESS;
      case AlertComponent.TYPE_WARNING:
      default:
        return AlertIconClassPipe.CLASS_WARNING;
    }
  }
}
