import { Observable } from 'rxjs';
import { NotificationBannerType } from '../enums/notification-banner-type.enum';

export interface NotificationBannerConfig {
  bannerType: NotificationBannerType;
  headingText: Observable<string>;
  description: Observable<string>;
  showLink: boolean;
  linkUrl?: Observable<string>;
  linkText?: Observable<string>;
  triggerOutputEvent?: boolean;
  triggerOutputEventText?: Observable<string>;
  headerClass: string;
}
