import { NotificationBannerType } from '../enums/notification-banner-type.enum';

export interface NotificationBannerConfig {
  bannerType: NotificationBannerType;
  headingText: string;
  description: string;
  linkUrl: string;
  linkText: string;
  headerClass: string;
}
