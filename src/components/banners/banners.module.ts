import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertModule } from './alert/alert.module';
import { NotificationBannerModule } from './notification-banner/notification-banner.module';

@NgModule({
  imports: [
    CommonModule,
    AlertModule,
    NotificationBannerModule
  ],
  exports: [
    AlertModule,
    NotificationBannerModule
  ]
})
export class BannersModule {}
