import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityService, ActivityPollingService } from '../../services';
import { ActivityComponent } from './activity.component';
import { ActivityBannerComponent } from './activity-banner';
import { ActivityIconComponent } from './activity-icon';
import { SessionStorageService } from '../../services/session/session-storage.service';
import { RpxTranslationModule } from 'rpx-xui-translation';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        RpxTranslationModule.forChild()
    ],
    declarations: [
        ActivityComponent,
        ActivityBannerComponent,
        ActivityIconComponent,
    ],
    exports: [
        ActivityComponent,
        ActivityBannerComponent,
        ActivityIconComponent,
    ],
    providers: [
        ActivityService,
        ActivityPollingService,
        SessionStorageService
    ]
})
export class ActivityModule {}
