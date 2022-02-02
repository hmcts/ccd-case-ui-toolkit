import { Component, Input } from '@angular/core';
import { NotificationBannerConfig } from './domain';
import { NotificationBannerType } from './enums';

@Component({
  selector: 'ccd-notification-banner',
  templateUrl: './notification-banner.component.html',
  styleUrls: ['./notification-banner.component.scss']
})
export class NotificationBannerComponent {
  @Input()
  public notificationBannerConfig: NotificationBannerConfig;

  public get notificationBannerType(): typeof NotificationBannerType {
    return NotificationBannerType;
  }
}
