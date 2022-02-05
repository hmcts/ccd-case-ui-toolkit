import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  @Output()
  public linkClicked: EventEmitter<string> = new EventEmitter<string>();

  public get notificationBannerType(): typeof NotificationBannerType {
    return NotificationBannerType;
  }

  public onLinkClick(triggerOutputEventText: string): void {
    this.linkClicked.emit(triggerOutputEventText);
  }
}
