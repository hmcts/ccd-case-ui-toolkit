import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { ActivityPollingService } from '../../services/activity/activity.polling.service';
import { ActivityService } from '../../services/activity/activity.service';
import { ActivitySocketService } from '../../services';
import { SessionStorageService } from '../../services/session/session-storage.service';
import { ActivityBannerComponent } from './activity-banner';
import { ActivityIconComponent } from './activity-icon';
import { ActivityComponent } from './activity.component';
import { CaseActivityComponent } from './case-activity.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        RpxTranslationModule.forChild()
    ],
    declarations: [
        ActivityComponent,
        CaseActivityComponent,
        ActivityBannerComponent,
        ActivityIconComponent,
    ],
    exports: [
        ActivityComponent,
        CaseActivityComponent,
        ActivityBannerComponent,
        ActivityIconComponent,
    ],
    providers: [
        ActivityService,
        ActivityPollingService,
        ActivitySocketService,
        SessionStorageService,
    ]
})
export class ActivityModule {}
