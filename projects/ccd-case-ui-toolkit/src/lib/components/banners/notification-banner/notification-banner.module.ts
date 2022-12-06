import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NotificationBannerComponent } from './notification-banner.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NotificationBannerComponent],
  exports: [NotificationBannerComponent]
})
export class NotificationBannerModule {}
